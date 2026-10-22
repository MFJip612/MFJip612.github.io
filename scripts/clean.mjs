/**
 * 构建前清空产物，避免上一次构建的旧文件（例如旧的 Cloudflare 产物）
 * 被 EdgeOne 适配器复制进函数包。
 */
import { rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await rm(".edgeone", { recursive: true, force: true });
