import React, { useState } from 'react';

export default function RejectModal({ expense, onClose, onConfirm }) {
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  function handleConfirm() {
    if (!comments.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    onConfirm(comments);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-1">Reject Expense</h2>
        <p className="text-sm text-gray-500 mb-4">"{expense.title}" — ₹{Number(expense.amount).toLocaleString('en-IN')}</p>
        <label className="label">Reason for rejection</label>
        <textarea
          className="input-field"
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="e.g. Missing receipt, exceeds policy limit..."
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        <div className="flex gap-3 pt-4">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-danger flex-1" onClick={handleConfirm}>Reject Expense</button>
        </div>
      </div>
    </div>
  );
}
