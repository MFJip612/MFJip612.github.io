# MFJip612 — Geek Blog

基于 **Nuxt 5**（compatibilityVersion 5）构建的极客风格个人博客，部署于 **Cloudflare Workers**。

## 技术栈

- **Nuxt 4.4.8**（启用 Nuxt 5 兼容模式）+ **Vue 3.5** + **Vite 7**
- **Nitro 2.13** — 服务端渲染 + 预渲染，`cloudflare-module` preset
- **marked 18** + **KaTeX 0.17** — Markdown 渲染与数学公式
- **Monaco Editor 0.55** — 代码块高亮
- **Cloudflare Workers** — 部署目标

## 项目结构

```
app/
  app.vue              # 根组件
  layouts/default.vue  # 默认布局
  components/          # 自动导入组件
  composables/         # 自动导入 composables
    useArticles.ts     # 文章元数据与内容加载
  pages/               # 文件路由
    index.vue          # 首页
    article/index.vue  # 文章列表
    article/[id].vue   # 文章详情（动态路由）
    about.vue          # 关于页
  articles/            # 文章源文件（post.ts + index.md）
  lib/marked-math.ts   # marked KaTeX 扩展
  assets/css/          # 全局样式
  types/index.ts       # 类型定义
nuxt.config.ts         # Nuxt 配置
wrangler.jsonc         # Cloudflare Workers 配置
public/                # 静态资源
```

## 开发

```sh
pnpm install
pnpm dev          # 开发服务器（node-server preset）
```

## 构建

```sh
pnpm build        # 生产构建（cloudflare-module preset）
pnpm typecheck    # 类型检查
```

## 预览生产构建

```sh
npx wrangler dev .output/server/index.mjs --assets .output/public
```

## 部署

```sh
npx wrangler deploy .output/server/index.mjs --assets .output/public
```

## 文章编写

在 `app/articles/` 下创建目录，包含：

- `post.ts` — 文章元数据（标题、日期、分类、摘要）
- `index.md` — Markdown 内容（支持 KaTeX 数学公式）