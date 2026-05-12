import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

const PartNames = () => {
  const { user } = useAuth();
  const isAdminOrHod = user?.role?.includes('ADMIN') || user?.role?.includes('HOD');

  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', active: 'true' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, part: null });

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/part-names');
      setRecords(res.data);
    } catch (err) {
      console.warn("Could not fetch records", err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', active: 'true' });
    setShowForm(true);
  };

  const openEditForm = (part) => {
    setEditingId(part.id);
    setFormData({ 
      name: part.name, 
      description: part.description || '', 
      active: part.active ? 'true' : 'false' 
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Part Name is required");

    const payload = { 
      name: formData.name.trim(), 
      description: formData.description.trim() || null 
    };

    if (editingId) {
      payload.active = formData.active === 'true';
    }

    try {
      if (editingId) {
        await axios.put(`/api/part-names/${editingId}`, payload);
      } else {
        await axios.post('/api/part-names', payload);
      }
      setShowForm(false);
      fetchRecords();
    } catch (err) {
      console.error(err);
      alert('Failed to save record: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    const p = deleteModal.part;
    if (!p) return;
    try {
      await axios.delete(`/api/part-names/${p.id}`);
      fetchRecords();
      setDeleteModal({ isOpen: false, part: null });
      toast.success("Part name deleted");
    } catch (err) {
      toast.error("Failed to delete part name");
    }
  };

  const dash = (val) => val || '—';

  return (
    <>
      <style>{`
        .status-badge { display:inline-block; padding:.2rem .6rem; border-radius:999px; font-size:11px; font-weight:600; }
        .status-active   { background:#d1fae5; color:#065f46; }
        .status-inactive { background:#fee2e2; color:#991b1b; }
        .action-btn { background:none; border:none; cursor:pointer; padding:.3rem .5rem; border-radius:var(--radius-md); font-size:13px; font-weight:500; transition:background .15s; }
        .action-btn-edit   { color:#2563eb; } .action-btn-edit:hover   { background:#eff6ff; }
        .action-btn-delete { color:#dc2626; } .action-btn-delete:hover { background:#fef2f2; }
      `}</style>

      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">Part Names</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Part Names</h1>
          <p className="page-subtitle">Manage the list of part names available in quality forms</p>
        </div>
        {isAdminOrHod && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={openAddForm}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Part Name
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-panel" style={{ display: 'block' }}>
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">{editingId ? 'Edit Part Name' : 'Add Part Name'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-section">
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label required">Part Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="e.g. YTA KNUCKLE" required disabled={editingId !== null} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <input type="text" name="description" value={formData.description} onChange={handleChange} className="form-control" placeholder="Optional description" />
                    </div>
                    {editingId && (
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select name="active" value={formData.active} onChange={handleChange} className="form-control">
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer" style={{ margin: '0 -1.5rem -1.5rem', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Part Name List</h2>
          <span className="badge badge-secondary">{records.length} parts</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Part Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  {isAdminOrHod && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>No part names found. Click "Add Part Name" to get started.</td>
                  </tr>
                ) : records.map(p => (
                  <tr key={p.id}>
                    <td><strong>{dash(p.name)}</strong></td>
                    <td>{dash(p.description)}</td>
                    <td>
                      {p.active 
                        ? <span className="status-badge status-active">Active</span> 
                        : <span className="status-badge status-inactive">Inactive</span>}
                    </td>
                    <td>{p.createdAt?.split('T')[0]}</td>
                    {isAdminOrHod && (
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="action-btn action-btn-edit" onClick={() => openEditForm(p)}>Edit</button>
                        <button className="action-btn action-btn-delete" onClick={() => setDeleteModal({ isOpen: true, part: p })}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
       <ConfirmModal 
         isOpen={deleteModal.isOpen}
         onClose={() => setDeleteModal({ isOpen: false, part: null })}
         onConfirm={handleDelete}
         title="Delete Part?"
         message={`Are you sure you want to delete "${deleteModal.part?.name}"? This action cannot be undone.`}
         confirmText="Delete Part"
       />
    </>
  );
};

export default PartNames;
