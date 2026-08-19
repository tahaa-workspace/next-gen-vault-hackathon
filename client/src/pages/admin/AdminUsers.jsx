import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { formatDate } from '../../utils/format.js';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', role: '', active: '' });
  const [toggleUser, setToggleUser] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.active !== '') params.active = filters.active;
      const res = await adminApi.users(params);
      setUsers(res.data.data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

  const update = (patch) => setFilters((f) => ({ ...f, ...patch }));

  const handleToggle = async () => {
    if (!toggleUser) return;
    try {
      await adminApi.updateUserStatus(toggleUser._id, { active: !toggleUser.active });
      toast(`User ${!toggleUser.active ? 'activated' : 'deactivated'}`, 'success');
      setToggleUser(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (loading) return <Spinner label="Loading users…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">User Management</h1>
        <p className="mt-1 text-sm text-navy-500">Search, filter and manage user accounts. Passwords are never shown.</p>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input className="input" placeholder="Search name or email…" value={filters.search}
            onChange={(e) => update({ search: e.target.value })} />
          <select className="input" value={filters.role} onChange={(e) => update({ role: e.target.value })}>
            <option value="">All roles</option>
            <option value="OWNER">Owner</option>
            <option value="BENEFICIARY">Beneficiary</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select className="input" value={filters.active} onChange={(e) => update({ active: e.target.value })}>
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Deactivated</option>
          </select>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState title="No users found" message="Adjust filters to see users." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase text-navy-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-navy-50/50">
                  <td className="px-4 py-3 font-medium text-navy-800">{u.name}</td>
                  <td className="px-4 py-3 text-navy-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      u.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' :
                      u.role === 'OWNER' ? 'bg-teal-100 text-teal-700' :
                      'bg-navy-100 text-navy-700'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.active ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                      {u.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        className={`text-xs hover:underline ${u.active ? 'text-red-600' : 'text-teal-600'}`}
                        onClick={() => setToggleUser(u)}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!toggleUser}
        title={`${toggleUser?.active ? 'Deactivate' : 'Activate'} this user?`}
        message={toggleUser?.active
          ? 'The user will not be able to log in or access protected APIs.'
          : 'The user will be able to log in again.'}
        confirmLabel={toggleUser?.active ? 'Deactivate' : 'Activate'}
        danger={toggleUser?.active}
        onConfirm={handleToggle}
        onCancel={() => setToggleUser(null)}
      />
    </div>
  );
}
