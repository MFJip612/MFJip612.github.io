/** 运行目标无关的环境变量访问接口。 */
export type Runtime = {
	/** 读取环境变量；EdgeOne Cloud Functions 通过 process.env 注入。 */
	env(key: string): string | undefined;
};
