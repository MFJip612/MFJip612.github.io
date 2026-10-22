# MFJip612

开发者个人站与站长后台。公开站使用 TanStack Start（React + Vite），后台保留草稿/发布隔离、不可变版本、媒体库、回收站、历史恢复与审计。公开站为英文，后台为中文。

## 本地启动

1. 安装 Bun 与依赖：`bun install`。
2. 复制 `.env.example` 为 `.env`，填入数据库、OIDC 与 S3 配置。
3. 启动本地数据库：`bun run db:dev`，把输出的连接串写入 `DATABASE_URL`。
4. 初始化：`bun run db:generate && bun run db:migrate`。
5. 填充示例内容：`bunx prisma db seed`。
6. 启动：`bun run dev`，访问 `/`；后台在 `/admin/`。

`bun run verify` 依次运行类型检查、Biome、Vitest 与生产构建。

## 运行目标

- `bun run dev`：本地开发。
- `bun run build`：生成 `.edgeone/` 部署产物（EdgeOne Makers）。
- `bun run start`：本地 Node 生产预览。
- `bun run preview:edgeone`：本地模拟 EdgeOne Node 函数运行 `.edgeone` 产物。
- `bun run deploy`：构建后执行 `edgeone makers deploy ./.edgeone`。

生产目标是 Tencent EdgeOne Makers（Cloud Functions，Node.js 20）。不再包含 Cloudflare Workers 运行分支。完整适配说明见 [`docs/edgeone-adaptation.md`](docs/edgeone-adaptation.md)。

## 部署

- Git 集成：提交仓库后，在 EdgeOne Makers 控制台设置构建命令 `bun run build`、输出目录 `.edgeone`，并配置环境变量。
- CLI：`npm i -g edgeone`、`edgeone login`，然后执行 `bun run deploy`。
- 图片上传上限为 6MB（EdgeOne 云函数请求体上限）。

## 配置

- `VITE_SITE_URL`、`VITE_MEDIA_BASE_URL` 在构建期写入客户端，不要放密钥；`VITE_SITE_URL` 必须是线上精确 origin。
- 本地使用 `.env`；EdgeOne 控制台需配置同名运行期变量。数据库通过 `DATABASE_URL` 连接，不使用平台绑定。
- 登录使用通用 OIDC + PKCE：`AUTH_ISSUER`、`AUTH_CLIENT_ID`、`AUTH_CLIENT_SECRET`、`AUTH_REDIRECT_URI`（必须以 `/api/auth/callback/` 结尾）、`AUTH_COOKIE_SECRET`（≥32 字符）。
- `ADMIN_OIDC_SUBJECTS` 是逗号分隔的 subject 白名单；留空时任何账号都不能进入后台。
- 图片：私有桶 `S3_BUCKET` 绝不可公开；公开派生图写入独立的 `S3_PUBLIC_BUCKET`，访问域名由 `VITE_MEDIA_BASE_URL` 提供。

## 内容管理

- `/admin/profile/`、`/admin/pages/`、`/admin/settings/` 维护固定内容；先保存草稿，再发布。
- `/admin/notes/` 编辑笔记；`/admin/trash/` 恢复软删除内容；`/admin/activity/` 查看审计；`/admin/media/` 上传、批准与删除图片。
- 公开读取只使用发布指针；草稿、撤回与回收站内容不会进入页面、RSS 或 sitemap。
- `/admin/settings/` 可导出内容 JSON（含历史版本与媒体清单，不含图片文件）。

## 目录

- `src/routes/`：公开站、后台、API、RSS/sitemap/robots 路由。
- `src/server-fns/`：所有读写都经由 `createServerFn`；客户端 loader 不直接访问数据库。
- `src/server/`：Node.js 运行时适配、Prisma、OIDC 会话、对象存储与 sharp 图片管线。
- `scripts/`：本地数据库、构建清理与 EdgeOne 运行时模拟脚本。
- `.edgeone/`：`bun run build` 生成的 EdgeOne 部署产物（已忽略提交）。
- `src/features/content/`：内容 schema、版本服务与公开查询。
- `test/`：PGlite 内容测试、设计令牌对比度、生产构建 HTTP 行为测试，以及 EdgeOne 产物与运行时验证。
