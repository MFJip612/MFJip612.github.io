# 业余无线电手记

单站长的 Next.js 网站与内容后台。公开页只读取数据库中的已发布版本；站长可保存草稿、预览笔记、发布／撤回、将笔记移入回收站并恢复为草稿。**仓库没有预置个人内容；请只发布确认真实的资料。**

## 本地启动

1. 安装 Bun 与项目依赖：`bun install`。
2. 复制 `.env.example` 到本地 `.env`，填入 PostgreSQL 和 Hellō 应用配置；不要提交密钥。本地数据库可通过 `bun run db:dev` 启动并按其输出设置 `DATABASE_URL`。
3. 执行 `bun run db:migrate`、`bun run db:generate`、`bun run dev`。
4. 访问 `/admin/login/`；Hellō 开发者应用应登记精确的回调域名，`hello.config.js` 的 client ID 按该应用配置。`ADMIN_HELLO_SUB` 为空时所有后台入口拒绝访问，不支持首个登录者自动认领。必须通过受控的、仅本人可见的身份核验流程获取 Hellō 签发的 sub，再写入部署环境；目前尚未交付自动初始化页面。

`bun run verify` 运行类型检查、lint、自动测试和生产构建。测试使用隔离 PGlite，不会把测试文章写入正式数据库。迁移前先备份数据库。

## 内容管理

- `/admin/profile/`、`/admin/pages/`、`/admin/station/` 和 `/admin/settings/` 维护固定内容；先保存草稿、再发布。笔记通过 `/admin/notes/` 编辑。空资料不会凭空显示在公开站。
- `/admin/trash/` 恢复被软删除的笔记；恢复不会重新上线。`/admin/activity/` 查看关键操作。`/admin/settings/` 下载内容 JSON，含历史版本与媒体清单，**不含图片文件**。
- 媒体上传后先留在私有 S3 桶，管理员明确批准时才从原图生成不可变 WebP 派生图并写入独立的 `S3_PUBLIC_BUCKET`。只有已批准图片能作为笔记封面或资料头像发布，封面还需要替代文字。对象存储 endpoint 在生产须为 HTTPS，本地回环地址可使用 HTTP。`S3_BUCKET` **绝不可公开可读**；公开桶必须与私有桶不同，并只允许 `public/` 下已批准对象匿名读取。媒体库删除入口已交付：服务端锁定媒体行，发现草稿、线上或历史版本引用时返回冲突，否则清理私有对象和公开派生对象后删除记录并写审计。公开图片仍可能留在不可控的浏览器或 CDN 缓存中。Markdown 内嵌图的媒体选择与引用追踪尚未交付，手写正文图片不纳入媒体库删除保护。
- RSS 与 Sitemap 只列出发布内容；RSS 在无文章或设置关闭时返回 404。站点域名来自 `NEXT_PUBLIC_SITE_URL`，不从后台表单读取。

## 上线前的外部配置与验证

- 创建 Hellō 应用，按本地／预览／生产分别登记严格回调地址，配置 client ID、独立的 `HELLO_COOKIE_SECRET`（32 字节、64 位十六进制）和经验证的 `ADMIN_HELLO_SUB`。更换站长时先更新白名单并部署，再核实旧账号立即失权；轮换 Cookie 密钥将使本站会话失效，不等于注销 Hellō 全球账户。
- 已核对本地依赖：`@hellocoop/nextjs@3.4.0` 的 peer dependencies 为 Next.js ≥10、React/React DOM ≥17，当前 Next.js `16.3.6`、React `19.2.8` 满足；SDK 导出 `appAuth(config)`（GET/POST）和 `auth()`，Cookie 密钥从 `HELLO_COOKIE_SECRET` 读取并要求 32 字节十六进制。`hello.config.js` 仅提供公开 client ID。该结果不是实际 Hellō 登录通过证明，开发者应用和真实回调仍待配置。
- 准备 PostgreSQL、**私有** S3 桶与单独的公开派生图桶，配置 `.env.example` 的变量和公开桶 HTTPS 基址；将存储凭据只放在服务端部署环境。EdgeOne Makers 为暂定目标，仍需在真实环境验证 Next.js 动态路由、Server Actions、Cookie、PostgreSQL 与两只桶的权限策略，不可由静态构建成功推断可上线。
- 在隔离环境测试一次身份登录／退出、草稿隔离、权限撤销、媒体私有读取、数据库迁移和备份恢复；未验证前不宣称生产就绪。

## 备份和隔离恢复

1. 对生产 PostgreSQL 定期执行 `pg_dump --format=custom --file=site.dump "$DATABASE_URL"`，保存在访问受控且加密的独立位置。部署迁移**之前**先执行并核对备份可读。
2. 对私有和公开 S3 桶启用供应商提供的对象版本／保留策略，并定期将两桶对象分别复制到独立受控位置；JSON 导出仅供内容携带，不代替数据库及对象备份。
3. 恢复演练时新建隔离 PostgreSQL 数据库和私有桶；用 `pg_restore --dbname="$RESTORE_DATABASE_URL" --no-owner --clean --if-exists site.dump` 还原数据库，复制对象到隔离桶。只给隔离站点配置隔离域名、Hellō 应用和密钥，不复用生产的管理员会话。
4. 核对数据库中修订版本、发布指针、重定向与审计记录数；抽查媒体清单中的对象 key、大小及可读性；验证公开页仍只读发布版本、管理员仍可读取草稿，然后销毁隔离环境。**本仓库尚未执行真实供应商的隔离恢复演练。**

代码回退不能替代数据库／媒体恢复。公开图片一旦曾被访问，撤回文章无法清除外部浏览器或 CDN 的历史副本。

## 验证记录（2026-09-29）

- 本地 `bun run typecheck`、`bun run lint`、`bun run test`（180 项通过，含媒体删除、登录回调、生产 HTTP 权限／草稿隔离测试）与 `bun run build` 已执行；构建期间因缺少 Hellō client ID 和 Cookie secret 出现 SDK 配置警告。生产构建确认新 DELETE 路由为动态路由。
- 自动化安全扫描服务在当前环境不可用，**不能视为已通过安全扫描**；上线前应扫描新增路由、媒体处理及存储代码，并人工复核管理员身份、来源校验、图片桶权限与数据库导出。
- 尚未进行真实 Hellō 登录、真实 S3 双桶上传／访问、EdgeOne Makers 动态部署、浏览器断点与键盘验收，也未执行数据库与媒体隔离恢复演练。当前环境未连接桌面浏览器，因此无法完成本轮浏览器验收。上述均为上线阻断项。
