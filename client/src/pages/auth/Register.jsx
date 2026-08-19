import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'OWNER', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      toast('Account created', 'success');
      const dest = user.role === 'OWNER' ? '/owner/dashboard' : '/beneficiary/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4 py-8">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-lg font-bold text-white">
            V
          </div>
          <h1 className="text-xl font-bold text-navy-900">Create your account</h1>
          <p className="mt-1 text-sm text-navy-500">Register as an Owner or Beneficiary</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" className="input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password (min 8 characters)</label>
            <input id="password" type="password" className="input" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone (optional)</label>
            <input id="phone" className="input" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Role</label>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-navy-200 p-3">
                <input type="radio" name="role" value="OWNER" checked={form.role === 'OWNER'}
                  onChange={() => setForm({ ...form, role: 'OWNER' })} />
                <span className="text-sm font-medium text-navy-700">Owner</span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-navy-200 p-3">
                <input type="radio" name="role" value="BENEFICIARY" checked={form.role === 'BENEFICIARY'}
                  onChange={() => setForm({ ...form, role: 'BENEFICIARY' })} />
                <span className="text-sm font-medium text-navy-700">Beneficiary</span>
              </label>
            </div>
            <p className="mt-1 text-xs text-navy-400">Admin accounts cannot be created through registration.</p>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-navy-500">
          Already have an account? <Link to="/login" className="font-medium text-teal-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
