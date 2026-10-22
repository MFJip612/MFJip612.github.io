export const SITE_URL = (
	import.meta.env.VITE_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const SITE_NAME = "MFJip612";
export const SITE_DESCRIPTION =
	"Software for a calmer, more open web. Field notes on frontend architecture, server-first systems, and interface design.";

export function absoluteUrl(pathname: string): string {
	const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
	return `${SITE_URL}${path}`;
}
