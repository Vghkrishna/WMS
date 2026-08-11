import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UserPlus, Users as UsersIcon, Shield, Mail } from 'lucide-react';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Modal from '../components/ui/Modal.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { formatDate, getErrorMessage } from '../lib/format.js';

const roleBadge = {
  admin: 'badge-brand',
  manager: 'badge-info',
  staff: 'badge-neutral',
};

const emptyForm = { name: '', email: '', password: '', role: 'staff' };

const UserForm = ({ open, onClose, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await api.post('/auth/register', form);
      toast.success(`${form.role} account created`);
      onSaved();
      onClose();
    } catch (err) {
      const res = err?.response?.data;
      if (res?.errors) {
        const mapped = {};
        res.errors.forEach((x) => (mapped[x.field] = x.message));
        setErrors(mapped);
      }
      toast.error(getErrorMessage(err, 'Could not create user'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Team Member" width={480}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Full Name *</label>
          <input
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            required
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field">
          <label>Email *</label>
          <input
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@company.com"
            required
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="field">
          <label>Password *</label>
          <input
            type="password"
            className={`input ${errors.password ? 'input-error' : ''}`}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimum 6 characters"
            required
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>
        <div className="field">
          <label>Role *</label>
          <select
            className="select"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="staff">Staff — view only</option>
            <option value="manager">Manager — manage stock</option>
            <option value="admin">Admin — full access</option>
          </select>
        </div>
        <div className="flex gap-sm mt" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Spinner size={16} /> : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage team members and their access roles.">
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
          <UserPlus size={18} /> Add User
        </button>
      </PageHeader>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 56, marginBottom: 10 }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="empty">
            <UsersIcon size={40} />
            <h3>No users yet</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td>
                      <div className="cell-user">
                        <span className="avatar avatar-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td className="muted td-wrap" data-label="Email">
                      <span><Mail size={13} style={{ verticalAlign: -2 }} /> {u.email}</span>
                    </td>
                    <td data-label="Role">
                      <span className={`badge ${roleBadge[u.role]}`}>
                        <Shield size={12} /> {u.role}
                      </span>
                    </td>
                    <td className="muted" data-label="Joined">{formatDate(u.createdAt)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={fetchUsers} />
    </div>
  );
};

export default UsersPage;
