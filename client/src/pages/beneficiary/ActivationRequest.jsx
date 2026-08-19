import { useEffect, useState } from 'react';
import { activationApi, beneficiaryApi } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, formatDateTime } from '../../utils/format.js';

export default function ActivationRequest() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ownerId: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [reqRes, ownRes] = await Promise.all([
        activationApi.mine(),
        beneficiaryApi.owners(),
      ]);
      setRequests(reqRes.data.data.items);
      setOwners(ownRes.data.data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await activationApi.create(form);
      toast('Activation request submitted', 'success');
      setForm({ ownerId: '', reason: '' });
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading activation requests…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const activeOwnerIds = new Set(
    requests.filter((r) => ['PENDING', 'UNDER_REVIEW', 'APPROVED'].includes(r.status)).map((r) => r.ownerId._id)
  );
  const availableOwners = owners.filter((o) => !activeOwnerIds.has(o.ownerId._id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Activation Requests</h1>
        <p className="mt-1 text-sm text-navy-500">
          Submit a request to unlock an owner's vault. Admin approval represents simulated legacy verification.
        </p>
      </div>

      {availableOwners.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-800">New Activation Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Select Owner</label>
              <select className="input" value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} required>
                <option value="">Select…</option>
                {availableOwners.map((o) => (
                  <option key={o.ownerId._id} value={o.ownerId._id}>{o.ownerId.name} ({o.relationship})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Reason</label>
              <textarea className="input" rows={3} value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })} required minLength={5}
                placeholder="Explain why you need access…" />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting || !form.ownerId}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-navy-800">My Requests</h2>
        {requests.length === 0 ? (
          <EmptyState title="No activation requests" message="Submit a request to unlock an owner's vault." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase text-navy-500">
                <tr>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3">Reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-navy-50/50">
                    <td className="px-4 py-3 font-medium text-navy-800">{r.ownerId?.name || '—'}</td>
                    <td className="px-4 py-3 text-navy-600 max-w-xs truncate">{r.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        r.status === 'APPROVED' ? 'bg-teal-100 text-teal-700' :
                        r.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        r.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' :
                        'bg-navy-100 text-navy-600'
                      }`}>{r.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-navy-500">{formatDate(r.requestedAt)}</td>
                    <td className="px-4 py-3 text-navy-500">{r.reviewedAt ? formatDateTime(r.reviewedAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
