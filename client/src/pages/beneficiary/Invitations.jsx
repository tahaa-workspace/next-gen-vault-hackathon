import { useEffect, useState } from 'react';
import { beneficiaryApi } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate } from '../../utils/format.js';

export default function Invitations() {
  const toast = useToast();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await beneficiaryApi.invitations();
      setInvites(res.data.data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, action, label) => {
    try {
      await action(id);
      toast(label, 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (loading) return <Spinner label="Loading invitations…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Invitations</h1>
        <p className="mt-1 text-sm text-navy-500">Accept or reject owner invitations.</p>
      </div>

      {invites.length === 0 ? (
        <EmptyState title="No invitations" message="You have no pending or past invitations." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {invites.map((inv) => (
            <div key={inv._id} className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-navy-800">{inv.ownerId?.name || 'Unknown Owner'}</h3>
                <span className={`badge ${
                  inv.invitationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                  inv.invitationStatus === 'ACCEPTED' ? 'bg-teal-100 text-teal-700' :
                  inv.invitationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-navy-100 text-navy-500'
                }`}>{inv.invitationStatus}</span>
              </div>
              <p className="mt-1 text-sm text-navy-500">Relationship: {inv.relationship}</p>
              <p className="mt-1 text-xs text-navy-400">Received: {formatDate(inv.createdAt)}</p>
              {inv.invitationStatus === 'PENDING' && (
                <div className="mt-4 flex gap-2">
                  <button className="btn-secondary text-sm"
                    onClick={() => handleAction(inv._id, beneficiaryApi.accept, 'Invitation accepted')}>
                    Accept
                  </button>
                  <button className="btn-outline text-sm"
                    onClick={() => handleAction(inv._id, beneficiaryApi.reject, 'Invitation rejected')}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
