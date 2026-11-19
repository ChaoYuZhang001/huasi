# 模型来源 / Model credits

## lion-wipo.glb — 山门石狮 / gate lions

- 原作 / Original: "Chinese guardian lions at the WIPO - High poly" (STL, 835,585 faces), a photogrammetry scan by **Rama**, 15 August 2023.
  https://commons.wikimedia.org/wiki/File:Chinese_guardian_lions_at_the_WIPO-High_poly.stl
- 许可 / License: the uploader offers CC BY-SA 3.0 FR, CC BY-SA 2.0 FR or CeCILL. This copy is used under **CC BY-SA 3.0 FR**:
  https://creativecommons.org/licenses/by-sa/3.0/fr/
- 改动 / Changes made here: simplified to 17,997 faces, ambient occlusion baked into vertex colours, quantised and meshopt-compressed (147 KB). In the scene the same model stands on both sides of the gate, the east one mirrored.
- 这个改动后的模型同样以 CC BY-SA 3.0 FR 发布。The modified model in this folder is released under the same license, CC BY-SA 3.0 FR, with the same attribution to Rama.

The rest of this repository (code, other assets) keeps its own terms; the share-alike condition applies to this model file.

## 三四原创门派美术

少林天王殿、大雄宝殿、白衣殿、六祖堂、紧那罗殿与千佛殿共用十六尊分别制作的造像。原创游戏美术参考保存在 `art/refs/` 与 `art/refs/shaolin/`。达摩使用独立的正、侧、背三视图重建面部与衣袍。其余十五尊亦有各自的正面与侧面参考，依轮廓与估算深度建模，有些未绘制的背面由衣纹延展。它们是《三四》的美术演绎。达摩面壁题材另可参阅[克利夫兰艺术博物馆](https://www.clevelandart.org/art/1972.41)。

山门弥勒沿用本项目的布袋弥勒像，韦驮及天王殿前两尊金刚另行制作，正侧面美术参考为 `art/refs/shaolin/gate-protectors.jpg`。立雪亭沿用达摩模型，另配铜色材质。

离线建模脚本 `tools/bake-shaolin.py` 使用 [Depth Anything V2 Small](https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf) 估算参考图的相对深度。发布模型经过减面与 Meshopt 压缩。浏览器直接加载各殿的 GLB。

峨眉清音学舍的茶芽标本与茶圃共用原创叶形和叶脉材质。

武当、峨眉、华山、崆峒另有十九种原创造像模型，正面与严格侧面参照收在 `art/refs/schools/`，其中 `prompts.txt` 记录内置图像生成工具的提示词。运行上述离线脚本时加 `--collection schools` 可重建此组。武当与崆峒按各自的殿宇供奉真武，峨眉中院沿用释迦牟尼像，普贤的六牙白象使用场景几何搭建。

武当三清殿的灵宝天尊、元始天尊、道德天尊和三四镇财神殿的赵公明来自原创彩绘木雕设定。正侧面参考图在 `art/refs/schools/sanqing-caishen.jpg`，四尊独立模型在 `models/schools/`。使用 `--collection sanqing-caishen` 可分别烘焙这四尊模型。
