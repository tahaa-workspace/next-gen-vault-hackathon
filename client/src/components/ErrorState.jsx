export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <svg className="mb-2 h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm font-medium text-red-700">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-3 text-xs">
          Try again
        </button>
      )}
    </div>
  );
}
