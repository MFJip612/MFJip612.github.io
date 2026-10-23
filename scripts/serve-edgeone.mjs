/**
 * 本地模拟 EdgeOne Cloud Functions 的 Node.js 请求路径。
 * 直接把 Node IncomingMessage 交给适配器生成的 handler，再把 Web Response 写回。
 * 用法：PORT=3001 bun run build && PORT=3001 bun run preview:edgeone
 */
import { createServer } from "node:http";

const handlerPath = new URL(
	"../.edgeone/cloud-functions/ssr-node/handler.js",
	import.meta.url,
);
const { default: handler } = await import(handlerPath.href);

const port = Number(process.env.PORT ?? 3001);
const hostname = process.env.HOST ?? "0.0.0.0";

const server = createServer(async (request, response) => {
	try {
		const result = await handler(request);
		response.statusCode = result.status;
		for (const [key, value] of result.headers) {
			response.setHeader(key, value);
		}
		response.end(Buffer.from(await result.arrayBuffer()));
	} catch (error) {
		console.error("EdgeOne handler failed", error);
		response.statusCode = 500;
		response.end("Internal Server Error");
	}
});

server.listen(port, hostname, () => {
	console.log(`EdgeOne handler listening on http://${hostname}:${port}`);
});
