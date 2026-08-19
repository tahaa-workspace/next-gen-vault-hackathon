import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { liabilityApi, documentApi, permissionApi } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { LiabilityStatusBadge } from '../../components/StatusBadge.jsx';
import { formatINR, formatDate, formatDateTime, isOverdue } from '../../utils/format.js';

export default function LiabilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [liability, setLiability] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [perms, setPerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [liabRes, docsRes] = await Promise.all([
        liabilityApi.get(id),
        documentApi.list(id),
      ]);
      setLiability(liabRes.data.data.liability);
      setDocuments(docsRes.data.data.items);
      try {
        const permRes = await permissionApi.list({ targetType: 'LIABILITY' });
        setPerms(permRes.data.data.items.filter((p) => p.targetId === id));
      } catch {
        setPerms([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async (action, label) => {
    try {
      await action();
      toast(label, 'success');
      setModal(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('parentId', id);
      fd.append('category', 'GENERIC');
      await documentApi.upload(fd);
      toast('Document uploaded', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (loading) return <Spinner label="Loading liability…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!liability) return <ErrorState message="Liability not found" />;

  const overdue = isOverdue(liability);
  const isEmi = liability.liabilityType === 'EMI';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy-900">{liability.title}</h1>
            <LiabilityStatusBadge liability={liability} />
          </div>
          <p className="mt-1 text-sm text-navy-500">
            {isEmi ? 'EMI / Loan' : 'Credit Card'} · {liability.providerName || 'No provider'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/owner/liabilities/${id}/edit`} className="btn-outline">Edit</Link>
          {liability.status !== 'CLOSED' && (
            <button className="btn-outline" onClick={() => setModal('close')}>Close</button>
          )}
          {liability.status !== 'ARCHIVED' && (
            <button className="btn-outline" onClick={() => setModal('archive')}>Archive</button>
          )}
          {liability.status === 'ARCHIVED' && (
            <button className="btn-outline" onClick={() => handleAction(() => liabilityApi.restore(id), 'Restored')}>Restore</button>
          )}
          <button className="btn-danger" onClick={() => setModal('delete')}>Delete</button>
        </div>
      </div>

      {overdue && liability.status === 'ACTIVE' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This liability has a past due date and is shown as overdue. The status has not been changed automatically.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card space-y-4 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-navy-800">Liability Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Outstanding Amount" value={formatINR(liability.outstandingAmount)} />
            <Field label="Amount As Of" value={formatDate(liability.amountAsOf)} />
            <Field label="Next Due Date" value={formatDate(liability.nextDueDate)} />
            <Field label="Currency" value={liability.currency} />
            <Field label="Masked Reference" value={liability.maskedReference || '—'} />
            <Field label="Auto-Pay" value={liability.autoPayEnabled ? 'Enabled' : 'Disabled'} />
            <Field label="Last Reviewed" value={formatDateTime(liability.lastReviewedAt)} />
            {liability.closedAt && <Field label="Closed At" value={formatDateTime(liability.closedAt)} />}
          </div>
          {liability.notes && (
            <div>
              <p className="label">Notes</p>
              <p className="text-sm text-navy-600">{liability.notes}</p>
            </div>
          )}

          {isEmi ? (
            <div className="border-t border-navy-100 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-navy-700">EMI Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="EMI Amount" value={formatINR(liability.emiDetails?.emiAmount)} />
                <Field label="Frequency" value={liability.emiDetails?.frequency} />
                <Field label="Loan Category" value={liability.emiDetails?.loanCategory} />
                <Field label="Remaining Installments" value={liability.emiDetails?.remainingInstallments} />
                <Field label="Interest Rate" value={liability.emiDetails?.interestRate ? `${liability.emiDetails.interestRate}%` : '—'} />
                <Field label="Maturity Date" value={formatDate(liability.emiDetails?.maturityDate)} />
              </div>
            </div>
          ) : (
            <div className="border-t border-navy-100 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-navy-700">Credit Card Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Card Issuer" value={liability.cardDetails?.cardIssuer || '—'} />
                <Field label="Last Four Digits" value={liability.cardDetails?.lastFourDigits || '—'} />
                <Field label="Total Due" value={formatINR(liability.cardDetails?.totalDue)} />
                <Field label="Minimum Due" value={formatINR(liability.cardDetails?.minimumDue)} />
                <Field label="Billing Cycle Date" value={formatDate(liability.cardDetails?.billingCycleDate)} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-navy-800">Documents</h2>
            {documents.length === 0 ? (
              <p className="text-sm text-navy-500">No documents attached.</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((d) => (
                  <li key={d._id} className="flex items-center justify-between rounded-lg border border-navy-100 px-3 py-2">
                    <span className="truncate text-sm text-navy-700">{d.originalName}</span>
                    <div className="flex gap-2">
                      <a href={documentApi.downloadUrl(d._id)} target="_blank" rel="noreferrer"
                        className="text-xs text-teal-600 hover:underline">View</a>
                      <button className="text-xs text-red-600 hover:underline"
                        onClick={() => handleAction(() => documentApi.delete(d._id), 'Document deleted')}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleUpload} className="hidden" />
              <button className="btn-outline w-full" disabled={uploading}
                onClick={() => fileRef.current?.click()}>
                {uploading ? 'Uploading…' : 'Upload Document'}
              </button>
              <p className="mt-1 text-xs text-navy-400">PDF, PNG, JPG · max 5 MB</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-navy-800">Beneficiary Permissions</h2>
            {perms.length === 0 ? (
              <p className="text-sm text-navy-500">No beneficiary has permission for this liability.</p>
            ) : (
              <ul className="space-y-2">
                {perms.map((p) => (
                  <li key={p._id} className="flex items-center justify-between rounded-lg border border-navy-100 px-3 py-2">
                    <span className="text-sm text-navy-700">{p.beneficiaryId?.name || 'Unknown'}</span>
                    <span className={`badge ${p.status === 'ACTIVE' ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/owner/permissions" className="mt-3 block text-sm text-teal-600 hover:underline">
              Manage permissions
            </Link>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={modal === 'close'}
        title="Close this liability?"
        message="Closing marks the liability as settled. It will be excluded from active totals but kept as history."
        confirmLabel="Close Liability"
        onConfirm={() => handleAction(() => liabilityApi.close(id), 'Liability closed')}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal === 'archive'}
        title="Archive this liability?"
        message="Archiving hides this liability from the default list. You can restore it later."
        confirmLabel="Archive"
        onConfirm={() => handleAction(() => liabilityApi.archive(id), 'Liability archived')}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal === 'delete'}
        title="Delete this liability?"
        message="This permanently deletes the liability record. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          liabilityApi.delete(id).then(() => {
            toast('Liability deleted', 'success');
            navigate('/owner/liabilities');
          }).catch((err) => toast(err.message, 'error'));
          setModal(null);
        }}
        onCancel={() => setModal(null)}
      />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-navy-800">{value ?? '—'}</p>
    </div>
  );
}
