import '../dist/server/entry.mjs'
import universalVikeHandler from 'vike/universal-middleware'

export default {
	fetch: async (request, env) => {
		const url = new URL(request.url);
		const cdnMaxAge = env?.CDN_CACHE_MAX_AGE || '43200';

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

		// Set Cache-Control on static asset responses
		const withAssetCache = (resp) => {
			if (resp.status === 404) return resp;
			const headers = new Headers(resp.headers);
			if (!headers.has('Cache-Control')) {
				headers.set('Cache-Control', `public, max-age=${cdnMaxAge}, s-maxage=${cdnMaxAge}, immutable`);
			}
			return new Response(resp.body, {
				status: resp.status,
				headers,
			});
		};

		// Set Cache-Control on SSR responses (shorter TTL for dynamic content)
		const withSsrCache = (resp) => {
			const headers = new Headers(resp.headers);
			headers.set('Cache-Control', 'public, max-age=0, s-maxage=60');
			return new Response(resp.body, {
				status: resp.status,
				headers,
			});
		};



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

		// Serve static assets first (favicon, CSS/JS chunks, sitemap, etc.) with cache headers
		if ((request.method === 'GET' || request.method === 'HEAD') && env?.ASSETS) {
			const assetResp = await env.ASSETS.fetch(request)
			if (assetResp.status !== 404) {
				return withAssetCache(assetResp)
			}
		}

		// Fallback to Vike SSR rendering for application routes
		const pageContextInit = {
			urlOriginal: request.url,
			httpRequest: request,
			env,
		}
		const ssrResp = await universalVikeHandler(request, pageContextInit, {});

		// If Vike returned a successful response, wrap with SSR cache headers
		if (ssrResp && ssrResp.status !== 404) {
			return withSsrCache(ssrResp);
		}

		// 404 fallback if nothing matched
		return new Response('Not Found', { status: 404 });
	},
};
