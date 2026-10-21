# 业余无线电个人网站与站长后台实施计划

> 状态：实施中。已完成部分及实测结果以 `README.md` 为准；媒体删除本地闭环已完成，但 Markdown 内嵌媒体引用、真实认证／存储与部署验证仍不可视作上线通过。需求依据：仓库根目录 `guide.md`。

## 目标与已确认决策

- 公开站以真实的个人经历、业余无线电设备和笔记为主；后台只供单一站长维护。默认中文；无真实内容的公开栏目隐藏，不造呼号、设备、通联或统计。
- 公开站为深浅双主题，选定 **C｜午夜琥珀**；后台使用同一语义色系，但明暗选择独立。具体色值见下文；实现前复核文字、按钮、焦点及语义色对比度。
- 已有可公开的姓名与简介、设备资料、联系方式；暂没有确认可发布的笔记。因此笔记、笔记导航和 RSS 依内容条件显示；第一条完整编辑流程用站长随后提供的真实内容验证，不把测试文章当作公开正式内容。
- 登录固定为 Hellō 官方 `@hellocoop/nextjs` SDK；Hellō 开发者应用尚未创建。不得另选认证提供商、按邮箱授权或允许首个登录者自助认领后台；不在聊天中索取密钥。
- 暂定 Tencent EdgeOne Makers，未来可能转 Cloudflare Workers、Vercel 或自托管。部署平台能力尚未验证；优先维持标准 Next.js 动态部署与 PostgreSQL/S3 接口，不因平台选择改成静态导出或以 Blob/KV 替代关系数据库。
- 当前仓库为 Next.js `16.3.6`、React `19.2.8`、Tailwind 4 的初始模板，现有页面位于 `app/`，TypeScript 别名 `@/*` 指向仓库根目录。实施时在 `app/` 内演进或一次性迁至 `src/app/`，不可同时留两套冲突路由；优先保留 `app/`，避免无必要搬迁。

## 色彩与布局约束

| 语义 | 公开站浅色 | 公开站深色 |
|---|---|---|
| 背景 | `#F8F7F3` | `#191B1D` |
| 侧栏 | `#EFEDE5` | `#232629` |
| 表面 | `#FFFFFF` | `#2D3033` |
| 主文字 | `#2B2B27` | `#F5F3EE` |
| 次文字 | `#605E55` | `#CBC9C2` |
| 边框 | `#D5D2C7` | `#565A5C` |
| 强调色 | `#8C580B` | `#E7B65D` |
| 强调按钮文字 | `#FFFFFF` | `#261D0B` |
| 焦点 | `#A66D16` | `#F2CB82` |
| 成功 / 警告 / 错误 | `#25745C` / `#8C580B` / `#A8383F` | `#83CDA7` / `#E7B65D` / `#F39B9D` |

通过 `app/globals.css` 中语义 CSS 变量和前后台主题 scope 实现，后台主题独立记忆。桌面公开侧栏约 240px；窄于 1024px 使用可关闭抽屉，窄于 768px 首页单列；文章约 42rem。衬线标题、无衬线正文、呼号/参数局部等宽。唯一主要视觉记忆点为真实资料驱动的 QSL 风格名片；不复制参考站色彩或内容。所有交互有键盘焦点，移动触控目标至少 44px，遵守减少动态偏好。

## 实施单元与文件边界

每个单元先写针对行为的失败测试，再实现、跑通测试并检查构建；提交按独立可回退的工作单元划分。新依赖先验证安全与版本，再引入。首次写 Next.js 代码前阅读已安装版本 `node_modules/next/dist/docs/` 中对应的 App Router、Server Actions、Route Handlers、缓存、元数据和部署指南，不照搬旧版惯例。

### 0. 可行性门禁与配置清单

- 核查 Next.js 16.3.6 与 Hellō 官方 SDK 的 peer dependencies、`appAuth(config)`、`auth()`、登录/退出能力以及回调路径；确认需要的 SDK 版本和 `hello.config.js` 格式。创建 Hellō 开发者应用并分别登记本地、预览和生产 Redirect URI；生产不得信任不受控预览域名。
- 本地核验结果：`@hellocoop/nextjs@3.4.0` peer dependencies 与当前 Next.js 16.3.6、React 19.2.8 满足；SDK 导出 App Router `appAuth(config)` 的 GET/POST handler 与服务端 `auth()`，Cookie secret 由 `HELLO_COOKIE_SECRET` 提供，当前 `hello.config.js` 仅含公开 client ID。未创建 Hellō 应用，真实登录和回调仍是门禁阻断。
- 用最小受保护回调/动态读写试验，核对 EdgeOne Makers 对 Next.js 16 App Router、Node 运行时、Server Actions、动态路由、`no-store`、Cookie、外部 PostgreSQL、S3、图片处理和环境变量的实际支持。尤其核对 Prisma 在目标运行时和部署构建中的兼容性，不能从静态站部署成功推断动态后台可运行。
- 如存在阻断，先给出证据和可选托管/运行时调整，请站长确认；不要静默改动 Hellō、数据库、发布模型或静态导出限制。Cloudflare Workers/Vercel/自托管列为后续适配目标，不承诺未经验证的零修改迁移。
- 规划环境变量名称：`DATABASE_URL`、`HELLO_COOKIE_SECRET`、`ADMIN_HELLO_SUB`、正式站点域名、S3 endpoint/region/bucket/access key/secret；实际字段以 SDK/存储商核验结果为准。示例文件只写空值/示意值，真实凭据仅放部署环境。补齐运行/部署与管理员恢复说明。
- 验收：具备可复现的 SDK/平台兼容性结果、受控环境配置流程和明确的 go/no-go 结论；未通过时停止上线。

