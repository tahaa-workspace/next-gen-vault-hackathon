import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { liabilityApi } from '../../api';
import MetricCard from '../../components/MetricCard.jsx';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Disclaimer from '../../components/Disclaimer.jsx';
import { LiabilityStatusBadge } from '../../components/StatusBadge.jsx';
import { formatINR, formatDate } from '../../utils/format.js';

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await liabilityApi.dashboard();
      setStats(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Owner Dashboard</h1>
        <p className="mt-1 text-sm text-navy-500">Overview of your liability records. All amounts are owner-entered.</p>
      </div>

      <Disclaimer />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active Liabilities" value={stats.totalActive} color="navy" />
        <MetricCard label="Active Outstanding" value={formatINR(stats.activeOutstanding)} color="teal" />
        <MetricCard label="EMI Liabilities" value={stats.emiCount} color="navy" />
        <MetricCard label="Credit-Card Dues" value={stats.cardCount} color="navy" />
        <MetricCard label="Due in 7 Days" value={stats.dueSoon} color="amber" />
        <MetricCard label="Overdue" value={stats.overdue} color="red" />
        <MetricCard label="Closed" value={stats.closed} color="navy" />
        <MetricCard label="Needs Review" value={stats.needsReview} color="amber" />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-800">Recent Liabilities</h2>
          <Link to="/owner/liabilities" className="text-sm font-medium text-teal-600 hover:underline">
            View all
          </Link>
        </div>
        {stats.recent.length === 0 ? (
          <div className="card p-6 text-center text-sm text-navy-500">
            No liabilities yet. <Link to="/owner/liabilities/new" className="text-teal-600 hover:underline">Add one</Link>.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase text-navy-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3">Next Due</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {stats.recent.map((l) => (
                  <tr key={l._id} className="hover:bg-navy-50/50">
                    <td className="px-4 py-3 font-medium text-navy-800">
                      <Link to={`/owner/liabilities/${l._id}`} className="hover:text-teal-600 hover:underline">
                        {l.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-navy-600">{l.liabilityType.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-navy-800">{formatINR(l.outstandingAmount)}</td>
                    <td className="px-4 py-3 text-navy-600">{formatDate(l.nextDueDate)}</td>
                    <td className="px-4 py-3"><LiabilityStatusBadge liability={l} /></td>
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
