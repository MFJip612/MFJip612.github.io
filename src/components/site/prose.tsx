import { Markdown } from "@/features/content/markdown";

export function Prose({ markdown }: { markdown: string }) {
	return (
		<div className="prose-calm">
			<Markdown>{markdown}</Markdown>
		</div>
	);
}
