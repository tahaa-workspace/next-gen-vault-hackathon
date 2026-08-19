import { useEffect, useState } from 'react';
import { beneficiaryApi } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { formatDate } from '../../utils/format.js';

export default function Beneficiaries() {
  const toast = useToast();
  const [rels, setRels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', relationship: '' });
  const [adding, setAdding] = useState(false);
  const [revokeId, setRevokeId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await beneficiaryApi.list();
      setRels(res.data.data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await beneficiaryApi.add(form);
      toast('Invitation sent', 'success');
      setForm({ email: '', relationship: '' });
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleRevoke = async () => {
    try {
      await beneficiaryApi.revoke(revokeId);
      toast('Relationship revoked', 'success');
      setRevokeId(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Beneficiaries</h1>
        <p className="mt-1 text-sm text-navy-500">Add registered beneficiaries by their exact email address.</p>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy-800">Add Beneficiary</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Beneficiary Email</label>
            <input type="email" className="input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Relationship</label>
            <input className="input" placeholder="Sibling, Spouse, Child…" value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value })} required />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full" disabled={adding}>
              {adding ? 'Sending…' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <Spinner label="Loading beneficiaries…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rels.length === 0 ? (
        <EmptyState title="No beneficiaries yet" message="Add a registered beneficiary by email to get started." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase text-navy-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Relationship</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {rels.map((r) => (
                <tr key={r._id} className="hover:bg-navy-50/50">
                  <td className="px-4 py-3 font-medium text-navy-800">{r.beneficiaryId?.name || '—'}</td>
                  <td className="px-4 py-3 text-navy-600">{r.beneficiaryId?.email || '—'}</td>
                  <td className="px-4 py-3 text-navy-600">{r.relationship}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      r.invitationStatus === 'ACCEPTED' ? 'bg-teal-100 text-teal-700' :
                      r.invitationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      r.invitationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-navy-100 text-navy-500'
                    }`}>{r.invitationStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-navy-500">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-red-600 hover:underline" onClick={() => setRevokeId(r._id)}>
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!revokeId}
        title="Revoke this relationship?"
        message="The beneficiary will no longer have access to any of your records."
        confirmLabel="Revoke"
        danger
        onConfirm={handleRevoke}
        onCancel={() => setRevokeId(null)}
      />
    </div>
  );
}
