import { Link } from 'react-router-dom';
import Disclaimer from '../../components/Disclaimer.jsx';

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-4 text-center text-white">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500 text-2xl font-bold">
        V
      </div>
      <h1 className="text-3xl font-bold md:text-4xl">Next Gen Vault</h1>
      <p className="mt-3 max-w-md text-navy-200">
        A digital legacy management prototype for organizing liabilities and enabling controlled disclosure to
        beneficiaries.
      </p>
      <div className="mt-8 flex gap-4">
        <Link to="/login" className="btn-secondary">
          Login
        </Link>
        <Link to="/register" className="btn-outline text-white border-navy-600 hover:bg-navy-800">
          Register
        </Link>
      </div>
      <div className="mt-10 max-w-md">
        <Disclaimer />
      </div>
    </div>
  );
}
