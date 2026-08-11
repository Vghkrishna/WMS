import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Visual indicator of a product's stock health relative to its threshold.
 */
const StockBadge = ({ quantity, threshold }) => {
  if (quantity <= 0) {
    return (
      <span className="badge badge-danger">
        <XCircle size={13} /> Out of stock
      </span>
    );
  }
  if (quantity <= threshold) {
    return (
      <span className="badge badge-warning">
        <AlertTriangle size={13} /> Low stock
      </span>
    );
  }
  return (
    <span className="badge badge-success">
      <CheckCircle2 size={13} /> In stock
    </span>
  );
};

export default StockBadge;
