import type { Element, Nodes, Root } from "hast";
import { slugifyHeading } from "./markdown";

const HEADING_TAGS = new Set(["h2", "h3", "h4"]);

function textOf(node: Element): string {
	let text = "";
	for (const child of node.children) {
		if (child.type === "text") {
			text += child.value;
		} else if (child.type === "element") {
			text += textOf(child);
		}
	}
	return text;
}

/**
 * 为二至四级标题补上稳定 id，使目录锚点可用。
 * 与 extractHeadings 使用同一套 slug 规则，两者结果必须一致。
 * 不引入额外依赖，直接遍历 hast 树。
 */
export function rehypeHeadingIds() {
	return (tree: Root) => {
		const used = new Map<string, number>();
		walk(tree.children, used);
	};
}

function walk(children: Nodes[], used: Map<string, number>): void {
	for (const child of children) {
		if (child.type === "root") {
			walk(child.children, used);
			continue;
		}
		if (child.type !== "element") continue;

		if (HEADING_TAGS.has(child.tagName)) {
			const text = textOf(child).trim();
			if (text) {
				const base = slugifyHeading(text);
				const count = used.get(base) ?? 0;
				used.set(base, count + 1);
				child.properties = {
					...child.properties,
					id: count === 0 ? base : `${base}-${count}`,
				};
			}
		}
		walk(child.children, used);
	}
}
