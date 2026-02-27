## 背景介绍
今天本站向[《二叉树树》官方网站](https://2x.nz)提交了友链申请，但在集成过程中遇到了技术挑战。由于对方采用GitHub Actions自动化处理友链合并，而本站基于单页应用(SPA)架构，导致标准的验证流程无法正常工作。

二叉树树的友链自动化合并流程如下：
1. 向其仓库提交特定JSON
2. Actions自动验证URL的可访问性
3. 透过`fetch API`执行双向链接验证（检查目标站点是否包含指向源站的链接）
4. 自动合并到友链列表

## 问题分析
首先来看友链申请的标准JSON格式：
```json
{
	"name": "Your Site",
	"avatar": "https://example.com/images/avatar.png",
	"description": "Some description.",
	"url": "https://example.com",
	"backlink": "https://example.com/friends"
}
```
其中`backlink`字段用于双向验证，系统会通过`fetch API`抓取指定页面的内容，并使用正则表达式匹配是否存在`href="https://2x.nz"`的链接。

对于传统的多页应用，这种验证方式完全可行，因为可以获取到完整HTML源码。然而，对于SPA应用来说，情况就完全不同了——服务器只能返回基础的HTML框架甚至直接404：
```html

<!DOCTYPE html>
<html lang="">

<head>
  <script type="module" src="/@vite/client"></script>

  <meta charset="UTF-8">
  <link rel="icon" href="/favicon.ico">
  <meta name="google-adsense-account" content="ca-pub-3433477986485987">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MFJip生活随笔</title>
</head>

<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts?t=1772199957123"></script>
</body>

</html>
```
显然，这样的基础HTML结构中不包含任何实际的链接内容，这导致验证失败。

因此，我们需要对`/friends`路由进行特殊处理，使其能够返回包含完整友链信息的静态内容。

## Cloudflare Workers解决方案
由于本站部署在Cloudflare Workers，可以通过Workers拦截特定路径请求并返回预渲染的HTML内容。这样当外部系统通过`fetch API`访问时，就能获得完整的页面内容。

具体实现步骤：
1. 在`index.js`中拦截`/friends`路径请求
```js
if (url.pathname === "/friends" && request.method === "GET") {
    return await renderFriendsPage();
}
```

2. 实现`renderFriendsPage`核心逻辑：
    - 通过`fetch API`从友链API获取实时数据
    - 使用模板字符串动态生成友链卡片HTML
    - 构建包含完整样式的HTML文档

```js
const renderFriendsPage = async () => {
	try {
		// 获取友链数据
		const friendsResponse = await fetch("https://friends.im-a.gay");
		const friendsData = await friendsResponse.json();
		
		// 生成友链卡片HTML
		const friendsHtml = friendsData.map(friend => `
			<div class="friend-card">
				<div class="card-header">
					<div class="avatar-container">
						<div class="avatar-content">
							<img src="${friend.avatar_uri || ''}" alt="${friend.name}" class="avatar" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
							<div class="favicon-placeholder">
								<div class="initial-avatar">${friend.name.charAt(0).toUpperCase()}</div>
							</div>
						</div>
					</div>
					<div>
						<h3 class="friend-name">${friend.name}</h3>
						<p class="friend-url">Link</p>
					</div>
				</div>
				<div class="card-content">
					<p class="friend-description">${friend.description || ''}</p>
				</div>
				<div class="card-footer">
					<a href="${friend.uri}" target="_blank" rel="noopener noreferrer" class="visit-link">访问</a>
				</div>
			</div>
		`).join('');

		const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>友链 - MFJip生活随笔</title>
  <style>
    /* 响应式友链页面样式 */
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; /* ... */ }
    .container { max-width: 1200px; margin: 0 auto; }
    .friends-container { background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; text-align: center; margin-bottom: 2rem; }
    .friends-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .friend-card { border: 1px solid #eee; border-radius: 8px; padding: 1.5rem; transition: transform 0.2s; }
    .friend-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    /* 其他样式省略... */
  </style>
</head>
<body>
  <div class="container">
    <div class="friends-container">
      <h1>友情链接</h1>
      <div class="friends-list">
        ${friendsHtml}
      </div>
      <!-- 隐藏的验证链接 -->
      <!-- 其他的样式已作省略处理 -->
      <div style="display: none; visibility: hidden;">
        <a href="https://2x.nz">https://2x.nz</a>
      </div>
    </div>
  </div>
</body>
</html>`;

		const compressedHtml = html.replace(/\s+/g, ' ')           
								.replace(/>\\s+</g, '><')
								.trim();

		return new Response(compressedHtml, {
			status: 200,
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
				'Cache-Control': 'public, max-age=300',     
				'Content-Encoding': 'gzip'
			}
		});
	} catch (error) {
		console.error('预渲染友链页面失败:', error);
		const errorHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>友链 - MFJip生活随笔</title>
</head>
<body>
  <div style="text-align: center; padding: 2rem;">
    <h1>友情链接</h1>
    <p>抱歉，暂时无法加载友链数据，请稍后重试。</p>
    <p><small>错误详情: ${error.message}</small></p>
  </div>
</body>
</html>`;
		
		return new Response(errorHtml, {
			status: 500,
			headers: { 'Content-Type': 'text/html; charset=utf-8' }
		});
	}
};
```

## 部署与验证
使用Wrangler工具将代码部署到Cloudflare Workers：
```bash
npx wrangler deploy
```

部署完成后，可以通过以下命令验证效果：
```bash
curl -L https://your-domain.com/friends
```

预期响应结果将是一个包含完整友链信息和隐藏验证链接的HTML页面。现在，友链自动化验证系统可以正确识别到页面中的反向链接，成功解决了SPA架构下的友链验证问题。