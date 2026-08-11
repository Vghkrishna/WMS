import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  PackagePlus,
  PackageMinus,
  Package,
  Boxes,
  Lock,
} from 'lucide-react';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import StockBadge from '../components/ui/StockBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatNumber, getErrorMessage } from '../lib/format.js';

const MovementForm = ({ type, products, onDone }) => {
  const isInbound = type === 'inbound';
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selected = products.find((p) => p._id === productId);

  const reset = () => {
    setProductId('');
    setQuantity('');
    setNotes('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) return toast.error('Please select a product');
    const qty = Number(quantity);
    if (!qty || qty <= 0) return toast.error('Enter a quantity greater than 0');
    if (!isInbound && selected && qty > selected.quantity) {
      return toast.error(`Only ${selected.quantity} unit(s) available`);
    }

    setSubmitting(true);
    try {
      await api.post(`/inventory/${type}`, { productId, quantity: qty, notes });
      toast.success(
        `${isInbound ? 'Added' : 'Removed'} ${qty} unit(s) ${
          isInbound ? 'to' : 'from'
        } ${selected?.name}`
      );
      reset();
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Operation failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      className={`card card-pad movement-card ${type}`}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: isInbound ? 0.1 : 0.18 }}
    >
      <div className="movement-head">
        <span className={`movement-icon ${type}`}>
          {isInbound ? <PackagePlus size={22} /> : <PackageMinus size={22} />}
        </span>
        <div>
          <h3>{isInbound ? 'Inbound Stock' : 'Outbound Stock'}</h3>
          <p className="muted">
            {isInbound ? 'Receive stock into the warehouse.' : 'Ship or remove stock.'}
          </p>
        </div>
      </div>

      <div className="field">
        <label>Product *</label>
        <select
          className="select"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        >
          <option value="">Select a product…</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.sku}) — {formatNumber(p.quantity)} in stock
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <motion.div
          className="movement-selected"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div>
            <span className="muted">Current stock</span>
            <strong className="mono">{formatNumber(selected.quantity)} units</strong>
          </div>
          <StockBadge quantity={selected.quantity} threshold={selected.lowStockThreshold} />
        </motion.div>
      )}

      <div className="field">
        <label>Quantity *</label>
        <input
          type="number"
          min="1"
          className="input"
          placeholder="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label>Notes (optional)</label>
        <textarea
          className="textarea"
          placeholder={isInbound ? 'e.g. PO #1234 from supplier' : 'e.g. Order #5678 fulfillment'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className={`btn btn-block ${isInbound ? 'btn-primary' : 'btn-danger'}`}
        disabled={submitting}
      >
        {submitting ? (
          <Spinner size={18} />
        ) : (
          <>
            {isInbound ? <PackagePlus size={18} /> : <PackageMinus size={18} />}
            {isInbound ? 'Add Stock' : 'Remove Stock'}
          </>
        )}
      </button>
    </motion.form>
  );
};

const Inventory = () => {
  const { can } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get('/products', { params: { limit: 500, sort: 'name', order: 'asc' } });
      setProducts(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);

  if (!can.moveStock) {
    return (
      <div>
        <PageHeader title="Inventory Operations" />
        <div className="card empty" style={{ padding: 60 }}>
          <Lock size={40} />
          <h3 style={{ marginBottom: 6 }}>Restricted access</h3>
          <p>Only admins and managers can perform stock movements.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Inventory Operations"
        subtitle="Record inbound and outbound stock movements."
      />

      <div className="inv-summary">
        <div className="inv-summary-item">
          <span className="stat-icon stat-icon-brand">
            <Package size={20} />
          </span>
          <div>
            <strong className="mono">{formatNumber(products.length)}</strong>
            <span className="muted">Products</span>
          </div>
        </div>
        <div className="inv-summary-item">
          <span className="stat-icon stat-icon-violet">
            <Boxes size={20} />
          </span>
          <div>
            <strong className="mono">{formatNumber(totalUnits)}</strong>
            <span className="muted">Total units in stock</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="movement-grid">
          <div className="skeleton" style={{ height: 420 }} />
          <div className="skeleton" style={{ height: 420 }} />
        </div>
      ) : (
        <div className="movement-grid">
          <MovementForm type="inbound" products={products} onDone={fetchProducts} />
          <MovementForm type="outbound" products={products} onDone={fetchProducts} />
        </div>
      )}
    </div>
  );
};

export default Inventory;
