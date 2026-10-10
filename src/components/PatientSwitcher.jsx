import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, User } from 'lucide-react';

// Interactive patient pill: avatar + name + active-status dot + chevron,
// opening a small panel with patient details and a link to the full
// profile. Replaces a plain "Patient: Name" text label.
function PatientSwitcher({ patient }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const name = patient?.name || 'Patient';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex min-h-[44px] items-center gap-2.5 rounded-full border border-stone-200 bg-white/90 py-1.5 pl-1.5 pr-3 shadow-xs transition hover:border-stone-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-400 focus-visible:ring-offset-2"
      >
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
          <User className="h-4 w-4" />
          <span
            aria-hidden
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
          />
        </span>
        <span className="min-w-0 text-left">
          <span className="block truncate text-sm font-semibold leading-tight text-stone-900">{name}</span>
          <span className="block text-[11px] font-medium leading-tight text-emerald-700">Active</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
          <p className="border-b border-stone-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Current patient
          </p>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              <User className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-900">{name}</p>
              {patient?.age && <p className="text-xs text-stone-600">{patient.age} years</p>}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
            </span>
          </div>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="block min-h-[44px] border-t border-stone-100 px-4 py-3 text-sm font-medium leading-[1.75rem] text-brand-purple-700 hover:bg-stone-50"
          >
            Manage patient profile →
          </Link>
        </div>
      )}
    </div>
  );
}

export default PatientSwitcher;
