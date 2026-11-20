# 游客角色模型

首页的两张人物缩图取自游戏内的游客。自己和同行玩家共用同一套人物资源。每个 GLB 包含头颈、眼球、睫毛和头发。眉毛与面部一起烘焙，眨眼同时驱动眼睑和睫毛。女游客的马尾有独立轮廓，会随步伐轻摆，发根保持固定。

## 素材

头颈基体、青年男女形变、表情与眼球来自 [MakeHuman 模型库](https://github.com/makehumancommunity/makehuman/tree/a8bc2d54ff0ac92e78ff71431b1023eda42bf482/makehuman/data)。肤色底图、棕色眼图及 eyelashes01 睫毛使用其系统素材。[CC0 素材清单](https://github.com/makehumancommunity/makehuman-static-website/blob/master/content/Assets/AssetPacks/makehuman_system_assets.md) · [使用的素材版本](https://github.com/dmaugis/makehuman-py3-assets/tree/2f4033a364a7e97479e17ed630ccb999395730c6/base)

人物外观依据项目提供的 1536 × 1024 像素双人六格参考图。近景提供肤色、眉眼、唇形、发际和前额发纹。行走侧影用于约束鼻尖、下颌和发量。头发遮住的区域和背部发流由建模补足。上衣正面、口袋、盘扣、袖片和下装布纹取自同一张参考图。背部衣片使用参考图中的布料重建。女装的包带绕过右肩，接到左胯的皮包。包盖和搭扣取自行走侧影，手指遮住的一小段包面用相邻皮纹补齐。

## 重新烘焙

使用安装了 NumPy、SciPy、Pillow 和 OpenCV 的 Python。准备以下本地输入。

- 将基体保存为 `base.obj`。将 `asian-{male,female}-young.target` 和 `young_lightskinned_{male,female}_diffuse3.png` 分别命名为 `male.target`、`female.target` 和 `male.png`、`female.png`。
- 眼球使用 `hi-eyes.obj`、`hi-eyes.mhclo` 和 `eyes.png`。睫毛的 OBJ、mhclo 和 PNG 使用 `eyelashes01` 前缀。眼睑和嘴角表情 target 保留原名。
- `tools/visitor-controls.npz` 保存每人的 478 组对应点。`neutral` 是中性头模表面以米计的三维坐标，`ref` 和 `side` 的前两列分别是近景和走路侧影在原图中的像素坐标。更换选角图时，需重新标定这些点和发型轮廓。

```sh
python tools/bake-visitor-heads.py SOURCE_DIR CASTING_SHEET.png
python tools/bake-visitor-tailoring.py CASTING_SHEET.png
```
