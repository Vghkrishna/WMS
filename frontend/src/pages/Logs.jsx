import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  ScrollText,
  RotateCcw,
} from 'lucide-react';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import { formatNumber, formatDateTime, getErrorMessage } from '../lib/format.js';

const actionMeta = {
  inbound: { label: 'Inbound', className: 'inbound', icon: ArrowDownToLine, sign: '+' },
  outbound: { label: 'Outbound', className: 'outbound', icon: ArrowUpFromLine, sign: '−' },
  adjustment: { label: 'Adjustment', className: 'adjustment', icon: SlidersHorizontal, sign: '±' },
};

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    productId: '',
    action: 'all',
    startDate: '',
    endDate: '',
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.productId) params.productId = filters.productId;
      if (filters.action !== 'all') params.action = filters.action;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const { data } = await api.get('/inventory/logs', { params });
      setLogs(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load logs'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    api
      .get('/products', { params: { limit: 500, sort: 'name', order: 'asc' } })
      .then(({ data }) => setProducts(data.data))
      .catch(() => {});
  }, []);

  const resetFilters = () =>
    setFilters({ productId: '', action: 'all', startDate: '', endDate: '' });

  const hasFilters =
    filters.productId || filters.action !== 'all' || filters.startDate || filters.endDate;

  return (
    <div>
      <PageHeader title="Activity Logs" subtitle="Full audit trail of stock movements." />

      <div className="toolbar card logs-toolbar">
        <div className="select-wrap">
          <select
            className="select"
            value={filters.productId}
            onChange={(e) => setFilters((f) => ({ ...f, productId: e.target.value }))}
          >
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="select-wrap">
          <select
            className="select"
            value={filters.action}
            onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
          >
            <option value="all">All actions</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
        <input
          type="date"
          className="input logs-date"
          value={filters.startDate}
          onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
          aria-label="Start date"
        />
        <input
          type="date"
          className="input logs-date"
          value={filters.endDate}
          onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
          aria-label="End date"
        />
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
            <RotateCcw size={15} /> Reset
          </button>
        )}
      </div>

      <div className="card" style={{ marginTop: 18, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 48, marginBottom: 10 }} />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="empty">
            <ScrollText size={40} />
            <h3 style={{ marginBottom: 6 }}>No movements found</h3>
            <p>{hasFilters ? 'Try adjusting your filters.' : 'Stock movements will appear here.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Change</th>
                  <th style={{ textAlign: 'right' }}>Resulting</th>
                  <th>User</th>
                  <th>Notes</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => {
                  const meta = actionMeta[log.action] || actionMeta.adjustment;
                  const Icon = meta.icon;
                  return (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    >
                      <td>
                        <span className={`badge log-badge ${meta.className}`}>
                          <Icon size={13} /> {meta.label}
                        </span>
                      </td>
                      <td data-label="Product">
                        <div>
                          <strong>{log.productId?.name || 'Deleted product'}</strong>
                          {log.productId?.sku && (
                            <div className="mono soft" style={{ fontSize: '0.78rem' }}>
                              {log.productId.sku}
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        style={{ textAlign: 'right' }}
                        className={`mono ${log.action === 'outbound' ? 'text-danger' : 'text-success'}`}
                        data-label="Change"
                      >
                        <strong>
                          {meta.sign}
                          {formatNumber(log.quantity)}
                        </strong>
                      </td>
                      <td style={{ textAlign: 'right' }} className="mono muted" data-label="Resulting">
                        {log.resultingQuantity != null ? formatNumber(log.resultingQuantity) : '—'}
                      </td>
                      <td data-label="User">
                        <div className="cell-user">
                          <span className="avatar avatar-sm">
                            {log.userId?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                          <span>{log.userId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="muted td-wrap" data-label="Notes" style={{ maxWidth: 260 }}>
                        {log.notes || <span className="soft">—</span>}
                      </td>
                      <td className="muted" data-label="Date" style={{ whiteSpace: 'nowrap' }}>
                        {formatDateTime(log.createdAt)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && logs.length > 0 && (
        <p className="muted" style={{ marginTop: 12, fontSize: '0.85rem' }}>
          {logs.length} movement{logs.length !== 1 ? 's' : ''} recorded
        </p>
      )}
    </div>
  );
};

export default Logs;
