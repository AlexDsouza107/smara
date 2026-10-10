// Connected vertical timeline: one continuous stem line with small pulse
// nodes, replacing the old pattern of giant standalone colored circles
// (each a different color) that read as disconnected blocks rather than
// one chronological thread.
function Timeline({ events }) {
  return (
    <div className="relative">
      <div className="absolute bottom-2 left-5 top-2 w-px bg-gradient-to-b from-purple-200 via-purple-200 to-transparent" />
      <div className="space-y-10">
        {events.map((event) => (
          <div key={event.id} className="relative pl-14">
            <span className="absolute left-5 top-1.5 flex h-4 w-4 -translate-x-1/2 items-center justify-center">
              <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-purple-300 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-purple-600 ring-4 ring-cream-300" />
            </span>

            <p className="text-xs font-semibold uppercase tracking-wide text-brand-purple-600">{event.year}</p>
            <div className="mt-1.5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="text-lg font-bold text-stone-900">{event.title}</h3>
              {event.description && (
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{event.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
