"""Fit the head, eye sockets and lids in one coordinate system, then bake albedo."""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy.interpolate import RBFInterpolator
from scipy.optimize import least_squares
from scipy.spatial.transform import Rotation


class PortraitCamera:
    def __init__(self, anchors, pixels, profile=False):
        if profile:
            # The small walking panel shows only the near eye and ear. Use these
            # visible features; the far-eye estimate would turn the head forward.
            points=np.vstack([anchors[[468,4,152]],[-.083,-.009,-.015]])
            uv=np.array([[1308,43],[1318,53],[1311,72],[1283,49]] if profile=='male' else
                        [[1321,531],[1330,540],[1326,561],[1296,540]])
            yaw=1.46 if profile=='male' else 1.39
            def residual(params):
                matrix=Rotation.from_euler('xyz',[params[0],yaw,params[1]]).as_matrix()
                xy=(points@matrix.T)[:,:2]*[params[2],-params[2]]
                return np.r_[(xy+params[3:]-uv).ravel(),15*params[:2]]
            pitch,roll,scale,cx,cy=least_squares(residual,[0,0,240,*uv.mean(axis=0)]).x
            rot=Rotation.from_euler('xyz',[pitch,yaw,roll]).as_rotvec()
            params=np.r_[rot,scale,cx,cy]
        else:
            points, uv = anchors, pixels[:, :2]
            scale = np.ptp(uv[:, 1]) / np.ptp(points[:, 1])
            def residual(params):
                rotation = Rotation.from_rotvec(params[:3]).as_matrix()
                xy = (points @ rotation.T)[:, :2] * [params[3], -params[3]]
                return (xy + params[4:] - uv).ravel()
            params = least_squares(residual,[0,.22,0,scale,*uv.mean(axis=0)],loss='soft_l1',f_scale=4).x
        self.rotation = Rotation.from_rotvec(params[:3]).as_matrix()
        self.scale, self.center = params[3], params[4:]
    def project(self, xyz):
        return (xyz @ self.rotation.T)[..., :2] * [self.scale, -self.scale] + self.center


