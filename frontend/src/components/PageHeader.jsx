import { motion } from 'framer-motion';

/**
 * Consistent page title block with optional right-aligned actions.
 */
const PageHeader = ({ title, subtitle, children }) => (
  <motion.div
    className="page-header"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div>
      <h1>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </div>
    {children && <div className="page-header-actions">{children}</div>}
  </motion.div>
);

export default PageHeader;
