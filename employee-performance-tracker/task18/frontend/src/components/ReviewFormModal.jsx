import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/**
 * Modal used by managers to add manager_comments + rating,
 * or by employees to add a self-review comment.
 */
export default function ReviewFormModal({ goal, onClose, onSaved }) {
  const { user } = useAuth();
  const isManager = user.role === 'manager' || user.role === 'admin';
  const [comments, setComments] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comments.trim().length < 5) {
      setError('Comments must be at least 5 characters');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { goal_id: goal.id };
      if (isManager) {
        payload.manager_comments = comments;
        payload.rating = Number(rating);
      } else {
        payload.employee_comments = comments;
      }
      await api.post('/reviews', payload);
      toast.success('Review submitted');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg">
        <h2 className="text-lg font-bold mb-1">
          {isManager ? 'Manager Review' : 'Self Review'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{goal.title}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Comments</label>
            <textarea
              className="input"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={isManager ? 'Feedback on performance...' : 'Reflect on your progress...'}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {isManager && (
            <div>
              <label className="label">Rating (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                className="input"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
