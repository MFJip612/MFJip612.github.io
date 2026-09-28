import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DialRule } from "@/components/site/dial-rule";
import type { EquipmentUsageStatus } from "@/features/content/schemas";
import {
	loadEquipment,
	visibleEquipmentItems,
} from "@/features/content/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "我的电台",
	alternates: { canonical: "/station/" },
};

const USAGE_LABELS: Record<EquipmentUsageStatus, string> = {
	current: "当前使用",
	former: "曾用",
	planned: "计划中",
};

export default async function StationPage() {
	const equipment = await loadEquipment();
	const items = visibleEquipmentItems(equipment);

	// 没有真实设备资料时整个栏目不出现，而不是显示一个空页面
	if (items.length === 0) notFound();

	return (
		<div className="max-w-[52rem]">
			<h1 className="font-serif text-[1.9rem] leading-[1.3] text-fg sm:text-[2.25rem]">
				我的电台
			</h1>
			<p className="mt-4 max-w-[38rem] text-[1.0625rem] leading-[1.8] text-fg-muted">
				下面是目前架设在台面上的设备，以及我用下来的一些心得。
			</p>

			<DialRule className="mt-8 max-w-[20rem]" />

			<ul className="mt-10 flex flex-col">
				{items.map((item) => (
					<li
						key={item.id}
						className="border-t border-border-token py-6 first:border-t-0 first:pt-0"
					>
						<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
							<h2 className="font-serif text-lg text-fg">
								{item.name}
							</h2>
							{item.category ? (
								<span className="param text-fg-muted">
									{item.category}
								</span>
							) : null}
							<span className="rounded-control bg-sidebar px-2 py-0.5 text-sm text-fg-muted">
								{USAGE_LABELS[item.usageStatus]}
							</span>
						</div>
						{item.description ? (
							<p className="mt-3 leading-[1.8] text-fg-muted">
								{item.description}
							</p>
						) : null}
					</li>
				))}
			</ul>
		</div>
	);
}
