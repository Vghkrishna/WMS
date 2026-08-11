import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ScrollText,
  Users,
  Warehouse,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: ArrowLeftRight },
  { to: '/logs', label: 'Activity Logs', icon: ScrollText },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, can } = useAuth();

  const nav = (
    <nav className="sidebar-nav">
      {links
        .filter((l) => !l.adminOnly || can.manageUsers)
        .map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="sidebar-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <l.icon size={19} />
                <span>{l.label}</span>
              </>
            )}
          </NavLink>
        ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar sidebar-desktop">
        <div className="sidebar-brand">
          <span className="sidebar-logo">
            <Warehouse size={22} />
          </span>
          <div>
            <strong>StockFlow</strong>
            <small>Inventory System</small>
          </div>
        </div>
        {nav}
        <div className="sidebar-foot">
          <div className="sidebar-user">
            <span className="avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <div className="sidebar-user-info">
              <strong>{user?.name}</strong>
              <span className={`badge badge-brand`}>{user?.role}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="sidebar sidebar-mobile"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <div className="sidebar-brand">
                <span className="sidebar-logo">
                  <Warehouse size={22} />
                </span>
                <div>
                  <strong>StockFlow</strong>
                  <small>Inventory System</small>
                </div>
                <button className="btn btn-icon btn-ghost" onClick={onClose} style={{ marginLeft: 'auto' }}>
                  <X size={18} />
                </button>
              </div>
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
