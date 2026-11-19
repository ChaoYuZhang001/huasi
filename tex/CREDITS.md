# 实拍贴图来源

全部为 CC0（公有领域），可自由使用，无需署名。这里仍记录来源以便追溯。

| 用途 | 文件夹 | 来源 | 作者 |
|---|---|---|---|
| 院落石板铺地 | granite_tile | [Poly Haven · Granite Tile](https://polyhaven.com/a/granite_tile) | Charlotte Baglioni |
| 台基、石墙 | granite_wall | [Poly Haven · Granite Wall](https://polyhaven.com/a/granite_wall) | Dimitrios Savva |
| 山崖、巨石 | cliff_side | [Poly Haven · Cliff Side](https://polyhaven.com/a/cliff_side) | James Ray Cock, Jenelle van Heerden, Dario Barresi |
| 屋瓦 | grey_roof_tiles | [Poly Haven · Grey Roof Tiles](https://polyhaven.com/a/grey_roof_tiles) | Rob Tuytel |
| 松树皮 | knotted_pine_bark | [Poly Haven · Knotted Pine Bark](https://polyhaven.com/a/knotted_pine_bark) | Dimitrios Savva |
| 苔藓石板 | mossy_paving | [ambientCG · Paving Stones 138](https://ambientcg.com/view?id=PavingStones138) | ambientCG |

`1k/` 给电脑，`512/` 给手机。每套三张：`color`（颜色，sRGB）、`normal`（OpenGL 法线）、`rough`（粗糙度）。

石板、石墙、岩壁、屋瓦与苔藓的实际显示色已离线烘到同目录的 `color-temple.webp`，尺寸与原图一致。树皮颜色、法线和粗糙度仍使用原 JPG。五套原始颜色 JPG 保留供再生成；游戏不再请求这些原图，Cloudflare 静态资源打包也忽略它们。

从项目根目录运行 `python3 tools/bake-surfaces.py` 可重建十张贴图（需要 NumPy、支持 WebP 的 Pillow）。脚本沿用原来的亮度、饱和度和染色公式；只在解码后的 RGB 均方根误差 ≤ 2/255 且 99% 通道误差 ≤ 6/255 的候选中选体积最小者。此处的数值指 8 位 sRGB 编码值，不是渲染帧的相似度。

首页的三四镇全景取材于游戏里的镇门、长街与石桥，为本项目生成的原创绘景。安装图标和分享预览使用同一幅画。
