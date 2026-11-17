// The page sets globalThis.__SHANSI_THREE to the three.js instance it settled on
// (local file or a CDN fallback) before importing the loader. Every vendor module
// reads it from here, so loader and page always share one engine instance.
const T = globalThis.__SHANSI_THREE;
if (!T) throw new Error('engine not bound: set globalThis.__SHANSI_THREE before importing the loader');
export const {
	AnimationClip, Bone, Box3, BufferAttribute, BufferGeometry, ClampToEdgeWrapping, Color,
	ColorManagement, DirectionalLight, DoubleSide, FileLoader, FrontSide, Group, ImageBitmapLoader,
	InstancedMesh, InterleavedBuffer, InterleavedBufferAttribute, Interpolant, InterpolateDiscrete,
	InterpolateLinear, Line, LineBasicMaterial, LineLoop, LineSegments, LinearFilter,
	LinearMipmapLinearFilter, LinearMipmapNearestFilter, LinearSRGBColorSpace, Loader, LoaderUtils,
	Material, MathUtils, Matrix4, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial,
	MirroredRepeatWrapping, NearestFilter, NearestMipmapLinearFilter, NearestMipmapNearestFilter,
	NumberKeyframeTrack, Object3D, OrthographicCamera, PerspectiveCamera, PointLight, Points,
	PointsMaterial, PropertyBinding, Quaternion, QuaternionKeyframeTrack, RepeatWrapping, Skeleton,
	SkinnedMesh, Sphere, SpotLight, Texture, TextureLoader, TriangleFanDrawMode, TriangleStripDrawMode,
	TrianglesDrawMode, Vector2, Vector3, VectorKeyframeTrack, SRGBColorSpace, InstancedBufferAttribute,
	Float32BufferAttribute,
	DataTextureLoader, DataUtils, FloatType, HalfFloatType,
} = T;
