import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({ open, title = 'Are you sure?', message, onConfirm, onCancel, loading }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Confirm
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
