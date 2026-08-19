import { isOverdue } from '../utils/format.js';

const variants = {
  DRAFT: 'bg-navy-100 text-navy-700',
  ACTIVE: 'bg-teal-100 text-teal-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CLOSED: 'bg-navy-100 text-navy-600',
  ARCHIVED: 'bg-navy-100 text-navy-500',
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-teal-100 text-teal-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVOKED: 'bg-navy-100 text-navy-500',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-teal-100 text-teal-700',
  ACTIVE_PERM: 'bg-teal-100 text-teal-700',
  REVOKED_PERM: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status, label, type = 'status' }) {
  let cls = variants[status] || 'bg-navy-100 text-navy-700';
  if (type === 'permission') {
    cls = status === 'ACTIVE' ? variants.ACTIVE_PERM : variants.REVOKED_PERM;
  }
  const text = label || status?.replace(/_/g, ' ');

  if (status === 'ACTIVE' && type === 'liability' && !label) {
    // handled by caller via isOverdue check
  }

  return <span className={`badge ${cls}`}>{text}</span>;
}

export function LiabilityStatusBadge({ liability }) {
  if (isOverdue(liability) && liability.status === 'ACTIVE') {
    return <span className="badge bg-red-100 text-red-700">Overdue (due)</span>;
  }
  return <StatusBadge status={liability.status} type="liability" />;
}
