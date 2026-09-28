/**
 * 刻度线：把无线电仪表盘上的"刻度"抽成一个排版元件，
 * 作为分隔线与标题装饰使用。
 *
 * 它是纯装饰（aria-hidden），不代表任何实时读数、在线或发射状态。
 */
const TICKS = Array.from({ length: 40 }, (_, index) => ({
	key: `tick-${index}`,
	major: index % 5 === 0,
}));

export function DialRule({ className = "" }: { className?: string }) {
	return (
		<span
			aria-hidden="true"
			className={`flex h-2.5 w-full items-end gap-[3px] ${className}`}
		>
			{TICKS.map((tick) => (
				<span
					key={tick.key}
					className="block w-px bg-border-token"
					style={{ height: tick.major ? "10px" : "5px" }}
				/>
			))}
		</span>
	);
}
