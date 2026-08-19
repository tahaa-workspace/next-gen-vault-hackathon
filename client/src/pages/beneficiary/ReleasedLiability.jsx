import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { releaseApi } from '../../api';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Disclaimer from '../../components/Disclaimer.jsx';
import { LiabilityStatusBadge } from '../../components/StatusBadge.jsx';
import { formatINR, formatDate } from '../../utils/format.js';

export default function ReleasedLiability() {
  const { id } = useParams();
  const [liability, setLiability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await releaseApi.liability(id);
      setLiability(res.data.data.liability);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <Spinner label="Loading released liability…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const isEmi = liability.liabilityType === 'EMI';

  return (
    <div className="space-y-6">
      <div>
        <Link to="/beneficiary/dashboard" className="text-sm text-teal-600 hover:underline">← Back to dashboard</Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-navy-900">{liability.title}</h1>
          <LiabilityStatusBadge liability={liability} />
        </div>
        <p className="mt-1 text-sm text-navy-500">{isEmi ? 'EMI / Loan' : 'Credit Card'} · {liability.providerName || '—'}</p>
      </div>

      <Disclaimer />

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy-800">Authorized Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Liability Type" value={isEmi ? 'EMI / Loan' : 'Credit Card'} />
          <Field label="Provider" value={liability.providerName || '—'} />
          <Field label="Masked Reference" value={liability.maskedReference || '—'} />
          <Field label="Outstanding Amount" value={formatINR(liability.outstandingAmount)} />
          <Field label="Amount As Of" value={formatDate(liability.amountAsOf)} />
          <Field label="Next Due Date" value={formatDate(liability.nextDueDate)} />
          <Field label="Status" value={liability.status} />
        </div>

        {isEmi && liability.emiDetails && (
          <div className="mt-4 border-t border-navy-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-navy-700">EMI Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="EMI Amount" value={formatINR(liability.emiDetails.emiAmount)} />
              <Field label="Frequency" value={liability.emiDetails.frequency} />
              <Field label="Loan Category" value={liability.emiDetails.loanCategory} />
              <Field label="Remaining Installments" value={liability.emiDetails.remainingInstallments} />
            </div>
          </div>
        )}

        {!isEmi && liability.cardDetails && (
          <div className="mt-4 border-t border-navy-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-navy-700">Credit Card Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Card Issuer" value={liability.cardDetails.cardIssuer || '—'} />
              <Field label="Last Four Digits" value={liability.cardDetails.lastFourDigits || '—'} />
              <Field label="Total Due" value={formatINR(liability.cardDetails.totalDue)} />
              <Field label="Minimum Due" value={formatINR(liability.cardDetails.minimumDue)} />
            </div>
          </div>
        )}

        {liability.notes && (
          <div className="mt-4 border-t border-navy-100 pt-4">
            <p className="label">Safe Notes</p>
            <p className="text-sm text-navy-600">{liability.notes}</p>
          </div>
        )}

        {liability.documents && liability.documents.length > 0 && (
          <div className="mt-4 border-t border-navy-100 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-navy-700">Permitted Documents</h3>
            <ul className="space-y-2">
              {liability.documents.map((d) => (
                <li key={d._id} className="flex items-center justify-between rounded-lg border border-navy-100 px-3 py-2">
                  <span className="truncate text-sm text-navy-700">{d.originalName}</span>
                  <a href={releaseApi.documentDownloadUrl(d._id)} target="_blank" rel="noreferrer"
                    className="text-xs text-teal-600 hover:underline">View</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
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
