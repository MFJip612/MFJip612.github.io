const lines = [
  <span key="comment" className="text-muted">
    {"// Software for a calmer, more open web."}
  </span>,
  <span key="declaration">
    <span className="text-accent">const</span> ideas = [
  </span>,
  <span key="first" className="pl-6 text-amber">
    &quot;better tools&quot;,
  </span>,
  <span key="second" className="pl-6 text-amber">
    &quot;clearer systems&quot;,
  </span>,
  <span key="third" className="pl-6 text-amber">
    &quot;kinder interfaces&quot;,
  </span>,
  <span key="end">];</span>,
];

export function CodeStatement() {
  return (
    <div className="border border-line bg-surface/50 font-mono text-sm leading-8 sm:text-base">
      <div className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr]">
        <div
          className="border-r border-line py-7 text-center text-muted/70 sm:py-9"
          aria-hidden="true"
        >
          {lines.map((_, index) => (
            <span key={index} className="block">
              {String(index + 1).padStart(2, "0")}
            </span>
          ))}
        </div>
        <div className="min-w-0 overflow-x-auto px-5 py-7 sm:px-8 sm:py-9">
          {lines.map((line, index) => (
            <span key={index} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
          <span className="mt-6 block text-right text-amber">
            {"// keep building"}
          </span>
        </div>
      </div>
    </div>
  );
}
