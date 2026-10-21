import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { FixedEditor } from "@/components/admin/fixed-editor";

it("offers labeled editable profile fields without publishing an empty identity", () => {
	const html = renderToStaticMarkup(
		<FixedEditor
			target={{ target: "profile" }}
			initial={{
				displayName: "",
				intro: "",
				callsign: "",
				publicRegion: "",
				interests: [],
				avatarMediaId: null,
			}}
			contentId={null}
			lockVersion={0}
			hasPublished={false}
		/>,
	);
	expect(html).toContain("姓名或显示名称");
	expect(html).toContain("保存草稿");
	expect(html).toContain("发布");
});
