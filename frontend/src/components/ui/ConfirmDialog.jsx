import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';

/**
 * Confirmation modal for destructive actions.
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  loading = false,
}) => (
  <Modal open={open} onClose={onClose} title={title} width={440}>
    <div className="flex gap" style={{ alignItems: 'flex-start' }}>
      <div
        style={{
          background: 'var(--danger-bg)',
          color: 'var(--danger)',
          borderRadius: 12,
          padding: 10,
          flexShrink: 0,
        }}
      >
        <AlertTriangle size={22} />
      </div>
      <p className="muted" style={{ marginTop: 4 }}>{message}</p>
    </div>
    <div className="flex gap-sm mt" style={{ justifyContent: 'flex-end' }}>
      <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
        Cancel
      </button>
      <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
        {loading ? <Spinner size={16} /> : confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
