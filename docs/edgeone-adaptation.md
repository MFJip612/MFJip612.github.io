# EdgeOne Makers 适配说明

本文记录项目从 Cloudflare Workers 迁移到腾讯云 EdgeOne Makers 后的运行模型、构建产物、配置项和验证结果。

## 1. 迁移结果

- 运行目标：EdgeOne Makers Cloud Functions（Node.js 20），不再包含 Cloudflare Workers 运行分支。
- 构建方式：`@edgeone/vite-core` 的 TanStack Start 适配器，构建产物在 `.edgeone/`。
- 数据库：Prisma 7 + `@prisma/adapter-pg`，通过 `DATABASE_URL` 直连外部 PostgreSQL（TCP）。
- 图片：sharp 0.35 原生模块随函数包分发，继续写入 S3 兼容对象存储。
- 图片上传上限：从 10MB 调整为 6MB，匹配 Cloudflare/EdgeOne 云函数请求体上限。

## 2. Cloudflare → EdgeOne 对照

| 原 Cloudflare 实现                           | 迁移后                                        |
| -------------------------------------------- | --------------------------------------------- |
| `@cloudflare/vite-plugin` + `wrangler.jsonc` | `edgeone.json` + EdgeOne Vite 适配器          |
| `cloudflare:workers` 的 `env` binding        | Node.js `process.env`                         |
| `HYPERDRIVE` binding                         | `DATABASE_URL`                                |
| Cloudflare Images binding                    | sharp 原生模块                                |
| `.dev.vars`                                  | EdgeOne 控制台环境变量；本地使用 `.env`       |
| `wrangler deploy`                            | Git 集成或 `edgeone makers deploy ./.edgeone` |
| `DEPLOY_TARGET=cloudflare/node` 分支         | 单一 Node 运行时                              |

## 3. 运行模型

```
浏览器
  ↓
EdgeOne 边缘：静态资源、路由、缓存
  ↓ 未命中静态资源
.cloud-functions/ssr-node/handler.js（Node.js 20）
  ├─ Node IncomingMessage → Web Request
  ├─ TanStack Start fetch → Web Response
  ├─ Prisma → PostgreSQL（DATABASE_URL）
  └─ sharp → 私有 S3 / 公开 S3
```

- 请求转换由 EdgeOne 适配器生成：从 `x-forwarded-proto`、`eo-pages-host` / `x-forwarded-host` / `host` 还原请求 URL。
- `src/server/auth/origin.ts` 与 `src/server/auth/session.ts` 额外读取 `x-forwarded-proto`，避免代理未透传协议时同源校验失败或 Cookie 丢失 `Secure`。
- 项目没有 `addEventListener("fetch")`、`waitUntil`、定时触发或队列消费者；事件监听迁移为 N/A。客户端 `beforeunload` / `click` 监听属于浏览器行为，不受影响。

## 4. 环境变量

### 4.1 运行期（EdgeOne 控制台配置）

- `DATABASE_URL`
- `AUTH_ISSUER`
- `AUTH_CLIENT_ID`
- `AUTH_CLIENT_SECRET`
- `AUTH_REDIRECT_URI`（必须指向线上域名的 `/api/auth/callback/`）
- `AUTH_COOKIE_SECRET`（≥32 字符）
- `ADMIN_OIDC_SUBJECTS`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_PUBLIC_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_SESSION_TOKEN`（可选）
- `S3_FORCE_PATH_STYLE`

### 4.2 构建期

- `VITE_SITE_URL`：必须是线上访问的精确 origin；写接口同源校验会以它作为兜底。
- `VITE_MEDIA_BASE_URL`：公开图片域名，必须 HTTPS。

`VITE_*` 在构建时写入客户端 bundle，修改后需要重新部署。

## 5. 构建与部署

### 5.1 构建产物

```bash
bun run build
```

产物结构：

```
.edgeone/
  assets/                         # 静态资源（对应站点根路径）
  cloud-functions/ssr-node/
    handler.js                    # Node.js SSR 入口
    config.json                   # Build Output API v3 路由
    node_modules/                 # sharp / pg 等外部依赖
