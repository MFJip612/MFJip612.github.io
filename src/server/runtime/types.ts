/** 运行目标无关的环境与绑定访问接口。 */
export type Runtime = {
	/** 读取普通环境变量或 Workers binding。 */
	env(key: string): string | undefined;
	/** Cloudflare Hyperdrive 连接串；Node 环境返回 undefined。 */
	hyperdriveConnectionString(): string | undefined;
};
