import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Warehouse, ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="notfound">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <span className="notfound-logo">
        <Warehouse size={30} />
      </span>
      <h1>404</h1>
      <p className="muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