class Likeness:
    def __init__(self, sex, reference):
        controls = np.load(Path(__file__).with_name('visitor-controls.npz'))
        base = controls[sex+'_neutral'].astype(float)
        portrait, side = (controls[sex+'_'+key][:, :2] for key in ('ref','side'))
        self.camera = PortraitCamera(base, portrait)
        self.profile = PortraitCamera(base, side, sex)
        self.reference = np.array(reference.convert('RGB'))
        # Express each observed displacement in metres on the two camera planes.
        # The profile is small. Trust it mainly for the depth of the nose and jaw.
        offsets = []
        for p, front_uv, side_uv in zip(base, portrait, side):
            front = (front_uv - self.camera.project(p)) / [self.camera.scale, -self.camera.scale]
            profile = (side_uv - self.profile.project(p)) / [self.profile.scale, -self.profile.scale]
            # The detector hallucinates the hidden side in a true profile.
            # Restrict depth correction to the directly observed nose and chin.
            weight = .15 if abs(p[0]) < .018 else .025
            axes = np.vstack([self.camera.rotation[:2], weight*self.profile.rotation[:2], .37*np.eye(3)])
            offsets.append(np.linalg.lstsq(axes, [*front, *(weight*profile), 0, 0, 0], rcond=None)[0])
        offsets = np.clip(offsets, -.017, .017)
        # A smooth field also moves the eyes, lashes and the endpoints of a blink.
        # Fixed anchors keep the neck seam and rear skull seated in the rig.
        fixed = np.array([[x,y,z] for x in (-.075,0,.075) for y in (-.14,-.04,.07) for z in (-.085,-.04)])
        self.warp = RBFInterpolator(np.vstack([base,fixed])*10,
                                    np.vstack([offsets,np.zeros_like(fixed)]),smoothing=.0015,neighbors=48)
        self.neck_outline = np.array(
            [[204,222],[237,238],[293,242],[323,224],[322,259],[309,281],[287,305],
             [257,294],[218,275],[204,260]] if sex=="male" else
            [[214,765],[249,775],[318,783],[339,780],[338,825],[326,849],[314,864],
             [289,844],[254,826],[217,811]], dtype=np.int32)
        upper = [103,67,109,10,338,297,332]
        forehead = portrait[upper]-[0,39 if sex == "female" else 29]
        self.face_outline = cv2.convexHull(np.vstack([portrait[:468],forehead]).astype(np.float32))
        self.source_tone = np.median(self.reference[round(portrait[1,1])-7:round(portrait[1,1])+2,
                                                    round(portrait[1,0])-10:round(portrait[1,0])+8], axis=(0,1))

    def deform(self, xyz):
        # Large source assets include a body below the crop. Only fit the head.
        result=xyz.copy()
        mask=(xyz[:,1]>-.158)&(xyz[:,1]<.09)&(xyz[:,2]>-.062)
        p=xyz[mask]
        if len(p):
            gain=np.clip((p[:,1]+.158)/.032,0,1)*np.clip((p[:,2]+.062)/.060,0,1)
            result[mask]+=self.warp(p*10)*gain[:,None]
        return result

    def paint(self, image, uv, faces, xyz):
        width,height=image.size
        coord=np.zeros((height,width,3),np.float32)
        used=np.zeros((height,width),bool)
        pixels=uv*[width,height]-.5
        for tri in np.asarray(faces).reshape(-1,3):
            q=pixels[tri]
            lower=np.maximum(np.floor(q.min(axis=0)).astype(int),0)
            upper=np.minimum(np.ceil(q.max(axis=0)).astype(int),[width-1,height-1])
            basis=(q[1:]-q[0]).T
            if np.any(lower>upper) or abs(np.linalg.det(basis))<1e-6:continue
            x,y=np.meshgrid(np.arange(lower[0],upper[0]+1),np.arange(lower[1],upper[1]+1))
            weights=(np.stack([x,y],-1)-q[0])@np.linalg.inv(basis).T
            inside=(weights.min(axis=-1)>=-1e-5)&(weights.sum(axis=-1)<=1.00001)
            i,j=y[inside],x[inside]
            coord[i,j]=xyz[tri[0]]+weights[inside]@(xyz[tri[1:]]-xyz[tri[0]])
            used[i,j]=True
        mapped=self.camera.project(coord)
        mapped=mapped.astype('float32')
        src=self.reference
        # Remove only the broad side-to-side illumination gradient. Local colour
        # and contrast around the eyes, lips and cheeks belong to the sitter.
        soft=cv2.GaussianBlur(src,(0,0),32).astype(float)
        corrected=np.clip(src.astype(float)-.22*(soft-self.source_tone),0,255).astype(np.uint8)
        sample=cv2.remap(corrected,mapped,None,cv2.INTER_LINEAR)
        mask=np.zeros(src.shape[:2],np.uint8)
        cv2.fillConvexPoly(mask,self.face_outline.astype(int),255)
        distance=cv2.distanceTransform(mask,cv2.DIST_L2,5)
        margin=cv2.remap(distance,mapped,None,cv2.INTER_LINEAR)
        # Suppress self-occluded projections at the temples and under the jaw.
        depth=(coord@self.camera.rotation[2]).astype(np.float32)
        ix,iy=np.rint(mapped[used]).astype(int).T
        ix,iy=np.clip(ix,0,src.shape[1]-1),np.clip(iy,0,src.shape[0]-1)
        closest=np.full(src.shape[:2],-1,np.float32)
        np.maximum.at(closest,(iy,ix),depth[used])
        closest=cv2.dilate(closest,np.ones((3,3),np.uint8))
        overlap=cv2.remap(closest,mapped,None,cv2.INTER_NEAREST)-depth
        clear=np.clip((.030-overlap)/.015,0,1)
        face=np.clip(margin/17,0,1)*np.clip((coord[:,:,2]-.018)/.045,0,1)
        neck_region=np.zeros_like(mask)
        cv2.fillConvexPoly(neck_region,self.neck_outline,255)
        neck_margin=cv2.remap(cv2.distanceTransform(neck_region,cv2.DIST_L2,5),mapped,None,cv2.INTER_LINEAR)
        neck=np.clip(neck_margin/12,0,1)*np.clip((coord[:,:,2]+.021)/.060,0,1)
        alpha=np.maximum(face,neck)*clear*used
        base=np.array(image.convert('RGB'),float)
        return Image.fromarray(np.clip(base+(sample-base)*alpha[:,:,None],0,255).astype('uint8'))
