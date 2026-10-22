import { Link } from "@tanstack/react-router";
import type { PublishedNoteListItem } from "@/features/content/public-queries";
import { formatDisplayDate, formatIsoDate } from "@/lib/format";
import { TagPill } from "./tag-pill";

export function NoteCard({
	note,
	variant = "small",
	index,
}: {
	note: PublishedNoteListItem;
	variant?: "large" | "small";
	index?: number;
}) {
	const large = variant === "large";
	return (
		<Link
			to="/blog/$slug/"
			params={{ slug: note.slug }}
			className={`group flex flex-col rounded-card border border-border-token bg-surface p-5 transition-all duration-200 ease-calm hover:-translate-y-0.5 hover:border-accent ${
				large ? "sm:p-8" : ""
			}`}
		>
			<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
				{typeof index === "number" ? (
					<span className="font-mono text-[11px] tracking-[1.5px] text-accent">
						{String(index).padStart(2, "0")}
					</span>
				) : null}
				{note.tags.slice(0, 2).map((tag) => (
					<TagPill key={tag} tag={tag} />
				))}
			</div>

			<h3
				className={`mt-4 font-display font-bold leading-tight tracking-[-0.01em] text-fg transition-colors duration-200 group-hover:text-accent ${
					large ? "text-[28px] sm:text-[34px]" : "text-[20px]"
				}`}
			>
				{note.title}
			</h3>
			<p className="mt-3 line-clamp-2 text-[14px] leading-[24px] text-muted">
				{note.description}
			</p>

			<div className="mt-auto flex flex-wrap items-center gap-x-3 pt-5 font-mono text-[11px] uppercase tracking-[1.2px] text-muted">
				<time dateTime={formatIsoDate(note.publishedAt)}>
					{formatDisplayDate(note.publishedAt)}
				</time>
				<span aria-hidden="true">·</span>
				<span>{note.readingTime} min read</span>
			</div>
		</Link>
	);
}
