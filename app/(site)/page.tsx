import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DialRule } from "@/components/site/dial-rule";
import { QslCard } from "@/components/site/qsl-card";
import { getRecentPublishedNotes } from "@/features/content/public-queries";
import {
	loadEquipment,
	loadPage,
	loadProfile,
	loadSiteShellData,
	visibleEquipmentItems,
} from "@/features/content/site-data";
import { publicMediaUrl } from "@/features/media/public-url";
import { getDb } from "@/lib/db/prisma";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const data = await loadSiteShellData();
	const page = await loadPage("home");
	const title = page?.title ?? data.siteName;
	const description = page?.description || data.settings.defaultDescription;
	return {
		title,
		description: description || undefined,
		alternates: { canonical: "/" },
		openGraph: {
			title,
			description: description || undefined,
			url: "/",
			type: "profile",
			locale: "zh_CN",
		},
	};
}

export default async function HomePage() {
	const [data, page, profile, equipment, recent] = await Promise.all([
		loadSiteShellData(),
		loadPage("home"),
		loadProfile(),
		loadEquipment(),
		getRecentPublishedNotes(3),
	]);

	if (!profile) {
		// 没有真实个人资料时不显示首页，也不编造姓名与呼号
		notFound();
	}
	const avatar = profile.avatarMediaId
		? await getDb().media.findUnique({
				where: { id: profile.avatarMediaId },
				select: { visibility: true, publicObjectKey: true },
			})
		: null;
	const avatarUrl =
		avatar?.visibility === "verified"
			? publicMediaUrl(avatar.publicObjectKey)
			: null;

	const items = visibleEquipmentItems(equipment);
	const intro = page?.heroIntro || profile.intro;
	const primaryLabel = page?.primaryActionLabel || "认识我";
	const secondaryLabel = page?.secondaryActionLabel || "";
	const hasNotes = data.hasNotes;

	return (
		<div className="flex flex-col gap-16 lg:gap-20">
			<section className="grid gap-10 md:grid-cols-[3fr_2fr] md:items-start md:gap-12">
				<div>
					<h1 className="font-serif text-[2.1rem] leading-[1.25] text-fg sm:text-[2.6rem] lg:text-[2.75rem]">
						{profile.displayName}
					</h1>
					{intro ? (
						<p className="mt-5 max-w-[34rem] text-[1.0625rem] leading-[1.8] text-fg-muted">
							{intro}
						</p>
					) : null}

					<div className="mt-8 flex flex-wrap items-center gap-3">
						<Link
							href="/about/"
							className="inline-flex min-h-11 items-center rounded-control bg-accent px-5 text-accent-fg transition-opacity hover:opacity-90"
						>
							{primaryLabel}
						</Link>
						{hasNotes && secondaryLabel ? (
							<Link
								href="/notes/"
								className="inline-flex min-h-11 items-center rounded-control border border-border-token px-5 text-fg transition-colors hover:bg-sidebar"
							>
								{secondaryLabel}
							</Link>
						) : null}
					</div>

					<DialRule className="mt-10 max-w-[24rem]" />
				</div>

				<QslCard profile={profile} avatarUrl={avatarUrl} />
			</section>

			{hasNotes ? <RecentNotes notes={recent} /> : null}

			{items.length > 0 ? (
				<StationPeek names={items.map((i) => i.name)} />
			) : null}

			{profile.displayName || data.hasContact ? <FooterNote /> : null}
		</div>
	);
}

async function RecentNotes({
	notes,
}: {
	notes: Awaited<ReturnType<typeof getRecentPublishedNotes>>;
}) {
	if (notes.length === 0) return null;
	return (
		<section>
			<div className="flex items-baseline justify-between gap-4">
				<h2 className="font-serif text-xl text-fg">最近的笔记</h2>
				<Link href="/notes/" className="link text-sm">
					全部笔记
				</Link>
			</div>
			<ul className="mt-5 flex flex-col">
				{notes.map((note) => (
					<li
						key={note.slug}
						className="border-t border-border-token first:border-t-0"
					>
						<Link
							href={`/notes/${note.slug}/`}
							className="group flex flex-col gap-1 py-4 transition-colors"
						>
							<span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
								<span className="font-serif text-[1.0625rem] text-fg group-hover:text-accent">
									{note.title}
								</span>
								{note.category ? (
									<span className="text-sm text-fg-muted">
										{note.category}
									</span>
								) : null}
							</span>
							{note.description ? (
								<span className="text-[0.9375rem] text-fg-muted">
									{note.description}
								</span>
							) : null}
							<time
								dateTime={note.publishedAt.toISOString()}
								className="text-sm text-fg-muted"
							>
								{formatDate(note.publishedAt)}
							</time>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}

function StationPeek({ names }: { names: string[] }) {
	return (
		<section>
			<div className="flex items-baseline justify-between gap-4">
				<h2 className="font-serif text-xl text-fg">电台一瞥</h2>
				<Link href="/station/" className="link text-sm">
					我的电台
				</Link>
			</div>
			<p className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.9375rem] text-fg-muted">
				{names.slice(0, 6).map((name) => (
					<span key={name} className="param">
						{name}
					</span>
				))}
			</p>
		</section>
	);
}

function FooterNote() {
	return (
		<footer className="border-t border-border-token pt-6 text-sm text-fg-muted">
			<p>内容以 Markdown 记录，发布后即时可读。</p>
			<p className="mt-1">
				订阅：
				<Link href="/rss.xml" className="link">
					RSS
				</Link>
			</p>
		</footer>
	);
}
