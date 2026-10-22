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

- `bun run dev` / `bun run build` / `bun run start`：Node 目标，本地开发与测试使用（sharp + `process.env`）。
- `bun run dev:cf` / `bun run build:cf` / `bun run deploy`：Cloudflare Workers（Hyperdrive + Images binding）。部署前在 `wrangler.jsonc` 填入 Hyperdrive id，并用 `wrangler secret put` 配置密钥。

## 配置

- `VITE_SITE_URL`、`VITE_MEDIA_BASE_URL` 在构建期写入客户端，不要放密钥。
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
- `src/server/`：运行时适配（Node / Cloudflare）、Prisma、OIDC 会话、对象存储与图片管线。
- `src/features/content/`：内容 schema、版本服务与公开查询。
- `test/`：PGlite 内容测试、设计令牌对比度、真实生产构建的 HTTP 行为测试。
