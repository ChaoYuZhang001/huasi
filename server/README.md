# 附近的人 · 多人同房服务端

网页和中转是**同一个 Cloudflare Worker**（名字 `huasi`）：网站文件由静态资源层直接返回，只有 `/ws` 和 `/health` 会运行 `server/worker.js`。配置在仓库根目录的 `wrangler.jsonc`。

`.assetsignore` 决定哪些文件**不**作为网站公开：`server/`、`art/`、配置文件和说明文档都不对外提供。

## 部署

- **自动**：Cloudflare 控制台里的 Workers Builds 已连接本仓库（根目录 `/`，部署命令 `npx wrangler deploy`），推送到 `main` 后由 Cloudflare 构建并发布。如果推送后线上没有更新（2026-11-15 夜间出现过，原因未查明），用下面的手动方式。
- **手动**：

  ```bash
  CLOUDFLARE_API_TOKEN=<token> sh server/deploy.sh
  ```

  脚本先导出一份已提交内容的干净副本，再发布这份副本。Token 在控制台「My Profile → API Tokens → Create Token」用「Edit Cloudflare Workers」模板创建；脚本只从环境变量读取，不保存也不打印。这条路只访问 `api.cloudflare.com`，在打不开 `dash.cloudflare.com` 登录页（`wrangler login` 会超时）的网络下也能用。

**不要在仓库目录里直接运行 `wrangler deploy`。** 它发布的是工作区当前的全部文件：未提交的改动、草稿页面、日志文件都会变成公开网址。

发布后可以这样确认：

```bash
curl -s https://sansitemple.com/health
```

返回 `ok` 说明中转在运行。

## 它做什么

- 距离 3 公里以内的访客互相可见：能看到对方的名字、位置和动作（行走、礼拜、合十、静坐）。没有聊天，没有账号。
- 位置来源有两种：
  - **默认**：按访客 IP 定位。这是城市级精度，通常偏差几公里到几十公里，**做不到 3 公里**。同一城市的访客往往被定位到同一个点，于是互相可见，界面显示为「同城 · N 人」。
  - **精确**：访客在菜单里点「附近的人」并同意浏览器的定位请求后，用真实坐标匹配，界面显示为「附近 3km · N 人」。只有双方都授权时，3 公里才是准的。
- 坐标只在服务端用来判断谁离谁近：取整到约 100 米，只存在内存里，连接断开即丢弃，不写入存储，也不会发给其他访客。对方只收到一个临时编号、名字、外观编号和动作。

## 地址与来源限制

- 网站：`https://sansitemple.com`、`https://www.sansitemple.com`、`https://huasi.<账号子域>.workers.dev`；中转是各自地址下的 `/ws`。
- 自定义域名在 `wrangler.jsonc` 的 `routes` 里声明，部署时自动创建解析记录和证书。声明自定义域名后 `workers.dev` 默认会被关闭，所以配置里显式写了 `"workers_dev": true`。
- 页面从上述任一地址打开时自动连接同一地址的中转，不需要配置。GitHub Pages 副本（`chaoyuzhang001.github.io/huasi`）会跨域连接到 `workers.dev` 上的中转。
- `wrangler.jsonc` 的 `ALLOWED_ORIGINS` 列出允许跨域连接的网址；同源永远允许，没有 `Origin` 头的连接会被拒绝。

## 本地测试

不需要 Cloudflare 账号。`dev_server.py` 是协议相同的本地替身，自带三个会走动的香客：

```bash
python3 server/dev_server.py
```

然后打开 `http://localhost:8848/index.html?mp=ws://127.0.0.1:8849`（`?mp=` 参数只在 localhost 下生效）。

要在本地运行真正的 Worker（网站 + 中转），在仓库根目录执行 `npx wrangler dev`。

## 用量与限制

- 免费版 Durable Object 每天 10 万次请求，WebSocket 消息按 20 条算 1 次。页面走动时每秒发 5 条位置，站着不动每 3 秒发 1 条心跳。粗略估算，持续走动时全站一天合计约 110 小时在线就会用完；超出后新连接失败，页面自动退回单机。
- 中转逻辑已在线上用真实连接实测（2026-11-16）：握手与来源限制、3 公里匹配、名字清洗、限速、越界位置丢弃、离开通知、坐标不外泄、按 IP 定位的分支。多台真机同时在线尚未测过。
- `workers.dev` 在中国大陆连通性不稳定；连不上时页面自动退回单机，界面上不显示「附近」计数。自定义域名通常更稳，但尚未在大陆网络下实测。
- 按 0.5 度（约 55 公里）划分房间。恰好分处两个格子边界两侧的近邻互相看不到。
- 每个房间上限 400 人，客户端最多同时显示 24 人。
