import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-50 px-4 text-center">
      <div className="card max-w-md p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-navy-900">Unauthorized</h1>
        <p className="mt-2 text-sm text-navy-500">
          You don't have permission to view this page. Please sign in with an appropriate account.
        </p>
        <Link to="/login" className="btn-primary mt-6 inline-block">
          Go to login
        </Link>
      </div>
    </div>
  );
}
