import type { ProfilePayload } from "@/features/content/schemas";
import { DialRule } from "./dial-rule";

/**
 * QSL 风格个人名片：全站唯一的强记忆点。
 *
 * 只呈现真实资料——姓名、可选呼号、真实照片、已填写的兴趣标签。
 * 没有呼号就不显示呼号位，不使用任何占位或伪造信息。
 */
export function QslCard({ profile }: { profile: ProfilePayload }) {
	return (
		<figure className="relative overflow-hidden rounded-card border border-border-token bg-surface">
			{/* 卡片内框，模仿 QSL 卡的印刷边线 */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-[6px] rounded-[8px] border border-border-token opacity-45"
			/>
			<div className="relative flex flex-col gap-5 p-6 sm:p-7">
				<div className="flex items-start gap-4">
					{profile.avatarMediaId ? (
						<span
							aria-hidden="true"
							className="block h-16 w-16 shrink-0 rounded-[6px] bg-sidebar"
							style={{
								backgroundImage: `url(${profile.avatarMediaId})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}
						/>
					) : null}
					<div className="min-w-0 flex-1">
						<h2 className="font-serif text-2xl leading-snug text-fg">
							{profile.displayName}
						</h2>
						{profile.callsign ? (
							<p className="param mt-1 text-accent">
								{profile.callsign}
							</p>
						) : null}
						{profile.publicRegion ? (
							<p className="mt-1 text-sm text-fg-muted">
								{profile.publicRegion}
							</p>
						) : null}
					</div>
				</div>

				{profile.interests.length > 0 ? (
					<ul className="flex flex-wrap gap-x-3 gap-y-1.5">
						{profile.interests.map((interest) => (
							<li
								key={interest}
								className="text-sm text-fg-muted before:mr-1.5 before:text-accent before:content-['/']"
							>
								{interest}
							</li>
						))}
					</ul>
				) : null}

				<DialRule className="mt-auto" />
			</div>
		</figure>
	);
}
