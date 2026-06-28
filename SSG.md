# SSG (Static Site Generation) 支持文档

## 概述

该项目现已支持 SSG（静态站点生成）功能，允许您在构建时通过 `isSSG` 选项决定哪些页面和文章进行静态渲染。

## 功能特性

- ✅ **页面级 SSG 控制**：在 `page.ts` 中添加 `isSSG: true` 启用
- ✅ **文章级 SSG 控制**：在 `post.ts` 中添加 `isSSG: true`/`false` 控制（默认启用）
- ✅ **自动路由收集**：Vite 插件自动收集所有 SSG 路由
- ✅ **配置清单生成**：构建时生成 `ssg-routes.json` 清单文件
- ✅ **类型安全**：完整的 TypeScript 类型支持

## 使用方法

### 1. 启用页面 SSG

在页面的 `page.ts` 文件中添加 `isSSG: true`：

```typescript
// src/views/article/page.ts
import type { PageMeta } from '@/types'

const meta: PageMeta = {
  title: '文章列表',
  menuOrder: 2,
  isSSG: true,  // 启用 SSG
}

export default meta
```

### 2. 文章 SSG 控制

文章默认启用 SSG。如需禁用，在 `post.ts` 中设置 `isSSG: false`：

```typescript
// src/articles/example/post.ts
import type { ArticleMeta } from '@/types'

const meta: ArticleMeta = {
  title: '示例文章',
  date: '2025-06-28',
  isSSG: false,  // 禁用 SSG（可选）
}

export default meta
```

## 构建流程

### 构建命令

```bash
# 完整构建（包括 SSG）
pnpm run build

# 仅构建客户端
pnpm run build-only

# 查看 SSG 清单信息
cat dist/client/ssg-routes.json
```

### 构建输出

构建完成后，将生成：

1. **标准输出**：`dist/` 目录中的 JavaScript/CSS 文件
2. **SSG 清单**：`dist/client/ssg-routes.json` 和 `dist/mfjip612_github_io/ssg-routes.json`
   - 包含所有 SSG 路由的元数据
   - 用于部署和缓存优化

### SSG 清单示例

```json
{
  "generatedAt": "2026-06-28T08:16:56.737Z",
  "buildVersion": "vite-ssg",
  "routes": [
    {
      "path": "/article",
      "title": "文章列表",
      "type": "page"
    },
    {
      "path": "/article/vue-message-box",
      "title": "Vue弹窗组件封装",
      "type": "article",
      "articleId": "vue-message-box"
    }
  ]
}
```

## 架构设计

### Vite SSG 插件

文件：`vite-ssg-plugin.ts`

- 在构建开始时收集所有 SSG 路由
- 在构建完成后生成配置清单
- 支持页面和文章的动态路由收集

### 预渲染脚本

文件：`scripts/pre-render.ts`

- 生成 SSG 配置清单
- 可独立运行：`pnpm run ssg:config`

### 配置文件

文件：`ssg.config.ts`

- 定义 SSG 配置的类型和接口
- 支持自定义路由、输出目录、并发控制等

## 类型定义

### PageMeta

```typescript
interface PageMeta {
  title?: string
  menuOrder?: number
  hidden?: boolean
  isSSG?: boolean  // 新增：启用 SSG
  [key: string]: any
}
```

### ArticleMeta

```typescript
interface ArticleMeta extends PageMeta {
  title: string
  date: string
  description?: string
  tags?: string[]
  isSSG?: boolean  // 新增：启用 SSG（默认 true）
}
```

## 最佳实践

1. **页面 SSG**：为重要的静态内容页面启用 SSG，如关于页面、文章列表等
2. **文章 SSG**：默认所有文章启用 SSG，除非有特殊原因禁用
3. **部署优化**：结合 Cloudflare Pages 进行部署，利用边缘计算能力
4. **缓存策略**：SSG 页面应设置合理的缓存头

## 集成建议

### Cloudflare Pages

SSG 清单可用于 Cloudflare Pages 的部署优化：

```javascript
// _routes.json 中使用 SSG 清单
{
  "version": 1,
  "include": ["/", "/article", "/article/*"],
  "exclude": ["/api/*"]
}
```

### 预部署检查

```bash
# 验证 SSG 清单
cat dist/ssg-routes.json | jq '.routes | length'
```

## 故障排除

### 问题：未生成 SSG 清单

**解决方案**：
1. 确保至少有一个页面或文章设置了 `isSSG: true`
2. 检查构建输出中是否有错误
3. 运行 `pnpm run ssg:config` 查看详细输出

### 问题：构建缓慢

**优化方法**：
1. 减少 SSG 路由数量
2. 在 `ssg.config.ts` 中调整 `concurrency` 参数
3. 只为必要的路由启用 SSG

## 进阶配置

### 自定义重新验证时间

```typescript
// src/views/article/page.ts
const meta: PageMeta = {
  title: '文章列表',
  menuOrder: 2,
  isSSG: true,
  revalidate: 3600,  // 1小时后重新生成
}
```

### 预加载优化

```typescript
const meta: PageMeta = {
  title: '首页',
  isSSG: true,
  preload: true,  // 优先级加载
}
```

## 相关文件

- `src/types/index.ts` - 类型定义
- `vite-ssg-plugin.ts` - Vite 插件
- `scripts/pre-render.ts` - 预渲染脚本
- `ssg.config.ts` - SSG 配置
- `vite.config.ts` - Vite 主配置
- `package.json` - 构建脚本

## 更新日志

### v1.0.0 (2025-06-28)

- ✨ 初始 SSG 支持
- ✨ Vite 插件集成
- ✨ 自动路由收集
- ✨ 配置清单生成
- ✨ 类型安全支持

---

有问题或建议，欢迎在 Issues 中提出！
