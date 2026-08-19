import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { formatDateTime } from '../../utils/format.js';

export default function ActivationRequestDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decision, setDecision] = useState({ decision: '', decisionReason: '' });
  const [modal, setModal] = useState(null);
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.activationRequest(id);
      setRequest(res.data.data.request);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleUnderReview = async () => {
    try {
      await adminApi.updateRequestStatus(id, { status: 'UNDER_REVIEW' });
      toast('Marked as under review', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDecision = async () => {
    setActing(true);
    try {
      await adminApi.decide(id, decision);
      toast(`Request ${decision.decision.toLowerCase()}`, 'success');
      setModal(null);
      setDecision({ decision: '', decisionReason: '' });
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <Spinner label="Loading request…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!request) return <ErrorState message="Request not found" />;

  const isDecided = request.status === 'APPROVED' || request.status === 'REJECTED';

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link to="/admin/activation-requests" className="text-sm text-teal-600 hover:underline">← Back to queue</Link>
        <h1 className="mt-2 text-2xl font-bold text-navy-900">Activation Request</h1>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy-800">Request Details</h2>
        <div className="space-y-3">
          <Field label="Requester" value={request.requestedBy?.name} sub={request.requestedBy?.email} />
          <Field label="Assigned Owner" value={request.ownerId?.name} sub={request.ownerId?.email} />
          <Field label="Reason" value={request.reason} />
          <Field label="Status" value={request.status.replace(/_/g, ' ')} />
          <Field label="Requested At" value={formatDateTime(request.requestedAt)} />
          {request.reviewedAt && (
            <>
              <Field label="Reviewed By" value={request.reviewedBy?.name || '—'} />
              <Field label="Reviewed At" value={formatDateTime(request.reviewedAt)} />
              <Field label="Decision Reason" value={request.decisionReason} />
            </>
          )}
        </div>
      </div>

      {!isDecided && (
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-800">Review Actions</h2>
          {request.status === 'PENDING' && (
            <button className="btn-outline mb-4" onClick={handleUnderReview}>
              Mark as Under Review
            </button>
          )}
          <div className="space-y-4">
            <div>
              <label className="label">Decision</label>
              <div className="flex gap-3">
                <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-navy-200 p-3">
                  <input type="radio" name="decision" value="APPROVED" checked={decision.decision === 'APPROVED'}
                    onChange={() => setDecision({ ...decision, decision: 'APPROVED' })} />
                  <span className="text-sm font-medium text-navy-700">Approve</span>
                </label>
                <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-navy-200 p-3">
                  <input type="radio" name="decision" value="REJECTED" checked={decision.decision === 'REJECTED'}
                    onChange={() => setDecision({ ...decision, decision: 'REJECTED' })} />
                  <span className="text-sm font-medium text-navy-700">Reject</span>
                </label>
              </div>
            </div>
            <div>
              <label className="label">Decision Reason (required)</label>
              <textarea className="input" rows={3} value={decision.decisionReason}
                onChange={(e) => setDecision({ ...decision, decisionReason: e.target.value })}
                placeholder="Explain the decision…" />
            </div>
            <button
              className={decision.decision === 'REJECTED' ? 'btn-danger' : 'btn-primary'}
              disabled={!decision.decision || !decision.decisionReason || acting}
              onClick={() => setModal(true)}
            >
              Confirm {decision.decision === 'REJECTED' ? 'Rejection' : 'Approval'}
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={modal}
        title={`Confirm ${decision.decision === 'APPROVED' ? 'Approval' : 'Rejection'}`}
        message={
          decision.decision === 'APPROVED'
            ? 'Approving will unlock the vault for this beneficiary. They will only see explicitly permitted items.'
            : 'Rejecting will keep the vault locked. The beneficiary can submit a new request later.'
        }
        confirmLabel={decision.decision === 'APPROVED' ? 'Approve' : 'Reject'}
        danger={decision.decision === 'REJECTED'}
        onConfirm={handleDecision}
        onCancel={() => setModal(null)}
      />
    </div>
  );
}

function Field({ label, value, sub }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-navy-800">{value || '—'}</p>
      {sub && <p className="text-xs text-navy-400">{sub}</p>}
    </div>
  );
}
