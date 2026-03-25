# mfjip612-github-io

基于 Vue 3 + Vite + Vike 的个人博客项目。

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Routing

- 使用 Vike 文件路由，页面目录位于 `pages/`
- 全局布局位于 `pages/+Layout.vue`
- 全局 Vike 配置位于 `pages/+config.ts`
- 当前已启用 SSR（服务端渲染）
- 应用入口由 Vike 接管（不再使用 `src/main.ts` / `src/App.vue` / `vue-router`）

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

构建产物：

- 客户端静态资源：`dist/client`
- 服务端产物：`dist/server`
