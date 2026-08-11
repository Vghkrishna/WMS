import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import Modal from '../components/ui/Modal.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { getErrorMessage } from '../lib/format.js';

const empty = {
  name: '',
  sku: '',
  category: '',
  quantity: 0,
  price: '',
  location: '',
  lowStockThreshold: 10,
};

/**
 * Create / edit product modal. `product` null → create mode.
 */
const ProductForm = ({ open, onClose, product, onSaved }) => {
  const isEdit = Boolean(product);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm(
        product
          ? {
              name: product.name,
              sku: product.sku,
              category: product.category,
              quantity: product.quantity,
              price: product.price,
              location: product.location || '',
              lowStockThreshold: product.lowStockThreshold,
            }
          : empty
      );
    }
  }, [open, product]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.category.trim()) e.category = 'Category is required';
    if (form.price === '' || Number(form.price) < 0) e.price = 'Enter a valid price';
    if (Number(form.quantity) < 0) e.quantity = 'Quantity cannot be negative';
    if (Number(form.lowStockThreshold) < 0) e.lowStockThreshold = 'Cannot be negative';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        sku: form.sku.trim().toUpperCase(),
        quantity: Number(form.quantity),
        price: Number(form.price),
        lowStockThreshold: Number(form.lowStockThreshold),
      };
      if (isEdit) {
        await api.put(`/products/${product._id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      onSaved();
      onClose();
    } catch (err) {
      const res = err?.response?.data;
      if (res?.errors) {
        const mapped = {};
        res.errors.forEach((x) => (mapped[x.field] = x.message));
        setErrors(mapped);
      }
      toast.error(getErrorMessage(err, 'Could not save product'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'} width={560}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Product Name *</label>
            <input
              className={`input ${errors.name ? 'input-error' : ''}`}
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. Wireless Mouse"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="field">
            <label>SKU *</label>
            <input
              className={`input mono ${errors.sku ? 'input-error' : ''}`}
              value={form.sku}
              onChange={(e) => setField('sku', e.target.value.toUpperCase())}
              placeholder="ELE-MOU-001"
              disabled={isEdit}
            />
            {errors.sku && <span className="field-error">{errors.sku}</span>}
          </div>

          <div className="field">
            <label>Category *</label>
            <input
              className={`input ${errors.category ? 'input-error' : ''}`}
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
              placeholder="Electronics"
              list="category-suggestions"
            />
            {errors.category && <span className="field-error">{errors.category}</span>}
          </div>

          <div className="field">
            <label>Price (USD) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`input ${errors.price ? 'input-error' : ''}`}
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              placeholder="0.00"
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>

          <div className="field">
            <label>{isEdit ? 'Quantity' : 'Opening Quantity'}</label>
            <input
              type="number"
              min="0"
              className={`input ${errors.quantity ? 'input-error' : ''}`}
              value={form.quantity}
              onChange={(e) => setField('quantity', e.target.value)}
            />
            {errors.quantity && <span className="field-error">{errors.quantity}</span>}
          </div>

          <div className="field">
            <label>Location</label>
            <input
              className="input"
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="A1-R2"
            />
          </div>

          <div className="field">
            <label>Low Stock Threshold</label>
            <input
              type="number"
              min="0"
              className={`input ${errors.lowStockThreshold ? 'input-error' : ''}`}
              value={form.lowStockThreshold}
              onChange={(e) => setField('lowStockThreshold', e.target.value)}
            />
            {errors.lowStockThreshold && (
              <span className="field-error">{errors.lowStockThreshold}</span>
            )}
          </div>
        </div>

        <div className="flex gap-sm mt" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Spinner size={16} /> : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductForm;
