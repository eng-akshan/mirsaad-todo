export function StatCard({ label, value, icon: Icon, accent = 'bg-white' }) {
  return (
    <div className={`${accent} rounded-3xl border border-black/5 p-5 shadow-soft`}>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink/55">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink/5 text-ink"><Icon size={18} /></span>
      </div>
      <div className="text-3xl font-black tracking-tight text-ink">{value}</div>
    </div>
  );
}
