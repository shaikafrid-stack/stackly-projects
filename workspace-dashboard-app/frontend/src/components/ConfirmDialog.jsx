import Modal from './Modal.jsx';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message, loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait...' : 'Confirm'}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-500 shrink-0" size={22} />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </Modal>
  );
}
