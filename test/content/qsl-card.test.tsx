import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { QslCard } from "@/components/site/qsl-card";

it("renders only the approved avatar URL, not a raw media identifier", () => {
	const profile = {
		displayName: "作者",
		intro: "",
		avatarMediaId: "db-id",
		callsign: "",
		publicRegion: "",
		interests: [],
	};
	const html = renderToStaticMarkup(
		<QslCard
			profile={profile}
			avatarUrl="https://images.example.test/public/abc.webp"
		/>,
	);
	expect(html).toContain("https://images.example.test/public/abc.webp");
	expect(html).not.toContain("db-id");
});
