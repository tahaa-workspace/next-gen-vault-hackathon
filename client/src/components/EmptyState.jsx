export default function EmptyState({ title, message, icon: Icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-200 bg-navy-50/50 px-6 py-12 text-center">
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-navy-100">
          <Icon className="h-6 w-6 text-navy-500" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-navy-800">{title}</h3>
      {message && <p className="mt-1 text-sm text-navy-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
