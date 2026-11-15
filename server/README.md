# 附近的人 · 多人同房服务端

网页和中转现在是**同一个 Cloudflare Worker**（名字 `huasi`）：网站文件由静态资源层直接返回，只有 `/ws` 和 `/health` 会运行 `server/worker.js`。配置在仓库根目录的 `wrangler.jsonc`。

推送到 `main`，Cloudflare 会自动重新部署（控制台里 Workers Builds 已连接本仓库，根目录 `/`，部署命令 `npx wrangler deploy`），不需要在本机运行任何部署命令。`.assetsignore` 决定哪些文件**不**作为网站公开：`server/`、`art/`、配置文件和说明文档都不对外提供。

## 它做什么

- 距离 3 公里以内的访客互相可见：能看到对方的名字、位置和动作（行走、礼拜、合十、静坐）。没有聊天，没有账号。
- 位置来源有两种：
  - **默认**：按访客 IP 定位。这是城市级精度，通常偏差几公里到几十公里，**做不到 3 公里**。同一城市的访客往往被定位到同一个点，于是互相可见，界面显示为「同城 · N 人」。
  - **精确**：访客在菜单里点「附近的人」并同意浏览器的定位请求后，用真实坐标匹配，界面显示为「附近 3km · N 人」。只有双方都授权时，3 公里才是准的。
- 坐标只在服务端用来判断谁离谁近：取整到约 100 米，只存在内存里，连接断开即丢弃，不写入存储，也不会发给其他访客。对方只收到一个临时编号、名字、外观编号和动作。

## 地址与来源限制

- 网站：`https://huasi.<账号子域>.workers.dev`；中转：同一地址的 `/ws`。
- 页面从同一个地址打开时自动连接，不需要配置。GitHub Pages 副本（`chaoyuzhang001.github.io/huasi`）会跨域连接到上面的 Worker。
- `wrangler.jsonc` 的 `ALLOWED_ORIGINS` 列出允许跨域连接的网址；同源永远允许，没有 `Origin` 头的连接会被拒绝。
- 绑定自己的域名：控制台 → Workers & Pages → `huasi` → Settings → Domains & Routes → Add → Custom domain；或在 `wrangler.jsonc` 里加 `"routes": [{ "pattern": "example.com", "custom_domain": true }]`。

## 本地测试

不需要 Cloudflare 账号。`dev_server.py` 是协议相同的本地替身，自带三个会走动的香客：

```bash
python3 server/dev_server.py
```

然后打开 `http://localhost:8848/index.html?mp=ws://127.0.0.1:8849`（`?mp=` 参数只在 localhost 下生效）。

要在本地运行真正的 Worker（网站 + 中转），在仓库根目录执行 `npx wrangler dev`。

## 用量与限制

- 免费版 Durable Object 每天 10 万次请求，WebSocket 消息按 20 条算 1 次。页面走动时每秒发 5 条位置，站着不动每 3 秒发 1 条心跳。粗略估算，持续走动时全站一天合计约 110 小时在线就会用完；超出后新连接失败，页面自动退回单机。
- 中转逻辑已用本地 `wrangler dev` 实测（握手、来源限制、3 公里匹配、限速、坐标不外泄）。多台真机同时在线尚未测过。
- `workers.dev` 在中国大陆连通性不稳定；连不上时页面自动退回单机，界面上不显示「附近」计数。绑定自己的域名后通常更稳。
- 按 0.5 度（约 55 公里）划分房间。恰好分处两个格子边界两侧的近邻互相看不到。
- 每个房间上限 400 人，客户端最多同时显示 24 人。
