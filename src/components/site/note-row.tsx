import { Link } from "@tanstack/react-router";
import type { PublishedNoteListItem } from "@/features/content/public-queries";
import { formatDisplayDate, formatIsoDate } from "@/lib/format";
import { TagPill } from "./tag-pill";

export function NoteRow({
	note,
	index,
}: {
	note: PublishedNoteListItem;
	index: number;
}) {
	return (
		<Link
			to="/blog/$slug/"
			params={{ slug: note.slug }}
			className="group grid gap-4 border-b border-border-token py-8 transition-colors duration-200 hover:border-accent md:grid-cols-12 md:gap-8"
		>
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 md:col-span-3 md:flex-col md:items-start md:gap-2">
				<span className="font-mono text-[11px] tracking-[1.5px] text-accent">
					{String(index + 1).padStart(2, "0")}
				</span>
				<div className="flex flex-wrap gap-x-3 gap-y-1">
					{note.tags.slice(0, 3).map((tag) => (
						<TagPill key={tag} tag={tag} />
					))}
				</div>
				<div className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] uppercase tracking-[1.2px] text-muted md:flex-col md:items-start">
					<time dateTime={formatIsoDate(note.publishedAt)}>
						{formatDisplayDate(note.publishedAt)}
					</time>
					<span className="md:hidden" aria-hidden="true">
						·
					</span>
					<span>{note.readingTime} min read</span>
				</div>
			</div>

			<div className="md:col-span-9">
				<h2 className="font-display text-[26px] font-bold leading-[34px] tracking-[-0.01em] text-fg transition-colors duration-200 group-hover:text-accent sm:text-[30px] sm:leading-[38px]">
					{note.title}
				</h2>
				<p className="mt-2 max-w-[62ch] text-[15px] leading-[26px] text-muted">
					{note.description}
				</p>
			</div>
		</Link>
	);
}
