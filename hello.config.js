// Hellō 官方 SDK 配置文件（应用标识，非密钥，可提交到仓库）。
// client_id 来自 Hellō 开发者控制台；尚未创建应用时留空，
// 访问 /admin/login/ 会得到明确提示而不是静默失败。
const config = {
	client_id: process.env.NEXT_PUBLIC_HELLO_CLIENT_ID ?? "",
};

export default config;
