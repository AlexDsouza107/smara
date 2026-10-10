// Standardized metric card: white surface, one colored icon badge, a thin
// top accent border for at-a-glance category recognition. Replaces the old
// pattern of fully color-filled pastel cards (hard to read, no consistent
// hierarchy) with a single calm neutral surface.
const ACCENTS = {
  purple: { badge: 'bg-purple-50 text-purple-600', top: 'border-t-purple-400' },
  blue: { badge: 'bg-sky-50 text-sky-600', top: 'border-t-sky-400' },
  green: { badge: 'bg-emerald-50 text-emerald-600', top: 'border-t-emerald-400' },
  amber: { badge: 'bg-amber-50 text-amber-600', top: 'border-t-amber-400' },
};

function StatCard({ icon: Icon, label, value, sublabel, accent = 'purple' }) {
  const a = ACCENTS[accent] || ACCENTS.purple;

  return (
    <div
      className={`rounded-2xl border border-t-4 border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${a.top}`}
    >
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${a.badge}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-bold text-stone-900">{value}</p>
      <p className="text-sm font-medium text-stone-700">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-stone-600">{sublabel}</p>}
    </div>
  );
}

export default StatCard;
