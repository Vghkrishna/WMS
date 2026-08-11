import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Warehouse, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../lib/format.js';
import Spinner from '../components/ui/Spinner.jsx';

const demoAccounts = [
  { role: 'Admin', email: 'admin@wms.com', password: 'admin123' },
  { role: 'Manager', email: 'manager@wms.com', password: 'manager123' },
  { role: 'Staff', email: 'staff@wms.com', password: 'staff123' },
];

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const profile = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${profile.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => setForm({ email: acc.email, password: acc.password });

  return (
    <div className="login-screen">
      {/* Left brand panel — full-bleed warehouse video with overlaid text */}
      <motion.div
        className="login-brand"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <video
          className="login-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/warehouse.mp4" type="video/mp4" />
        </video>
        <div className="login-scrim" />

        <div className="login-brand-inner">
          <div className="login-top">
            <div className="login-logo">
              <Warehouse size={24} />
              <span>StockFlow</span>
            </div>
            <span className="login-live">
              <span className="login-live-dot" /> Live warehouse
            </span>
          </div>

          <div className="login-bottom">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55 }}
            >
              Warehouse Inventory,
              <br /> under control.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.55 }}
            >
              Track stock in real time, manage inbound &amp; outbound movements,
              and get instant low-stock alerts — all with role-based access.
            </motion.p>
            <motion.div
              className="login-tags"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.5 }}
            >
              <span>Real-time stock</span>
              <span>Role-based access</span>
              <span>Full audit trail</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Right form panel */}
      <div className="login-form-wrap">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2>Sign in</h2>
          <p className="muted">Enter your credentials to access the dashboard.</p>

          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div className="input-icon">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-icon">
                <Lock size={18} />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-eye"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <Spinner size={18} />
              ) : (
                <>
                  Sign in <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-demo">
            <span className="muted">Quick demo login</span>
            <div className="login-demo-grid">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  className="login-demo-btn"
                  onClick={() => fillDemo(acc)}
                >
                  <strong>{acc.role}</strong>
                  <small>{acc.email}</small>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
