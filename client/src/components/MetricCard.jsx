export default function MetricCard({ label, value, sub, color = 'navy', icon: Icon }) {
  const colors = {
    navy: 'border-navy-100 bg-navy-50 text-navy-700',
    teal: 'border-teal-100 bg-teal-50 text-teal-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    green: 'border-teal-200 bg-teal-50 text-teal-700',
  };
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-navy-500">{sub}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
