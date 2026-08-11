import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const Topbar = ({ onMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <header className="topbar">
      <button className="btn btn-icon btn-ghost topbar-menu" onClick={onMenu} aria-label="Menu">
        <Menu size={20} />
      </button>

      <div className="topbar-greeting">
        <span className="muted">{greeting},</span>{' '}
        <strong>{user?.name?.split(' ')[0]}</strong> 👋
      </div>

      <div className="topbar-user" ref={ref}>
        <button className="topbar-user-btn" onClick={() => setOpen((v) => !v)}>
          <span className="avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          <span className="topbar-user-name">{user?.name}</span>
          <ChevronDown size={16} className="muted" />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              className="topbar-menu-pop card"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <div className="topbar-menu-head">
                <strong>{user?.name}</strong>
                <small className="muted">{user?.email}</small>
                <span className="badge badge-brand" style={{ marginTop: 6 }}>
                  {user?.role}
                </span>
              </div>
              <button className="topbar-menu-item" onClick={handleLogout}>
                <LogOut size={16} /> Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Topbar;
