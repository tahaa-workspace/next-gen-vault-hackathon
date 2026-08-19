import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import MetricCard from '../../components/MetricCard.jsx';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Disclaimer from '../../components/Disclaimer.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.dashboard();
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
        <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-navy-500">Platform overview and activation request management.</p>
      </div>

      <Disclaimer />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Users" value={stats.totalUsers} color="navy" />
        <MetricCard label="Owners" value={stats.owners} color="teal" />
        <MetricCard label="Beneficiaries" value={stats.beneficiaries} color="navy" />
        <MetricCard label="Active Liabilities" value={stats.activeLiabilities} color="navy" />
        <MetricCard label="Pending Requests" value={stats.pending} color="amber" />
        <MetricCard label="Approved Requests" value={stats.approved} color="teal" />
        <MetricCard label="Rejected Requests" value={stats.rejected} color="red" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/users" className="btn-outline">Manage Users</Link>
        <Link to="/admin/activation-requests" className="btn-primary">View Activation Requests</Link>
      </div>
    </div>
  );
}