### 1. 数据模型、授权与查询边界

- 文件：`prisma/schema.prisma`、`prisma/migrations/`、`lib/db/`、`lib/auth/`、`features/content/schemas.ts`、`features/content/queries.ts`、相应测试。若后续迁至 `src/`，这些路径整体加 `src/` 前缀。
- 建立 `Content`、不可变 `Revision`、`Media`、`MediaReference`、`Redirect`、`AuditEvent`；`Content` 保存工作/发布指针和 `lockVersion`，唯一 stable key/文章 slug 使用数据库约束；按 kind 与 schemaVersion 校验 revision payload。定义软删除与发布状态的查询谓词。
- `app/api/hellocoop/route.ts` 接入官方 `appAuth(config)`；`hello.config.js` 只放公开的 client_id 等非秘密配置。`requireAdmin()` 必须在服务端调用 SDK `auth()` 并校验 Hellō `sub` 与 `ADMIN_HELLO_SUB`；未配置时拒绝。初次获取本人已验证 sub 通过受控、仅本人可见的初始化流程完成，读取身份不赋权，不创建公共认领入口。
- 管理页、预览、Server Actions、上传、导出和所有后台数据查询各自调用 `requireAdmin()`；不要只依赖布局。区分未登录与已登录非白名单；限制登录后返回地址为站内路径，写入验证来源并保持 SDK 默认 CSRF/会话防护。管理与预览 noindex、private/no-store；机密不写入审计。
- 验收：未登录/非白名单访问全部后台入口被拒；移除授权 sub 后旧 Cookie 不能访问；回调不能跳外域；公开查询从不选择工作版本、已删除或撤回内容。

### 2. 第一条纵向可用流程：笔记草稿到公开阅读

- 文件：`app/(admin-auth)/admin/login/page.tsx`、`app/(admin)/admin/layout.tsx`、`app/(admin)/admin/notes/{page.tsx,new/page.tsx,[id]/page.tsx}`、`app/(admin)/admin/preview/[type]/[id]/page.tsx`、`app/(site)/notes/{page.tsx,[slug]/page.tsx}`、`features/content/{actions.ts,publish.ts,markdown.tsx}`、`components/admin/`、对应测试。注意路由分组不影响实际 URL，登录页不能被受保护布局包住。
- 列表按真实状态搜索/排序/分页；编辑支持 Markdown、标题/摘要/分类/封面/SEO、显式保存、管理员私密预览、发布/更新发布及离开未保存提示。保存新 revision 只改变 working 指针；发布前检查字段、唯一 slug、链接和媒体状态，事务内设置发布指针并记录审计；并发保存按 lockVersion 冲突提示而非覆盖。
- 私密预览只读取已保存的 working revision，未保存本地预览必须明确标识。公开详情只读取 published revision，三个及以上 H2 才可呈现目录；Markdown 禁用原始 HTML/JSX 和危险链接，不编译 MDX，前台与预览使用同一安全渲染器。
- 初次发布设 publishedAt；再次发布保留首次时间并记录真实更新时间。下一次新请求可读新版本，不依赖构建期 slug 清单或跨请求内容缓存。无真实文章时公开笔记入口隐藏，测试使用隔离数据。
- 验收：新草稿不出现在公开列表/详情/RSS/Sitemap；保存线上文章的新草稿不影响匿名访客；发布后新请求立即读到新版本；重复发布不重复创建内容；会话过期及失败时保留未保存输入且不误报成功。

### 3. 公开页面、个人内容与编辑维护

