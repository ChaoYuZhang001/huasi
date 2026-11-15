# 附近的人 · 多人同房服务端

网页本身是静态文件，多人功能需要一个中转服务。这里用 Cloudflare Worker + Durable Object，免费额度即可起步，地址是 `*.workers.dev`，不需要自定义域名或备案。

## 它做什么

- 距离 3 公里以内的访客互相可见：能看到对方的名字、位置和动作（行走、礼拜、合十、静坐）。没有聊天，没有账号。
- 位置来源有两种：
  - **默认**：按访客 IP 定位。这是城市级精度，通常偏差几公里到几十公里，**做不到 3 公里**。同一城市的访客往往被定位到同一个点，于是互相可见，界面显示为「同城 · N 人」。
  - **精确**：访客在菜单里点「附近的人」并同意浏览器的定位请求后，用真实坐标匹配，界面显示为「附近 3km · N 人」。只有双方都授权时，3 公里才是准的。
- 坐标只在服务端用来判断谁离谁近：取整到约 100 米，只存在内存里，连接断开即丢弃，不写入存储，也不会发给其他访客。

## 部署

需要你自己的 Cloudflare 账号和 Node.js。

```bash
npm install -g wrangler
```

```bash
wrangler login
```

```bash
cd server && wrangler deploy
```

部署成功后会得到形如 `https://huashan-nearby.<你的子域>.workers.dev` 的地址。在 `index.html` 的 `<head>` 里加一行（注意把 `https` 换成 `wss`）：

```html
<script>window.HUASHAN_MP='wss://huashan-nearby.<你的子域>.workers.dev';</script>
```

不加这一行，多人功能完全关闭，页面和以前一样是单机。

`wrangler.toml` 里的 `ALLOWED_ORIGINS` 限定了哪些网址可以连接，换了发布地址要同步改。

## 本地测试

不需要 Cloudflare。`dev_server.py` 是协议相同的本地替身，自带三个会走动的香客：

```bash
python3 server/dev_server.py
```

然后打开 `http://localhost:8848/index.html?mp=ws://127.0.0.1:8849`（`?mp=` 参数只在 localhost 下生效）。

## 已知限制

- `worker.js` 尚未在真实的 Cloudflare 环境里运行过，只用本地替身验证了客户端和协议。首次部署后请用两台设备实测。
- `workers.dev` 在中国大陆的连通性不稳定。连不上时页面会自动退回单机，不影响其他功能。
- 按 0.5 度（约 55 公里）划分房间。恰好分处两个格子边界两侧的近邻互相看不到。
- 每个房间上限 400 人，客户端最多同时显示 24 人。
