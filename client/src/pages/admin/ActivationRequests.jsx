import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate } from '../../utils/format.js';

export default function ActivationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.activationRequests(params);
      setRequests(res.data.data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  if (loading) return <Spinner label="Loading activation requests…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Activation Requests</h1>
        <p className="mt-1 text-sm text-navy-500">Review and decide on beneficiary activation requests.</p>
      </div>

      <div className="card p-4">
        <div className="flex gap-3">
          <select className="input max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyState title="No activation requests" message="There are no requests matching the filter." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase text-navy-500">
              <tr>
                <th className="px-4 py-3">Requester</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {requests.map((r) => (
                <tr key={r._id} className="hover:bg-navy-50/50">
                  <td className="px-4 py-3 font-medium text-navy-800">{r.requestedBy?.name || '—'}</td>
                  <td className="px-4 py-3 text-navy-600">{r.ownerId?.name || '—'}</td>
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
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/activation-requests/${r._id}`} className="text-teal-600 hover:underline">
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
