# 游客角色模型

玩家使用各自的贴图头模 `visitor-male.glb`、`visitor-female.glb`。首次加载或资源不可用时保留程序生成的头部。眉、睫毛、眼球和头发按各自脸部网格重新贴合；眨眼驱动面部和睫毛的形变，不压缩眼球。

**素材与复现：** 基体、青年男女宏观形变、睁眼/闭眼、嘴角形变、高模眼球及棕色眼图来自 [MakeHuman](https://github.com/makehumancommunity/makehuman/tree/a8bc2d54ff0ac92e78ff71431b1023eda42bf482/makehuman/data)。肤色纹理、short01、ponytail01、eyebrow009 和 eyelashes01 来自 [MakeHuman 系统 CC0 素材清单](https://github.com/makehumancommunity/makehuman-static-website/blob/master/content/Assets/AssetPacks/makehuman_system_assets.md)，所用系统资产[镜像版本](https://github.com/dmaugis/makehuman-py3-assets/tree/2f4033a364a7e97479e17ed630ccb999395730c6/base)。角色不是对演员的扫描或复刻。

将基体命名为 `base.obj`；两套 `asian-{male,female}-young.target` 和 `young_lightskinned_{male,female}_diffuse3.png` 分别简写为 `male/female.target` 和 `male/female.png`；眼球 OBJ 和 mhclo 命名为 `hi-eyes.*`，棕色眼图命名为 `eyes.png`。其余部件各放同名 OBJ、mhclo、PNG（去掉发色纹理名的 `_diffuse`），表情 target 保留原名。用装有 NumPy、Pillow、SciPy、OpenCV 的 Python 运行 `python tools/bake-visitor-heads.py SOURCE_DIR CASTING_SHEET.png`。第二个参数是本项目确认的 1536 × 1024 双人选角图。左列脸部的对应点保存在 `tools/visitor_likeness.py`，用于将肤色和皮肤细节烘焙到头模 UV。打包仅保留头颈网格和对应纹理区域。

脸部网格取自 MakeHuman 官方仓库 `makehuman/data/3dobjs/base.obj` 的 `body` 分组。源文件注明该资产于 2020 年 9 月以 CC0 发布。原始来源：https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/3dobjs/base.obj 。复现：`python3 tools/import-portrait.py /path/to/base.obj`。人物服装、发型和配色为本项目的美术设计，不是历史服制复原或电视剧演员肖像。
