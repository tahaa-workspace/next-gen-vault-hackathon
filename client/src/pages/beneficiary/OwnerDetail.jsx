import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { beneficiaryApi, activationApi, releaseApi } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Disclaimer from '../../components/Disclaimer.jsx';
import { formatINR, formatDate } from '../../utils/format.js';

export default function OwnerDetail() {
  const { ownerId } = useParams();
  const toast = useToast();
  const [owners, setOwners] = useState([]);
  const [requests, setRequests] = useState([]);
  const [released, setReleased] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');

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

      const req = reqRes.data.data.items.find((r) => r.ownerId._id === ownerId && r.status === 'APPROVED');
      if (req) {
        try {
          const relRes = await releaseApi.liabilities(ownerId);
          setReleased(relRes.data.data.items || []);
        } catch {
          setReleased([]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [ownerId]);

  const owner = owners.find((o) => o.ownerId._id === ownerId);
  const req = requests.find((r) => r.ownerId._id === ownerId);
  const isApproved = req?.status === 'APPROVED';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await activationApi.create({ ownerId, reason });
      toast('Activation request submitted', 'success');
      setReason('');
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading owner…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!owner) return <ErrorState message="Owner relationship not found" />;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/beneficiary/owners" className="text-sm text-teal-600 hover:underline">← Back to owners</Link>
        <h1 className="mt-2 text-2xl font-bold text-navy-900">{owner.ownerId.name}</h1>
        <p className="mt-1 text-sm text-navy-500">Relationship: {owner.relationship}</p>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-3">
          {isApproved ? (
            <span className="badge bg-teal-100 text-teal-700">Vault Unlocked</span>
          ) : (
            <span className="badge bg-navy-100 text-navy-600">Vault Locked</span>
          )}
          {req && (
            <span className={`badge ${
              req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
              req.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' :
              req.status === 'APPROVED' ? 'bg-teal-100 text-teal-700' :
              'bg-red-100 text-red-700'
            }`}>Activation: {req.status.replace(/_/g, ' ')}</span>
          )}
        </div>
      </div>

      {!isApproved && (
        <div className="card p-6">
          <h2 className="mb-2 text-lg font-semibold text-navy-800">Request Activation</h2>
          <p className="mb-4 text-sm text-navy-500">
            Submit a request to unlock the vault. An admin will review and approve or reject it. Approval represents
            simulated legacy verification for this academic prototype.
          </p>
          {req && req.status !== 'REJECTED' ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You have a {req.status.replace(/_/g, ' ').toLowerCase()} request. Reason: "{req.reason}"
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Reason for activation</label>
                <textarea className="input" rows={3} value={reason}
                  onChange={(e) => setReason(e.target.value)} required minLength={5}
                  placeholder="Explain why you need access to the vault…" />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      )}

      {isApproved && (
        <div className="space-y-4">
          <Disclaimer />
          <div>
            <h2 className="mb-3 text-lg font-semibold text-navy-800">Released Liabilities</h2>
            {released.length === 0 ? (
              <EmptyState title="No released liabilities" message="The owner has not granted you access to any liabilities yet." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {released.map((l) => (
                  <Link key={l._id} to={`/beneficiary/released/${l._id}`} className="card block p-5 hover:border-teal-300">
                    <h3 className="font-semibold text-navy-800">{l.title}</h3>
                    <p className="mt-1 text-sm text-navy-500">{l.liabilityType === 'CREDIT_CARD' ? 'Credit Card' : 'EMI'} · {l.providerName || '—'}</p>
                    <p className="mt-2 text-sm font-medium text-navy-700">{formatINR(l.outstandingAmount)}</p>
                    <p className="mt-1 text-xs text-navy-400">Next due: {formatDate(l.nextDueDate)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
