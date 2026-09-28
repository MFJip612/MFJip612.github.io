import { appAuth } from "@hellocoop/nextjs";
import config from "../../../hello.config.js";

// Hellō 官方 SDK 的单一认证入口：登录、登出、回调都走这一个路由。
// 认证协议与认证 Cookie 由 SDK 负责；应用自身的站长白名单另行校验。
export const { GET } = appAuth(config);
