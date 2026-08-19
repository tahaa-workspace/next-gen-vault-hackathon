import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { beneficiaryApi, activationApi, releaseApi } from '../../api';
import MetricCard from '../../components/MetricCard.jsx';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Disclaimer from '../../components/Disclaimer.jsx';
import { formatDate } from '../../utils/format.js';

export default function BeneficiaryDashboard() {
  const [owners, setOwners] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [released, setReleased] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [ownRes, invRes, reqRes] = await Promise.all([
        beneficiaryApi.owners(),
        beneficiaryApi.invitations(),
        activationApi.mine(),
      ]);
      setOwners(ownRes.data.data.items);
      setInvitations(invRes.data.data.items.filter((i) => i.invitationStatus === 'PENDING'));
      setRequests(reqRes.data.data.items);

      const approvedOwners = reqRes.data.data.items
        .filter((r) => r.status === 'APPROVED')
        .map((r) => r.ownerId._id);
      if (approvedOwners.length > 0) {
        const relPromises = approvedOwners.map((oid) => releaseApi.liabilities(oid).catch(() => null));
        const relResults = await Promise.all(relPromises);
        const allReleased = relResults.flatMap((r) => r?.data?.data?.items || []);
        setReleased(allReleased);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Beneficiary Dashboard</h1>
        <p className="mt-1 text-sm text-navy-500">Your assigned owners and activation status.</p>
      </div>

      <Disclaimer />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Assigned Owners" value={owners.length} color="navy" />
        <MetricCard label="Pending Invitations" value={invitations.length} color="amber" />
        <MetricCard label="Approved Activations" value={approvedCount} color="teal" />
        <MetricCard label="Released Items" value={released.length} color="teal" />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-navy-800">Assigned Owners</h2>
        {owners.length === 0 ? (
          <EmptyState title="No assigned owners" message="You have no accepted owner relationships yet." />
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
                  {req && (
                    <p className="mt-1 text-xs text-navy-400">
                      Activation: <span className="font-medium">{req.status.replace(/_/g, ' ')}</span>
                    </p>
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

      {released.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-navy-800">Recent Released Liabilities</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase text-navy-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Next Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {released.map((l) => (
                  <tr key={l._id} className="hover:bg-navy-50/50">
                    <td className="px-4 py-3 font-medium text-navy-800">
                      <Link to={`/beneficiary/released/${l._id}`} className="hover:text-teal-600 hover:underline">{l.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-navy-600">{l.liabilityType === 'CREDIT_CARD' ? 'Credit Card' : 'EMI'}</td>
                    <td className="px-4 py-3 text-navy-600">{l.providerName || '—'}</td>
                    <td className="px-4 py-3 text-navy-600">{formatDate(l.nextDueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
