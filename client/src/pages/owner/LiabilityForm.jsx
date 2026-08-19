import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { liabilityApi } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner.jsx';

const blank = {
  liabilityType: 'EMI',
  title: '', providerName: '', maskedReference: '', currency: 'INR',
  outstandingAmount: '', amountAsOf: '', nextDueDate: '', autoPayEnabled: false,
  status: 'ACTIVE', notes: '', lastReviewedAt: '',
  'emiDetails.emiAmount': '', 'emiDetails.frequency': 'MONTHLY',
  'emiDetails.remainingInstallments': '', 'emiDetails.interestRate': '',
  'emiDetails.maturityDate': '', 'emiDetails.loanCategory': 'HOME',
  'cardDetails.totalDue': '', 'cardDetails.minimumDue': '',
  'cardDetails.billingCycleDate': '', 'cardDetails.lastFourDigits': '',
  'cardDetails.cardIssuer': '',
};

export default function LiabilityForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await liabilityApi.get(id);
        const l = res.data.data.liability;
        const flat = { ...blank };
        Object.keys(blank).forEach((k) => {
          if (l[k] !== undefined) flat[k] = l[k];
        });
        if (l.emiDetails) {
          flat['emiDetails.emiAmount'] = l.emiDetails.emiAmount || '';
          flat['emiDetails.frequency'] = l.emiDetails.frequency || 'MONTHLY';
          flat['emiDetails.remainingInstallments'] = l.emiDetails.remainingInstallments || '';
          flat['emiDetails.interestRate'] = l.emiDetails.interestRate || '';
          flat['emiDetails.maturityDate'] = l.emiDetails.maturityDate?.slice(0, 10) || '';
          flat['emiDetails.loanCategory'] = l.emiDetails.loanCategory || 'HOME';
        }
        if (l.cardDetails) {
          flat['cardDetails.totalDue'] = l.cardDetails.totalDue || '';
          flat['cardDetails.minimumDue'] = l.cardDetails.minimumDue || '';
          flat['cardDetails.billingCycleDate'] = l.cardDetails.billingCycleDate?.slice(0, 10) || '';
          flat['cardDetails.lastFourDigits'] = l.cardDetails.lastFourDigits || '';
          flat['cardDetails.cardIssuer'] = l.cardDetails.cardIssuer || '';
        }
        flat.amountAsOf = l.amountAsOf?.slice(0, 10) || '';
        flat.nextDueDate = l.nextDueDate?.slice(0, 10) || '';
        setForm(flat);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await liabilityApi.update(id, form);
        toast('Liability updated', 'success');
        navigate(`/owner/liabilities/${id}`);
      } else {
        const res = await liabilityApi.create(form);
        toast('Liability created', 'success');
        navigate(`/owner/liabilities/${res.data.data.liability._id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading liability…" />;

  const isEmi = form.liabilityType === 'EMI';

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">{isEdit ? 'Edit Liability' : 'Add Liability'}</h1>
        <p className="mt-1 text-sm text-navy-500">
          {isEdit ? 'Update the details of your liability record.' : 'Record a new EMI or credit-card liability.'}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <div>
          <label className="label">Liability Type</label>
          <div className="flex gap-3">
            <label className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 ${isEmi ? 'border-teal-400 bg-teal-50' : 'border-navy-200'}`}>
              <input type="radio" name="liabilityType" value="EMI" checked={isEmi}
                onChange={() => set('liabilityType', 'EMI')} />
              <span className="text-sm font-medium text-navy-700">EMI / Loan</span>
            </label>
            <label className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 ${!isEmi ? 'border-teal-400 bg-teal-50' : 'border-navy-200'}`}>
              <input type="radio" name="liabilityType" value="CREDIT_CARD" checked={!isEmi}
                onChange={() => set('liabilityType', 'CREDIT_CARD')} />
              <span className="text-sm font-medium text-navy-700">Credit Card</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div>
            <label className="label">Provider Name {isEmi ? '*' : ''}</label>
            <input className="input" value={form.providerName} onChange={(e) => set('providerName', e.target.value)} required={isEmi} />
          </div>
          <div>
            <label className="label">Masked Reference</label>
            <input className="input" placeholder="XXXX-XXXX-1234" value={form.maskedReference} onChange={(e) => set('maskedReference', e.target.value)} />
          </div>
          <div>
            <label className="label">Outstanding Amount (INR) *</label>
            <input type="number" min="0" step="0.01" className="input" value={form.outstandingAmount}
              onChange={(e) => set('outstandingAmount', Number(e.target.value))} required />
          </div>
          <div>
            <label className="label">Amount As Of *</label>
            <input type="date" className="input" value={form.amountAsOf} onChange={(e) => set('amountAsOf', e.target.value)} required />
          </div>
          <div>
            <label className="label">Next Due Date</label>
            <input type="date" className="input" value={form.nextDueDate} onChange={(e) => set('nextDueDate', e.target.value)} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {isEmi ? (
          <div className="space-y-4 rounded-lg border border-navy-100 bg-navy-50/50 p-4">
            <h3 className="text-sm font-semibold text-navy-700">EMI Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">EMI Amount (INR) *</label>
                <input type="number" min="0" step="0.01" className="input" value={form['emiDetails.emiAmount']}
                  onChange={(e) => set('emiDetails.emiAmount', Number(e.target.value))} required />
              </div>
              <div>
                <label className="label">Frequency *</label>
                <select className="input" value={form['emiDetails.frequency']}
                  onChange={(e) => set('emiDetails.frequency', e.target.value)}>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Biweekly</option>
                  <option value="ANNUALLY">Annually</option>
                </select>
              </div>
              <div>
                <label className="label">Loan Category *</label>
                <select className="input" value={form['emiDetails.loanCategory']}
                  onChange={(e) => set('emiDetails.loanCategory', e.target.value)}>
                  <option value="HOME">Home</option>
                  <option value="VEHICLE">Vehicle</option>
                  <option value="EDUCATION">Education</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Remaining Installments</label>
                <input type="number" min="0" className="input" value={form['emiDetails.remainingInstallments']}
                  onChange={(e) => set('emiDetails.remainingInstallments', Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Interest Rate (%)</label>
                <input type="number" min="0" step="0.01" className="input" value={form['emiDetails.interestRate']}
                  onChange={(e) => set('emiDetails.interestRate', Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Maturity Date</label>
                <input type="date" className="input" value={form['emiDetails.maturityDate']}
                  onChange={(e) => set('emiDetails.maturityDate', e.target.value)} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-lg border border-navy-100 bg-navy-50/50 p-4">
            <h3 className="text-sm font-semibold text-navy-700">Credit Card Details</h3>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Never enter full card numbers, CVV, PIN, OTP, UPI PIN or banking passwords. Only the last four digits are required.
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Card Issuer *</label>
                <input className="input" value={form['cardDetails.cardIssuer']}
                  onChange={(e) => set('cardDetails.cardIssuer', e.target.value)} required />
              </div>
              <div>
                <label className="label">Last Four Digits *</label>
                <input className="input" maxLength={4} pattern="\d{4}" placeholder="1234"
                  value={form['cardDetails.lastFourDigits']}
                  onChange={(e) => set('cardDetails.lastFourDigits', e.target.value.replace(/\D/g, '').slice(0, 4))} required />
              </div>
              <div>
                <label className="label">Total Due (INR) *</label>
                <input type="number" min="0" step="0.01" className="input" value={form['cardDetails.totalDue']}
                  onChange={(e) => set('cardDetails.totalDue', Number(e.target.value))} required />
              </div>
              <div>
                <label className="label">Minimum Due (INR)</label>
                <input type="number" min="0" step="0.01" className="input" value={form['cardDetails.minimumDue']}
                  onChange={(e) => set('cardDetails.minimumDue', Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Billing Cycle Date</label>
                <input type="date" className="input" value={form['cardDetails.billingCycleDate']}
                  onChange={(e) => set('cardDetails.billingCycleDate', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea className="input" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.autoPayEnabled} onChange={(e) => set('autoPayEnabled', e.target.checked)} />
            <span className="text-sm text-navy-700">Auto-pay enabled</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Liability' : 'Create Liability'}
          </button>
        </div>
      </form>
    </div>
  );
}
