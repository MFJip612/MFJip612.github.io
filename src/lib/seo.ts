import { absoluteUrl, SITE_NAME } from "@/config/site";

/** 统一的页面 head：title、description、canonical、OG、Twitter。 */
export function pageHead(input: {
	title: string;
	description: string;
	path: string;
	type?: "website" | "article";
}) {
	const url = absoluteUrl(input.path);
	const title = `${input.title} · ${SITE_NAME}`;
	return {
		meta: [
			{ title },
			{ name: "description", content: input.description },
			{ property: "og:title", content: title },
			{ property: "og:description", content: input.description },
			{ property: "og:url", content: url },
			{ property: "og:type", content: input.type ?? "website" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: title },
			{ name: "twitter:description", content: input.description },
		],
		links: [{ rel: "canonical", href: url }],
	};
}
