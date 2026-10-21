import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import {
	getThemeScriptType,
	SiteThemeProvider,
} from "@/components/providers/theme-provider";

it("keeps the theme bootstrap executable on the server and inert on the client", () => {
	expect(getThemeScriptType(true)).toBe("text/javascript");
	expect(getThemeScriptType(false)).toBe("text/plain");

	const html = renderToStaticMarkup(
		<SiteThemeProvider>
			<span>content</span>
		</SiteThemeProvider>,
	);
	expect(html).toContain('<script type="text/javascript"');
});
