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
