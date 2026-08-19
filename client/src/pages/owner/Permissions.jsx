import { useEffect, useState } from 'react';
import { permissionApi, beneficiaryApi, liabilityApi, documentApi } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { formatDate } from '../../utils/format.js';

export default function Permissions() {
  const toast = useToast();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [perms, setPerms] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBen, setSelectedBen] = useState('');
  const [selectedType, setSelectedType] = useState('LIABILITY');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [granting, setGranting] = useState(false);
  const [revokeId, setRevokeId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [benRes, liabRes, permRes] = await Promise.all([
        beneficiaryApi.list(),
        liabilityApi.list({ limit: 100 }),
        permissionApi.list(),
      ]);
      setBeneficiaries(benRes.data.data.items.filter((b) => b.invitationStatus === 'ACCEPTED'));
      setLiabilities(liabRes.data.data.items);
      setPerms(permRes.data.data.items);
      const docPromises = liabRes.data.data.items.map((l) => documentApi.list(l._id).catch(() => ({ data: { data: { items: [] } } })));
      const docResults = await Promise.all(docPromises);
      const allDocs = docResults.flatMap((r) => r.data.data.items);
      setDocuments(allDocs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGrant = async (e) => {
    e.preventDefault();
    setGranting(true);
    try {
      await permissionApi.create({
        beneficiaryId: selectedBen,
        targetType: selectedType,
        targetId: selectedTarget,
      });
      toast('Permission granted', 'success');
      setSelectedTarget('');
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async () => {
    try {
      await permissionApi.delete(revokeId);
      toast('Permission revoked', 'success');
      setRevokeId(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (loading) return <Spinner label="Loading permissions…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const targets = selectedType === 'LIABILITY' ? liabilities : documents;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Permissions</h1>
        <p className="mt-1 text-sm text-navy-500">
          Grant item-level access to accepted beneficiaries. Liability permission does not grant document permission.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy-800">Grant Permission</h2>
        {beneficiaries.length === 0 ? (
          <EmptyState title="No accepted beneficiaries" message="Add and get a beneficiary to accept an invitation first." />
        ) : (
          <form onSubmit={handleGrant} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="label">Beneficiary</label>
              <select className="input" value={selectedBen} onChange={(e) => setSelectedBen(e.target.value)} required>
                <option value="">Select…</option>
                {beneficiaries.map((b) => (
                  <option key={b._id} value={b.beneficiaryId._id}>{b.beneficiaryId.name} ({b.beneficiaryId.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Target Type</label>
              <select className="input" value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setSelectedTarget(''); }}>
                <option value="LIABILITY">Liability</option>
                <option value="DOCUMENT">Document</option>
              </select>
            </div>
            <div>
              <label className="label">Target</label>
              <select className="input" value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)} required>
                <option value="">Select…</option>
                {targets.map((t) => (
                  <option key={t._id} value={t._id}>{t.title || t.originalName}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full" disabled={granting || !selectedBen || !selectedTarget}>
                {granting ? 'Granting…' : 'Grant'}
              </button>
            </div>
          </form>
        )}
      </div>

      {perms.length === 0 ? (
        <EmptyState title="No permissions granted" message="Grant access to specific liabilities or documents above." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase text-navy-500">
              <tr>
                <th className="px-4 py-3">Beneficiary</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Granted</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {perms.map((p) => (
                <tr key={p._id} className="hover:bg-navy-50/50">
                  <td className="px-4 py-3 font-medium text-navy-800">{p.beneficiaryId?.name || '—'}</td>
                  <td className="px-4 py-3 text-navy-600">{p.targetType}</td>
                  <td className="px-4 py-3 text-navy-600">{p.targetId}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.status === 'ACTIVE' ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy-500">{formatDate(p.grantedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {p.status === 'ACTIVE' ? (
                      <button className="text-xs text-red-600 hover:underline" onClick={() => setRevokeId(p._id)}>
                        Revoke
                      </button>
                    ) : (
                      <span className="text-xs text-navy-400">Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!revokeId}
        title="Revoke this permission?"
        message="The beneficiary will lose access to this item on their next request."
        confirmLabel="Revoke"
        danger
        onConfirm={handleRevoke}
        onCancel={() => setRevokeId(null)}
      />
    </div>
  );
}