```

构建前会执行 `scripts/clean.mjs` 清空 `dist` 与 `.edgeone`，避免旧平台产物被复制进函数包。

### 5.2 Git 集成

1. 将仓库推送到 GitHub / GitLab。
2. 在 EdgeOne Makers 控制台导入项目。
3. 构建命令 `bun run build`，输出目录 `.edgeone`，Node 版本 22.21.1（与 `edgeone.json` 一致）。项目锁定 Bun 1.3.14，以匹配 EdgeOne 构建环境。
4. 配置第 4 节环境变量后部署。

### 5.3 CLI

```bash
npm i -g edgeone
edgeone login
bun run deploy
```

`bun run deploy` 会先构建，再执行：

```bash
bunx edgeone makers deploy ./.edgeone
```

### 5.4 本地模拟

```bash
bun run build
PORT=3001 bun run preview:edgeone
```

`scripts/serve-edgeone.mjs` 直接把 Node 请求交给 `.edgeone` 的 handler，用于验证请求/响应转换和函数包完整性。

## 6. 原生依赖处理

EdgeOne 适配器使用 esbuild + NFT 打包服务端代码。项目在 `vite.config.ts` 中做了三处处理：
1. `beforeBundle` 注入自定义 esbuild 插件，在 NFT 解析器之前把 `sharp`、`@img/*`、`pg` 及其依赖标记为 external。
   - sharp 依赖动态加载的 `.node` 与 libvips `.so`，打包后路径会失效。
   - pg 带 `import` / `require` 双入口，打包后会出现 CJS default interop 错误。
2. 覆盖 esbuild banner，用别名导入 `createRequire`，避免与被依赖代码中的同名导入冲突。
3. `afterBundle` 把上述包复制到 `.edgeone/cloud-functions/ssr-node/node_modules`，保证本地模拟与云端函数包一致。

`edgeone.json` 同时声明 `cloudFunctions.externalNodeModules`，作为平台侧提示。

## 7. 平台限制

| 项目           | 限制                      | 本项目的处理                         |
| -------------- | ------------------------- | ------------------------------------ |
| 请求/响应 body | 6MB                       | 上传上限调整为 6MB；超大请求返回 413 |
| 函数代码包     | 128MB                     | 当前函数目录约 30MB                  |
| 最大执行时长   | 120s（默认 30s）          | 图片处理与页面渲染远低于上限         |
| Node.js 运行时 | v20.x                     | 已在 Node 20.20.1 下验证 handler     |
| 构建 Node 版本 | 预装 22.21.1 / 24.18.0 等 | `edgeone.json` 使用 22.21.1          |

已知边界：后台导出接口会一次性返回全部内容与历史版本。若 JSON 增长到 6MB 以上，会触及平台响应体上限；本轮未改为分页或对象存储导出。

## 8. 验证记录

已执行：

```bash
./node_modules/.bin/tsc --noEmit          # 通过
./node_modules/.bin/biome check .         # 通过（仅 schema 版本提示）
./node_modules/.bin/vitest run            # 16 个测试文件、90 个用例全部通过
./node_modules/.bin/vite build            # 通过
```

EdgeOne 相关用例：
- `test/edgeone/no-cloudflare.test.ts`：无 Cloudflare 文件、依赖或运行时引用。
- `test/edgeone/build-artifact.test.ts`：`.edgeone` 结构、v3 路由、原生依赖、128MB 上限。
- `test/edgeone/sharp-native.test.ts`：从产物目录加载 sharp 并完成 WebP 编码。
- `test/edgeone/runtime.test.ts`：通过 `.edgeone` handler 验证公开站、重定向、后台鉴权、RSS/sitemap/robots。
- `test/auth/origin.test.ts`：同源校验与 `x-forwarded-proto` 行为。
- `test/http/public-behaviour.test.ts`：本地 Node 服务回归测试。

Node 20 验证：

```bash
npx -y node@20.20.1 -e "import('./.edgeone/cloud-functions/ssr-node/handler.js')"
PORT=43202 npx -y node@20.20.1 scripts/serve-edgeone.mjs
```

handler 可加载，首页返回 200。

未验证：
- 真实 EdgeOne Makers 云端部署（本轮按约定只做本地产物 + 模拟运行时）。
- EdgeOne 控制台中 `bun install` 的 postinstall 行为与平台环境变量注入。
- 数据增长到 6MB 以上的导出接口行为。