- 文件：`app/layout.tsx`、`app/globals.css`、`app/(site)/{layout.tsx,page.tsx,about/page.tsx,station/page.tsx,contact/page.tsx}`、`app/(admin)/admin/{page.tsx,profile/page.tsx,pages/page.tsx,pages/[key]/page.tsx,station/page.tsx,settings/page.tsx}`、`components/site/`、`components/admin/`、对应测试。
- 个人资料、固定结构页面、设备/天线及设置采用各自经过 schema 校验的 revision payload；固定页首页/关于/联系使用固定 stable key。导航开关不能使空内容变成公开可见。概览仅显示数据库真实草稿数、发布数及最近编辑。
- 首页以真实姓名/简介和 QSL 名片为核心；有文章才显示近期笔记，有设备才显示电台模块，有联系方式才显示联系入口。关于我不伪造经历；设备状态只根据已确认真实资料呈现。缺资料时后台保留可编辑空态。
- 主题独立切换、响应式抽屉与编辑器单列布局；表单呈现未保存/保存中/草稿已保存/发布中/失败等真实状态，破坏性操作二次确认。公开导航最多五项，不含后台。
- 验收：真实资料驱动页面且无商业占位；无资料栏目隐藏；375/768/1024/1440px 无页面级横向溢出，手机可保存和发布；焦点、Esc、焦点归还和对比度检查通过后再定稿。

### 4. 媒体、公开发现与可维护性

- 文件：`features/media/{validation.ts,storage.ts}`、`app/api/admin/media/route.ts`、`app/(admin)/admin/media/page.tsx`、`app/{sitemap.ts,robots.ts,rss.xml/route.ts,not-found.tsx}`、站点 Metadata 与对应测试。
- 媒体只接受真实 JPEG/PNG/WebP；服务端核验大小 ≤10MB、解码像素 ≤4000 万、类型与文件内容、元数据清理，随机不可变 object key。私有暂存图只供短期授权管理员访问，验证通过且发布引用时生成明确批准的公开衍生图；禁止公开草稿原图、SVG/HTML 和未经校验文件。
- 媒体库显示尺寸、alt 与所有仍保留 revision 的引用；已交付管理员 DELETE 闭环：行锁内检查引用，被草稿、发布版本或历史版本引用时返回 409，未引用时删除私有/公开对象并删除记录。撤回文章不能承诺清除已缓存的公开图片；Markdown 内嵌图的媒体选择与引用追踪尚未交付，因此手写正文图片不纳入此删除保护。
- 公开页、RSS 和 Sitemap 复用只读 published 的查询；Metadata API 提供真实 title、description、canonical、OG 和中文语言；未知或撤回详情返回真正的不存在响应。旧 slug 记录目标 Content ID，跳转前核查目标仍在发布，避免循环与草稿泄露。尾斜杠策略统一。
- 验收：伪装类型/未授权上传失败，草稿图匿名不可见；引用媒体不能硬删；RSS/Sitemap 不含后台与草稿；旧链接按发布状态安全跳转。

### 5. 历史、回收站、审计、备份与交付

- 文件：`app/(admin)/admin/{trash/page.tsx,activity/page.tsx}`、`app/api/admin/export/route.ts`、`features/content/publish.ts`、相关测试、`README.md` 和部署/运维说明。
- 历史恢复生成新的工作草稿而非直接上线；撤回清除发布指针并保持可编辑草稿；软删除进入回收站，恢复仍为草稿。slug 变更明确告知旧链接结果。审计记录保存/发布/撤回/恢复结果，不含认证机密、正文或私密 URL。
- 仅管理员可导出 Markdown/JSON 与媒体清单；数据库定期备份、对象存储启用可用的版本/恢复能力；先备份再迁移，并在隔离环境实测数据库及媒体恢复。首版不承诺自动整站导入或一键永久清空。
- 测试覆盖认证取消/回调失败、权限撤销、CSRF/来源检查、Markdown 注入、锁冲突、slug 冲突/改名、网络/数据库错误、撤回/删除、图片与备份恢复。运行类型检查、项目 lint、自动测试、生产构建，并记录实际命令和结果；浏览器验证移动断点与管理员完整流程。LCP/CLS 仅在真实测量后报告。
- 交付文档包括开发与部署命令、环境变量空值示例、Hellō 管理员初始化/更换/退出与密钥轮换、内容管理操作、备份和隔离恢复步骤、上线检查及实测记录。

## 上线判定与范围边界

- 认证、数据库、媒体私有性、草稿与已发布隔离、撤回一致性及备份恢复均必须实际验证；任何门禁失败则不宣称可上线。
- 本期不做产品、支付、公众注册、会员、留言、实时电台数据、QSL 模块、定时发布、自动保存或拖拽建站器。未来 `/dashboard/` 业务权限与当前 `/admin/` 明确分离。
- 本计划始于独立规划阶段，当前仓库已进入实施；实际完成情况与阻断项见 `README.md`。

## Verification Plan

### Automated Security Check

- **Security Scanner**: 对所有本轮新建的路由、媒体处理、存储和导出文件运行 `run-security-scanner`，记录严重度、文件和行号，修复后复扫。当前 SecureCoder 服务不可用，尚未完成扫描，不能据此宣称无漏洞。
- **Security Audit**: 扫描可用后使用 `generate-security-audit-report` 审核认证与来源校验、图片类型与私有桶边界、导出缓存和凭据处理，并将发现与修复记录到 `walkthrough.md`。未完成扫描前不把报告标记为完成。
