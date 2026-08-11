import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  MapPin,
  Filter,
} from 'lucide-react';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import StockBadge from '../components/ui/StockBadge.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import ProductForm from './ProductForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatNumber, getErrorMessage } from '../lib/format.js';

const useDebounce = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const Products = () => {
  const { can } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [lowStock, setLowStock] = useState(searchParams.get('lowStock') === 'true');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (category !== 'all') params.category = category;
      if (lowStock) params.lowStock = 'true';
      const { data } = await api.get('/products', { params });
      setProducts(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, lowStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api
      .get('/products/meta/categories')
      .then(({ data }) => setCategories(data.data))
      .catch(() => {});
  }, [formOpen]);

  useEffect(() => {
    // keep the URL in sync for the lowStock deep link
    const next = new URLSearchParams(searchParams);
    if (lowStock) next.set('lowStock', 'true');
    else next.delete('lowStock');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lowStock]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Delete failed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage your catalog and stock levels.">
        {can.manageProducts && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={18} /> Add Product
          </button>
        )}
      </PageHeader>

      {/* Toolbar */}
      <div className="toolbar card">
        <div className="input-icon toolbar-search">
          <Search size={18} />
          <input
            className="input"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-filters">
          <div className="select-wrap">
            <Filter size={15} className="muted" />
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            className={`btn ${lowStock ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setLowStock((v) => !v)}
          >
            Low stock only
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ marginTop: 18, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, marginBottom: 10 }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty">
            <Package size={40} />
            <h3 style={{ marginBottom: 6 }}>No products found</h3>
            <p>Try adjusting your filters{can.manageProducts ? ' or add a new product.' : '.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th>Status</th>
                  {can.manageProducts && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {products.map((p) => {
                    const low = p.quantity <= p.lowStockThreshold;
                    return (
                      <motion.tr
                        key={p._id}
                        className={low ? 'row-lowstock' : ''}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                      >
                        <td>
                          <div className="cell-product">
                            <span className="cell-product-icon">
                              <Package size={16} />
                            </span>
                            <strong>{p.name}</strong>
                          </div>
                        </td>
                        <td className="mono muted" data-label="SKU">{p.sku}</td>
                        <td data-label="Category">
                          <span className="badge badge-neutral">{p.category}</span>
                        </td>
                        <td className="muted" data-label="Location">
                          <MapPin size={13} style={{ verticalAlign: -2 }} /> {p.location || '—'}
                        </td>
                        <td
                          style={{ textAlign: 'right' }}
                          className={`mono ${low ? 'text-danger' : ''}`}
                          data-label="Qty"
                        >
                          <strong>{formatNumber(p.quantity)}</strong>
                        </td>
                        <td style={{ textAlign: 'right' }} className="mono" data-label="Price">
                          {formatCurrency(p.price)}
                        </td>
                        <td data-label="Status">
                          <StockBadge quantity={p.quantity} threshold={p.lowStockThreshold} />
                        </td>
                        {can.manageProducts && (
                          <td className="td-actions" data-label="Actions">
                            <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-icon btn-ghost"
                                onClick={() => openEdit(p)}
                                aria-label="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              {can.deleteProducts && (
                                <button
                                  className="btn btn-icon btn-ghost icon-danger"
                                  onClick={() => setDeleteTarget(p)}
                                  aria-label="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && products.length > 0 && (
        <p className="muted" style={{ marginTop: 12, fontSize: '0.85rem' }}>
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      )}

      <datalist id="category-suggestions">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editing}
        onSaved={fetchProducts}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete product?"
        confirmLabel="Delete"
        message={`This will permanently remove "${deleteTarget?.name}" and its movement history. This cannot be undone.`}
      />
    </div>
  );
};

export default Products;
