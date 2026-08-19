import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { liabilityApi } from '../../api';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { LiabilityStatusBadge } from '../../components/StatusBadge.jsx';
import { formatINR, formatDate, isOverdue } from '../../utils/format.js';

export default function LiabilityList() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '', liabilityType: '', status: '', sort: 'nextDueDate', order: 'asc', page: 1,
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await liabilityApi.list(params);
      setData(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

  const update = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Liabilities</h1>
          <p className="mt-1 text-sm text-navy-500">Manage your EMI and credit-card obligations.</p>
        </div>
        <Link to="/owner/liabilities/new" className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Liability
        </Link>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            className="input"
            placeholder="Search title or provider…"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
          />
          <select className="input" value={filters.liabilityType} onChange={(e) => update({ liabilityType: e.target.value })}>
            <option value="">All types</option>
            <option value="EMI">EMI</option>
            <option value="CREDIT_CARD">Credit Card</option>
          </select>
          <select className="input" value={filters.status} onChange={(e) => update({ status: e.target.value })}>
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select className="input" value={filters.sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="nextDueDate">Sort: Due Date</option>
            <option value="outstandingAmount">Sort: Outstanding</option>
            <option value="createdAt">Sort: Created</option>
            <option value="updatedAt">Sort: Updated</option>
          </select>
          <select className="input" value={filters.order} onChange={(e) => update({ order: e.target.value })}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner label="Loading liabilities…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="No liabilities found"
          message="Adjust filters or add a new liability record."
          action={<Link to="/owner/liabilities/new" className="btn-primary">Add Liability</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase text-navy-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3">Next Due</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {data.items.map((l) => (
                  <tr key={l._id} className="hover:bg-navy-50/50">
                    <td className="px-4 py-3 font-medium text-navy-800">
                      <Link to={`/owner/liabilities/${l._id}`} className="hover:text-teal-600 hover:underline">
                        {l.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-navy-600">{l.liabilityType === 'CREDIT_CARD' ? 'Credit Card' : 'EMI'}</td>
                    <td className="px-4 py-3 text-navy-600">{l.providerName || '—'}</td>
                    <td className="px-4 py-3 text-navy-800">{formatINR(l.outstandingAmount)}</td>
                    <td className="px-4 py-3 text-navy-600">{formatDate(l.nextDueDate)}</td>
                    <td className="px-4 py-3"><LiabilityStatusBadge liability={l} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/owner/liabilities/${l._id}`} className="text-teal-600 hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.pages > 1 && (
            <div className="flex items-center justify-between border-t border-navy-100 px-4 py-3">
              <span className="text-xs text-navy-500">Page {filters.page} of {data.pages}</span>
              <div className="flex gap-2">
                <button
                  className="btn-outline text-xs"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                >
                  Previous
                </button>
                <button
                  className="btn-outline text-xs"
                  disabled={filters.page >= data.pages}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
