import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  DollarSign,
  AlertTriangle,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { formatCurrency, formatNumber, formatDateTime, getErrorMessage } from '../lib/format.js';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const StatCard = ({ icon: Icon, label, value, tone, to, hint }) => (
  <motion.div variants={item} className={`stat-card stat-${tone}`}>
    <div className="stat-card-top">
      <span className="stat-icon">
        <Icon size={22} />
      </span>
      {to && (
        <Link to={to} className="stat-link" aria-label={`View ${label}`}>
          <ArrowUpRight size={18} />
        </Link>
      )}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {hint && <div className="stat-hint">{hint}</div>}
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        if (active) setStats(data.data);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to load dashboard'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Loading your warehouse overview…" />
        <div className="stat-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 140 }} />
          ))}
        </div>
        <div className="dash-grid" style={{ marginTop: 20 }}>
          <div className="skeleton" style={{ height: 340 }} />
          <div className="skeleton" style={{ height: 340 }} />
        </div>
      </div>
    );
  }

  const cards = [
    {
      icon: Package,
      label: 'Total Products',
      value: formatNumber(stats.totalProducts),
      tone: 'brand',
      to: '/products',
      hint: `${formatNumber(stats.totalUnits)} units in stock`,
    },
    {
      icon: DollarSign,
      label: 'Inventory Value',
      value: formatCurrency(stats.totalValue),
      tone: 'success',
      hint: 'Total stock valuation',
    },
    {
      icon: AlertTriangle,
      label: 'Low Stock Alerts',
      value: formatNumber(stats.lowStockCount),
      tone: stats.lowStockCount > 0 ? 'danger' : 'neutral',
      to: '/products?lowStock=true',
      hint: stats.lowStockCount > 0 ? 'Needs restocking' : 'All healthy',
    },
    {
      icon: Boxes,
      label: 'Categories',
      value: formatNumber(stats.byCategory.length),
      tone: 'violet',
      hint: 'Active product groups',
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your warehouse at a glance." />

      <motion.div
        className="stat-grid"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </motion.div>

      <div className="dash-grid">
        {/* Value by category */}
        <motion.div
          className="card card-pad"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: 18 }}>
            <h3>
              <TrendingUp size={18} style={{ verticalAlign: -3, marginRight: 6, color: 'var(--brand-500)' }} />
              Value by Category
            </h3>
          </div>
          {stats.byCategory.length === 0 ? (
            <div className="empty">No product data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.byCategory} margin={{ left: -18, right: 8 }}>
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12, fill: '#6b7192' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e8eaf0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7192' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                  formatter={(v) => [formatCurrency(v), 'Value']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e8eaf0',
                    boxShadow: '0 8px 24px rgba(20,22,48,0.12)',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={54}>
                  {stats.byCategory.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Units distribution */}
        <motion.div
          className="card card-pad"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <h3 style={{ marginBottom: 8 }}>Stock Distribution</h3>
          {stats.byCategory.length === 0 ? (
            <div className="empty">No product data yet.</div>
          ) : (
            <div className="donut-wrap">
              <div className="donut-chart">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.byCategory}
                    dataKey="units"
                    nameKey="category"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {stats.byCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [`${formatNumber(v)} units`, n]}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e8eaf0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              </div>
              <div className="donut-legend">
                {stats.byCategory.map((c, i) => (
                  <div key={c.category} className="legend-item">
                    <span
                      className="legend-dot"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="legend-name">{c.category}</span>
                    <span className="legend-val mono">{formatNumber(c.units)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div
        className="card card-pad"
        style={{ marginTop: 20 }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
      >
        <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
          <h3>Recent Activity</h3>
          <Link to="/logs" className="link-arrow">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {stats.recentLogs.length === 0 ? (
          <div className="empty">No inventory movements recorded yet.</div>
        ) : (
          <div className="activity-list">
            {stats.recentLogs.map((log, i) => (
              <motion.div
                key={log._id}
                className="activity-row"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
              >
                <span className={`activity-icon ${log.action}`}>
                  {log.action === 'outbound' ? (
                    <ArrowDownRight size={16} />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                </span>
                <div className="activity-main">
                  <strong>{log.productId?.name || 'Deleted product'}</strong>
                  <small className="muted">
                    {log.action === 'outbound' ? 'Removed' : 'Added'}{' '}
                    <b>{formatNumber(log.quantity)}</b> units · by {log.userId?.name || 'Unknown'}
                  </small>
                </div>
                <span className="activity-time muted">{formatDateTime(log.createdAt)}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
