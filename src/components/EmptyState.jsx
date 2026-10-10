// Reusable empty state: icon, short title, one line of instructional copy,
// and an optional primary action — for any "nothing here yet" moment
// (Memory Finder results, empty library, etc.) instead of a bare paragraph.
function EmptyState({ icon: Icon, title, description, actionLabel, onAction, actionIcon: ActionIcon }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-stone-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-stone-600">{description}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-400 focus-visible:ring-offset-2"
        >
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
