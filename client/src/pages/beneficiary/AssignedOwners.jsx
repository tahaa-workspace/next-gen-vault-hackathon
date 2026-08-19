import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { beneficiaryApi, activationApi } from '../../api';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate } from '../../utils/format.js';

export default function AssignedOwners() {
  const [owners, setOwners] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [ownRes, reqRes] = await Promise.all([
        beneficiaryApi.owners(),
        activationApi.mine(),
      ]);
      setOwners(ownRes.data.data.items);
      setRequests(reqRes.data.data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner label="Loading assigned owners…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Assigned Owners</h1>
        <p className="mt-1 text-sm text-navy-500">Owners who have assigned you as a beneficiary.</p>
      </div>

      {owners.length === 0 ? (
        <EmptyState title="No assigned owners" message="Accept an invitation to see assigned owners here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {owners.map((r) => {
            const req = requests.find((rq) => rq.ownerId._id === r.ownerId._id);
            const isApproved = req?.status === 'APPROVED';
            return (
              <div key={r._id} className="card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-navy-800">{r.ownerId.name}</h3>
                  {isApproved ? (
                    <span className="badge bg-teal-100 text-teal-700">Unlocked</span>
                  ) : (
                    <span className="badge bg-navy-100 text-navy-600">Locked</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-navy-500">Relationship: {r.relationship}</p>
                {req ? (
                  <p className="mt-1 text-xs text-navy-400">
                    Activation: <span className="font-medium">{req.status.replace(/_/g, ' ')}</span>
                    {req.reviewedAt && ` · ${formatDate(req.reviewedAt)}`}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-navy-400">No activation request submitted.</p>
                )}
                <Link to={`/beneficiary/owners/${r.ownerId._id}`} className="mt-3 block text-sm text-teal-600 hover:underline">
                  View details →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
