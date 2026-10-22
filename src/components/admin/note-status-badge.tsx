import {
	NOTE_STATUS_LABELS,
	type NoteStatus,
} from "@/features/content/note-status";

const TONE: Record<NoteStatus, string> = {
	draft: "text-muted",
	published: "text-success",
	"published-with-draft": "text-warning",
	unpublished: "text-muted",
};

/**
 * 状态徽标。
 * 除颜色外同时给出文字，反馈不只依赖颜色。
 */
export function NoteStatusBadge({ status }: { status: NoteStatus }) {
	return (
		<span className={`text-sm ${TONE[status]}`}>
			<span aria-hidden="true" className="mr-1.5">
				·
			</span>
			{NOTE_STATUS_LABELS[status]}
		</span>
	);
}
