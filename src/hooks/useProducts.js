import { useState, useEffect, useCallback } from 'react';
import { productService } from '../utils/api';

/**
 * Custom hook that manages all product state & CRUD operations.
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* ── helpers to enrich API products with local fields ────── */
  const enrich = (p) => ({
    ...p,
    quantity: p.quantity ?? Math.floor(Math.random() * 120),
    status: p.status ?? ['In Stock', 'In Stock', 'In Stock', 'Low Stock', 'Out of Stock'][
      Math.floor(Math.random() * 5)
    ],
    description: p.description ?? '',
  });

  /* ── initial fetch ──────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getAll();
        setProducts(data.map(enrich));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── add ────────────────────────────────────────────────── */
  const addProduct = useCallback(async (form) => {
    setActionLoading(true);
    try {
      const created = await productService.create({
        title: form.title,
        price: Number(form.price),
        description: form.description,
        image: form.image || 'https://fakestoreapi.com/img/placeholder.jpg',
        category: form.category,
      });
      const newProduct = {
        ...created,
        title: form.title,
        category: form.category,
        price: Number(form.price),
        quantity: Number(form.quantity),
        status: form.status,
        image: form.image || 'https://fakestoreapi.com/img/placeholder.jpg',
        description: form.description,
        id: created.id || Date.now(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  }, []);

  /* ── edit ───────────────────────────────────────────────── */
  const editProduct = useCallback(async (id, form) => {
    setActionLoading(true);
    try {
      await productService.update(id, {
        title: form.title,
        price: Number(form.price),
        description: form.description,
        image: form.image,
        category: form.category,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                title: form.title,
                category: form.category,
                price: Number(form.price),
                quantity: Number(form.quantity),
                status: form.status,
                image: form.image,
                description: form.description,
              }
            : p
        )
      );
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  }, []);

  /* ── delete ─────────────────────────────────────────────── */
  const deleteProduct = useCallback(async (id) => {
    setActionLoading(true);
    try {
      await productService.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    actionLoading,
    addProduct,
    editProduct,
    deleteProduct,
  };
}
