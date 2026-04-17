> **本文并非新手入门教程**，仅为对个人搭建流程进行归档，供后续维护与环境迁移时参考。

## 技术选型

本站采用`Vue`，`Animate.css`，`Monaco Editor`搭建而成。目前仅为纯前端，后期将会进行后端的添加。

## 是否采用了框架？

本站目前并未采用任何基于`Vue`，`React`而创作的框架，也没有采用`Hexo`之类的工具搭建。

原因如下：

-   框架的效果不是我想要的，框架不支持本人需求的高度定制。

于是乎便只采用`Vue`。

## 开发准备

本地环境已预先安装 Node.js，git，因此本文不再赘述安装过程。

### 安装 Wrangler

```bash
$ npm install wrangler -g
```

### 安装 Vue

```bash
$ npx create cloudflare@lastest my-vue-app -- --framework=vue
```
