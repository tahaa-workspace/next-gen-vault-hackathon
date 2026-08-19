export default function Spinner({ size = 'md', label }) {
  const dim = size === 'lg' ? 'h-8 w-8' : size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <div className={`${dim} animate-spin rounded-full border-2 border-navy-200 border-t-navy-700`} />
      {label && <span className="text-sm text-navy-500">{label}</span>}
    </div>
  );
}
