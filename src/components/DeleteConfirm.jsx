import Modal from './Modal';

export default function DeleteConfirm({ product, onConfirm, onClose, loading }) {
  return (
    <Modal title="Delete Product" onClose={onClose} size="sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-400 text-xl shrink-0">
          ⚠
        </div>
        <div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">"{product.title}"</span>?
          </p>
          <p className="text-slate-500 text-xs mt-1">This action cannot be undone.</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-5 py-2 rounded-lg text-sm font-semibold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          )}
          {loading ? 'Deleting…' : 'Delete Product'}
        </button>
      </div>
    </Modal>
  );
}
