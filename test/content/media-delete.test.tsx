import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { DeleteMedia } from "@/components/admin/delete-media";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: vi.fn() }),
}));

it("renders a destructive media action with a reference-aware label", () => {
	const html = renderToStaticMarkup(
		<DeleteMedia id="media-1" referenceCount={0} />,
	);

	expect(html).toContain("删除媒体");
	expect(html).toContain("公开图片可能仍存在于浏览器或 CDN 缓存");
});

it("explains why a referenced media item cannot be deleted", () => {
	const html = renderToStaticMarkup(
		<DeleteMedia id="media-1" referenceCount={2} />,
	);

	expect(html).toContain("仍有 2 个内容版本引用，不能删除");
});
