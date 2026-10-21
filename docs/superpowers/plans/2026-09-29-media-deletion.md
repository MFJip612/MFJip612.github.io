# 媒体安全删除闭环实施计划

> **For agentic workers:** Inline execution is requested by the parent task; follow the TDD steps below in order.

**Goal:** 为后台媒体库补上仅管理员可用、引用保护、对象存储清理和可恢复错误提示的明确删除流程。

**Architecture:** 删除请求先在服务端检查管理员身份、来源和媒体引用，再在数据库事务中锁定媒体行；没有任何保留版本引用时清理私有对象及已批准公开派生对象，并记录不含机密的审计事件。引用存在、媒体不存在或对象存储失败都保留数据库记录并返回明确状态，前端只在确认后刷新媒体库。

**Tech Stack:** Next.js 16 App Router Route Handler、Prisma 7 PostgreSQL、S3-compatible storage、React 19、Vitest。

---

### Task 1: 服务层安全删除

**Files:**
- Create: `features/media/deletion.ts`
- Test: `test/content/media-deletion.test.ts`

- [x] 写失败测试：无引用媒体删除两个对象并删除数据库记录；存在任意历史/草稿引用时抛出 `MEDIA_IN_USE` 且不调用对象删除；媒体不存在返回 `NOT_FOUND`。
- [x] 运行 `bunx vitest run test/content/media-deletion.test.ts`，确认因缺少服务函数失败。
- [x] 实现 `deleteMedia({ id, actorId })`，用 PostgreSQL 行锁保护引用检查，在锁内调用现有 `removePrivateImage` / `removeApprovedImage`，成功后删除媒体并写 `media.delete` 审计事件。
- [x] 运行该测试并确认通过，再运行全部测试。

### Task 2: 受保护删除接口

**Files:**
- Create: `app/api/admin/media/[id]/delete/route.ts`
- Modify: `test/http/public-behaviour.test.ts`

- [x] 写失败 HTTP 测试：匿名 DELETE 返回 401；无效来源返回 403；已授权但被引用返回 409。
- [x] 运行目标测试确认失败。
- [x] 实现 `DELETE` Route Handler：调用 `authorizeAdminForWrite()`、验证 Origin、调用删除服务，并设置 `Cache-Control: private, no-store`；不把对象 key 或存储错误写入响应。
- [x] 运行 HTTP 测试与全套测试。

### Task 3: 媒体库操作界面

**Files:**
- Create: `components/admin/delete-media.tsx`
- Modify: `app/(admin)/admin/media/page.tsx`

- [x] 写组件渲染测试：删除入口显示公开缓存警告；有引用时显示不可删除状态。
- [x] 运行目标测试确认失败。
- [x] 实现键盘可用、至少 44px 触控目标的二次确认按钮和真实 pending/error 状态；客户端交互仍需浏览器环境验收。
- [x] 运行测试、类型检查、lint 和生产构建。

### Task 4: 交付记录

**Files:**
- Modify: `README.md`
- Modify: `PLAN.md`

- [x] 记录删除保护、公开桶缓存不可控边界和本轮实测命令；保留 Hellō、真实 S3、EdgeOne 与隔离恢复为未验证阻断项。
- [ ] 对新增路由、媒体删除与存储模块运行安全扫描；当前 SecureCoder sidecar 未连接，已记录为未完成，不宣称通过。

## Verification Plan

### Automated Security Check

- **Security Scanner:** 扫描 `features/media/deletion.ts`、`app/api/admin/media/[id]/delete/route.ts` 和 `components/admin/delete-media.tsx`，记录严重度、文件和行号；修复后复扫。
- **Security Audit:** 复核管理员授权、Origin 校验、引用竞态、对象 key 不回显、私有桶与公开桶边界、响应缓存头和错误处理；结果写入 `walkthrough.md`，未完成扫描前不标记安全审核完成。
