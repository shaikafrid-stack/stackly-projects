import { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import Toolbar from './components/Toolbar';
import ProductTable from './components/ProductTable';
import ProductForm from './components/ProductForm';
import ViewModal from './components/ViewModal';
import DeleteConfirm from './components/DeleteConfirm';
import Modal from './components/Modal';
import Spinner from './components/Spinner';
import Toast from './components/Toast';
import { useProducts } from './hooks/useProducts';
import { useToast } from './hooks/useToast';

export default function App() {
  const { products, loading, error, actionLoading, addProduct, editProduct, deleteProduct } =
    useProducts();
  const { toast, notify, dismiss } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // modal state: null | { type: 'add'|'edit'|'view'|'delete', product? }
  const [modal, setModal] = useState(null);

  const closeModal = () => setModal(null);

  /* ── filtered list ───────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q);
      const matchCat =
        categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  /* ── handlers ────────────────────────────────────────────── */
  async function handleAdd(form) {
    const result = await addProduct(form);
    if (result.success) {
      closeModal();
      notify('Product added successfully!');
    } else {
      notify(result.message || 'Failed to add product.', 'error');
    }
  }

  async function handleEdit(form) {
    const result = await editProduct(modal.product.id, form);
    if (result.success) {
      closeModal();
      notify('Product updated successfully!');
    } else {
      notify(result.message || 'Failed to update product.', 'error');
    }
  }

  async function handleDelete() {
    const result = await deleteProduct(modal.product.id);
    if (result.success) {
      closeModal();
      notify('Product deleted.');
    } else {
      notify(result.message || 'Failed to delete product.', 'error');
    }
  }

  /* ── render ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-navy-950 flex" style={{ backgroundColor: '#0a0e18' }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onAddProduct={() => setModal({ type: 'add' })}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {loading ? (
            <Spinner label="Loading products from FakeStore API…" />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-2xl">⚠</div>
              <p className="text-rose-400 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-indigo-400 hover:underline"
              >
                ↺ Retry
              </button>
            </div>
          ) : (
            <>
              <StatsBar products={products} />

              <Toolbar
                search={search}
                onSearch={setSearch}
                category={categoryFilter}
                onCategory={setCategoryFilter}
              />

              <ProductTable
                products={filtered}
                onView={(p) => setModal({ type: 'view', product: p })}
                onEdit={(p) => setModal({ type: 'edit', product: p })}
                onDelete={(p) => setModal({ type: 'delete', product: p })}
              />

              <p className="text-xs text-slate-600 mt-3 text-right">
                Showing {filtered.length} of {products.length} products
              </p>
            </>
          )}
        </main>
      </div>

      {/* ── Modals ── */}
      {modal?.type === 'add' && (
        <Modal title="Add New Product" onClose={closeModal}>
          <ProductForm onSubmit={handleAdd} onClose={closeModal} loading={actionLoading} />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title="Edit Product" onClose={closeModal}>
          <ProductForm
            initial={{
              title: modal.product.title,
              category: modal.product.category,
              price: String(modal.product.price),
              quantity: String(modal.product.quantity ?? 0),
              status: modal.product.status || 'In Stock',
              image: modal.product.image || '',
              description: modal.product.description || '',
            }}
            onSubmit={handleEdit}
            onClose={closeModal}
            loading={actionLoading}
          />
        </Modal>
      )}

      {modal?.type === 'view' && (
        <ViewModal product={modal.product} onClose={closeModal} />
      )}

      {modal?.type === 'delete' && (
        <DeleteConfirm
          product={modal.product}
          onConfirm={handleDelete}
          onClose={closeModal}
          loading={actionLoading}
        />
      )}

      {/* Toast */}
      <Toast toast={toast} onDismiss={dismiss} />
    </div>
  );
}
