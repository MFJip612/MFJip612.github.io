export default {
	fetch: async (request) => {
		const url = new URL(request.url);

		// CORS helper: attach Access-Control-Allow-Origin to responses
		const withCors = (resp) => {
			const headers = new Headers(resp.headers || {});
			headers.set("Access-Control-Allow-Origin", "*");
			headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
			headers.set("Access-Control-Allow-Headers", "Content-Type, Accept");
			return new Response(resp.body, {
				status: resp.status || 200,
				headers,
			});
		};

		// 预渲染HTML模板函数
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

				// 返回完整的HTML页面
				const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="/favicon.ico">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>友链 - MFJip生活随笔</title>
  <style>
    :root {
      --color-background: #ffffff;
      --color-text: #333333;
      --color-heading: #1a1a1a;
      --color-border: #e5e7eb;
      --color-shadow: rgba(0, 0, 0, 0.1);
      --theme-hue: 217;
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --color-background: #1a1a1a;
        --color-text: #e5e7eb;
        --color-heading: #f9fafb;
        --color-border: #374151;
        --color-shadow: rgba(0, 0, 0, 0.3);
      }
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--color-background);
      color: var(--color-text);
      line-height: 1.6;
    }
    
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background-color: var(--color-background);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      padding: 0 1rem;
      z-index: 100;
    }
    
    .container {
      max-width: 1200px;
      margin: 60px auto 0;
      padding: 1rem;
      min-height: calc(100vh - 60px);
    }
    
    .friends-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 2rem;
      color: var(--color-heading);
      font-size: 2.5rem;
      font-weight: 700;
    }
    
    .friends-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      justify-items: center;
    }
    
    .friend-card {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 1.5rem;
      background-color: var(--color-background);
      border-radius: 12px;
      box-shadow: 0 4px 12px var(--color-shadow);
      transition: all 0.3s ease;
      text-decoration: none;
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }
    
    .friend-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px var(--color-shadow);
      border-color: hsla(var(--theme-hue), 100%, 50%, 0.5);
    }
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .avatar-container {
      position: relative;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
      background-color: var(--color-background-soft);
    }
    
    .avatar-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
    }
    
    .avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    
    .favicon-placeholder {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .initial-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-heading);
      background-color: hsla(var(--theme-hue), 100%, 50%, 0.1);
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
    
    .friend-name {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-heading);
    }
    
    .friend-url {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      color: var(--color-text);
      opacity: 0.7;
    }
    
    .card-content {
      flex-grow: 1;
      margin-bottom: 1rem;
    }
    
    .friend-description {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-text);
      opacity: 0.8;
      line-height: 1.4;
    }
    
    .card-footer {
      text-align: right;
    }
    
    .visit-link {
      display: inline-block;
      padding: 0.5rem 1rem;
      background-color: transparent;
      border: 1px solid hsla(var(--theme-hue), 100%, 50%, 0.5);
      color: hsla(var(--theme-hue), 100%, 50%, 1);
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }
    
    .visit-link:hover {
      background-color: hsla(var(--theme-hue), 100%, 50%, 0.1);
      text-decoration: underline;
    }
    
    .footer {
      text-align: center;
      padding: 2rem;
      margin-top: 2rem;
      border-top: 1px solid var(--color-border);
      color: var(--color-text);
      opacity: 0.7;
    }
    
    @media (max-width: 768px) {
      .friends-list {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }
      
      h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <nav>
      <a href="/" style="text-decoration: none; color: var(--color-heading); font-weight: 600;">MFJip生活随笔</a>
    </nav>
  </header>
  
  <main class="container">
    <div class="friends-container">
      <h1>友链</h1>
      <div class="friends-list">
        ${friendsHtml}
      </div>
    </div>
  </main>
  
  <footer class="footer">
    <p>&copy; 2026 MFJip. All rights reserved.</p>
  </footer>
  
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const visitLinks = document.querySelectorAll('.visit-link');
      visitLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          console.log('访问链接:', this.href);
        });
      });
    });
  </script>
  <a style="display: none; visibility: hidden;" href="https://waterspo.top">https://waterspo.top</a>
</body>
</html>`;

				// 压缩HTML内容
				const compressedHtml = html.replace(/\s+/g, ' ')  // 替换多个空白字符为单个空格
										.replace(/>\s+</g, '><')  // 移除标签间的空白
										.trim();

				return new Response(compressedHtml, {
					status: 200,
					headers: {
						'Content-Type': 'text/html; charset=utf-8',
						'Cache-Control': 'public, max-age=300',
						'Content-Encoding': 'gzip'  // 如果支持的话
					}
				});
			} catch (error) {
				console.error('预渲染友链页面失败:', error);
				// 如果预渲染失败，返回错误页面
				const errorHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>友链 - MFJip生活随笔</title>
</head>
<body>
  <div style="text-align: center; padding: 2rem;">
    <h1>友链</h1>
    <p>抱歉，暂时无法加载友链数据。请稍后重试。</p>
    <p><small>错误信息: ${error.message}</small></p>
  </div>
</body>
</html>`;
				
				return new Response(errorHtml, {
					status: 500,
					headers: { 'Content-Type': 'text/html; charset=utf-8' }
				});
			}
		};

		// 处理 /friends 路径的预渲染
		if (url.pathname === "/friends" && request.method === "GET") {
			return await renderFriendsPage();
		}

		// Handle a proxy endpoint for friends data
		if (url.pathname === "/api/friends-proxy") {
			if (request.method === "OPTIONS") {
				return withCors(new Response(null, { status: 204 }));
			}

			// Fetch remote data from the friends host and return it with CORS headers
			try {
				const remoteResp = await fetch("https://friends.im-a.gay");
				const body = await remoteResp.arrayBuffer();
				const headers = new Headers(remoteResp.headers);
				// Ensure content-type is present
				if (!headers.has("content-type")) headers.set("content-type", "application/json; charset=utf-8");
				// Build response and attach CORS
				const resp = new Response(body, {
					status: remoteResp.status,
					headers,
				});
				return withCors(resp);
			} catch (e) {
				return withCors(new Response(JSON.stringify({ error: e.message }), { status: 502, headers: { 'content-type': 'application/json' } }));
			}
		}

		if (url.pathname.startsWith("/api/")) {
			return Response.json({ name: "Cloudflare" });
		}

		return new Response(null, { status: 404 });
	},
};
