import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import { PartNameSelect } from '../components/PartNameSelect';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [formData, setFormData] = useState({
    fullName: '', username: '', employeeId: '', password: '', email: '', role: '', active: 'true',
    permissions: []
  });

  // Record Search State
  const [recSearch, setRecSearch] = useState({ partName: '', dateCode: '', heatCode: '' });
  const [recResults, setRecResults] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [editRecord, setEditRecord] = useState(null); // { type, data }
  const [editRecordForm, setEditRecordForm] = useState({});
  const [editRecordLoading, setEditRecordLoading] = useState(false);

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/users');
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
    setFormData({ fullName: '', username: '', employeeId: '', password: '', email: '', role: '', active: 'true', permissions: [] });
    setShowForm(true);
  };

  const openEditForm = (user) => {
    let normalizedRole = user.role || '';
    if (normalizedRole && !normalizedRole.startsWith('ROLE_')) {
      normalizedRole = 'ROLE_' + normalizedRole.toUpperCase();
    }

    setEditingId(user.id);
    setFormData({
      fullName: user.fullName,
      username: user.username,
      employeeId: user.employeeId || '',
      password: '',
      email: user.email || '',
      role: normalizedRole,
      active: user.active ? 'true' : 'false',
      permissions: user.formPermissions ? user.formPermissions.split(',') : []
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim() || !formData.employeeId.trim() || !formData.role) {
      return toast.error("Full Name, Username, Employee ID, and Role are required");
    }
    if (!editingId && !formData.password) {
      return toast.error("Password is required when creating a user.");
    }

    const payload = {
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
      employeeId: formData.employeeId.trim(),
      email: formData.email.trim() || null,
      role: formData.role,
      formPermissions: formData.permissions.join(',')
    };

    if (formData.password) {
      payload.password = formData.password;
    }
    if (editingId) {
      payload.active = formData.active === 'true';
    }

    try {
      if (editingId) {
        await axios.put(`/api/users/${editingId}`, payload);
      } else {
        await axios.post('/api/users', payload);
      }
      setShowForm(false);
      fetchRecords();
      toast.success(editingId ? 'User updated successfully' : 'User created successfully');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data || err.message;
      toast.error('Failed to save user: ' + msg);
    }
  };

  const handlePermissionChange = (perm) => {
    setFormData(prev => {
      const newPerms = prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: newPerms };
    });
  };

  const handleDelete = async () => {
    const u = deleteModal.user;
    if (!u) return;
    try {
      await axios.delete(`/api/users/${u.id}`);
      fetchRecords();
      setDeleteModal({ isOpen: false, user: null });
      toast.success("User deleted");
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const roleBadge = (role) => {
    if (!role) return <span className="role-badge role-viewer">—</span>;
    const r = role.toUpperCase();
    const cls = r.includes('ADMIN') ? 'role-admin'
              : r.includes('HOD') ? 'role-admin'
              : r.includes('HOF') ? 'role-supervisor'
              : r.includes('QC') ? 'role-qc'
              : 'role-viewer';
    return <span className={`role-badge ${cls}`}>{role.replace('ROLE_', '')}</span>;
  };

  const dash = (val) => val || '—';

  const handleRecordSearch = async (e) => {
    e.preventDefault();
    setRecLoading(true);
    try {
      const res = await axios.get('/api/reports/search', { params: recSearch });
      setRecResults(res.data);
    } catch {
      toast.error('Failed to search records');
    } finally {
      setRecLoading(false);
    }
  };

  const openRecordEdit = (type, data) => {
    setEditRecord({ type, data });
    setEditRecordForm({ ...data });
  };

  const handleRecordEditSave = async () => {
    if (!editRecord) return;
    setEditRecordLoading(true);
    const { type, data } = editRecord;
    const endpointMap = {
      qcRegister: `/api/qc-register/${data.id}`,
      microStructure: `/api/micro-structure/${data.id}`,
      microTensile: `/api/micro-tensile/${data.id}`,
      impactTest: `/api/impact-test/${data.id}`,
    };
    try {
      await axios.put(endpointMap[type], editRecordForm);
      toast.success('Record updated successfully!');
      setEditRecord(null);
      // refresh search results
      const res = await axios.get('/api/reports/search', { params: recSearch });
      setRecResults(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update record');
    } finally {
      setEditRecordLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .role-badge { display: inline-block; padding: .2rem .6rem; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: .03em; }
        .role-admin      { background:#fef3c7; color:#92400e; }
        .role-supervisor { background:#dbeafe; color:#1e40af; }
        .role-qc         { background:#d1fae5; color:#065f46; }
        .role-viewer     { background:#f3f4f6; color:#374151; }
        .status-badge { display: inline-block; padding: .2rem .6rem; border-radius: 999px; font-size: 11px; font-weight: 600; }
        .status-active   { background:#d1fae5; color:#065f46; }
        .status-inactive { background:#fee2e2; color:#991b1b; }
        .action-btn { background: none; border: none; cursor: pointer; padding: .3rem .5rem; border-radius: var(--radius-md); font-size: 13px; font-weight: 500; transition: background .15s; }
        .action-btn-edit   { color: #2563eb; } .action-btn-edit:hover { background: #eff6ff; }
        .action-btn-delete { color: #dc2626; } .action-btn-delete:hover { background: #fef2f2; }
        .rec-search-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,0.06); padding:22px 28px; margin-bottom:28px; }
        .rec-search-row { display:flex; gap:14px; flex-wrap:wrap; align-items:flex-end; }
        .rec-search-field { display:flex; flex-direction:column; min-width:160px; flex:1; }
        .rec-field-label { font-weight:700; color:#475569; font-size:0.68rem; text-transform:uppercase; letter-spacing:0.07em; margin-bottom:6px; }
        .rec-input { height:40px; border-radius:8px; border:1.5px solid #cbd5e1; font-size:0.85rem; padding:0 12px; width:100%; outline:none; transition:border-color 0.2s; }
        .rec-input:focus { border-color:#f97316; box-shadow:0 0 0 3px rgba(249,115,22,0.12); }
        .rec-type-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:12px; }
        .rec-qc { background:#dbeafe; color:#1e3a5f; }
        .rec-micro { background:#ccfbf1; color:#134e4a; }
        .rec-tensile { background:#fef3c7; color:#78350f; }
        .rec-impact { background:#ede9fe; color:#4c1d95; }
        .rec-edit-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999; padding:1rem; }
        .rec-edit-modal { background:#fff; border-radius:16px; padding:28px; max-width:600px; width:100%; max-height:90vh; overflow:auto; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
        .rec-edit-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem; }
      `}</style>

      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">User Management</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Create and manage system users and their roles</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAddForm}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {/* Record Search Panel */}
      <div className="rec-search-card">
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e293b', fontSize: '1.1rem' }}>Global Record Search & Edit</h3>
        <form onSubmit={handleRecordSearch} className="rec-search-row">
          <div className="rec-search-field">
            <label className="rec-field-label">Part Name</label>
            <PartNameSelect value={recSearch.partName} onChange={(e) => setRecSearch({...recSearch, partName: e.target.value})} />
          </div>
          <div className="rec-search-field">
            <label className="rec-field-label">Date Code</label>
            <input type="text" className="rec-input" placeholder="e.g. 5D03-45" value={recSearch.dateCode} onChange={e => setRecSearch({...recSearch, dateCode: e.target.value})} />
          </div>
          <div className="rec-search-field">
            <label className="rec-field-label">Heat Code</label>
            <input type="text" className="rec-input" placeholder="e.g. H123" value={recSearch.heatCode} onChange={e => setRecSearch({...recSearch, heatCode: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '40px', padding: '0 24px' }} disabled={recLoading}>
            {recLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {recResults && (
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.9rem' }}>Search Results ({recResults.length} records found)</h4>
            {recResults.length === 0 ? (
              <p style={{ color: '#64748b' }}>No records match the given criteria.</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Date</th>
                      <th>Part / Code</th>
                      <th>Created By</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recResults.map((r, i) => (
                      <tr key={i}>
                        <td>
                          {r.type === 'qcRegister' && <span className="rec-type-badge rec-qc">QC REGISTER</span>}
                          {r.type === 'microStructure' && <span className="rec-type-badge rec-micro">MICRO STRUCT</span>}
                          {r.type === 'microTensile' && <span className="rec-type-badge rec-tensile">TENSILE TEST</span>}
                          {r.type === 'impactTest' && <span className="rec-type-badge rec-impact">IMPACT TEST</span>}
                        </td>
                        <td>{r.date}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.partName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.dateCode || '-'} / {r.heatCode || '-'}</div>
                        </td>
                        <td>{r.createdBy}</td>
                        <td><span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                        <td>
                          <button type="button" className="action-btn action-btn-edit" onClick={() => openRecordEdit(r.type, r.data)}>Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-panel" style={{ display: 'block' }}>
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">{editingId ? 'Edit User' : 'Add User'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-section">
                  <div className="form-section-title">Account Details</div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label required">Full Name</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-control" placeholder="e.g. Rajesh Kumar" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">Username</label>
                      <input type="text" name="username" value={formData.username} onChange={handleChange} className="form-control" placeholder="e.g. rajesh.kumar" required disabled={editingId !== null} />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">Employee ID</label>
                      <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} className="form-control" placeholder="e.g. EMP001" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password {editingId && <span style={{color:'var(--color-text-secondary)', fontWeight:400}}>(leave blank to keep current)</span>}</label>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" placeholder="Enter password" />
                    </div>
                  </div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="e.g. rajesh@sacl.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">Role</label>
                      <select name="role" value={formData.role} onChange={handleChange} className="form-control" required>
                        <option value="">Select Role</option>
                        <option value="ROLE_ADMIN">Admin (HOD)</option>
                        <option value="ROLE_HOF">Head of Factory (HOF)</option>
                        <option value="ROLE_QC">Employee (QC Engineer)</option>
                      </select>
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

                {formData.role !== 'ROLE_ADMIN' && (
                  <div className="form-section">
                    <div className="form-section-title">Form Access Permissions</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1px))', gap: '1rem', marginTop: '1rem' }}>
                      {[
                        { id: 'QC_REGISTER', label: 'QC Register' },
                        { id: 'MICRO_STRUCTURE', label: 'Micro Structure' },
                        { id: 'TENSILE_TEST', label: 'Tensile Test' },
                        { id: 'IMPACT_TEST', label: 'Impact Test' }
                      ].map(p => (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: formData.permissions.includes(p.id) ? 'var(--color-primary-light)' : 'none' }}>
                          <input 
                            type="checkbox" 
                            checked={formData.permissions.includes(p.id)} 
                            onChange={() => handlePermissionChange(p.id)}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                          />
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>{p.label}</span>
                        </label>
                      ))}
                    </div>
                    <p style={{ marginTop: '0.75rem', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Note: Admin users automatically have access to all forms regardless of these settings.</p>
                  </div>
                )}

                <div className="card-footer" style={{ margin: '0 -1.5rem -1.5rem', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Save User
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
          <h2 className="card-title">System Users</h2>
          <span className="badge badge-secondary">{records.length} users</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Employee ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted" style={{ padding: '2rem' }}>No users found. Click "Add User" to get started.</td>
                  </tr>
                ) : records.map(u => (
                  <tr key={u.id}>
                    <td><strong>{dash(u.fullName)}</strong></td>
                    <td><strong style={{color:'#2563eb'}}>{dash(u.employeeId)}</strong></td>
                    <td>{dash(u.username)}</td>
                    <td>{dash(u.email)}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td>
                      {u.active 
                        ? <span className="status-badge status-active">Active</span>
                        : <span className="status-badge status-inactive">Inactive</span>}
                    </td>
                    <td>{u.createdAt?.split('T')[0]}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="action-btn action-btn-edit" onClick={() => openEditForm(u)}>Edit</button>
                      {u.id !== currentUser?.id && (
                        <button className="action-btn action-btn-delete" onClick={() => setDeleteModal({ isOpen: true, user: u })}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {editRecord && (
        <div className="rec-edit-overlay" onClick={() => setEditRecord(null)}>
          <div className="rec-edit-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Edit {editRecord.type} Record</h2>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Important:</strong> You are modifying a record globally. Please ensure all values are correct.
            </div>
            
            <div className="rec-edit-grid">
              <div className="form-group">
                <label className="form-label">Part Name</label>
                <PartNameSelect value={editRecordForm.partName || ''} onChange={(e) => setEditRecordForm({...editRecordForm, partName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Date Code</label>
                <input type="text" className="form-control" value={editRecordForm.dateCode || ''} onChange={e => setEditRecordForm({...editRecordForm, dateCode: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Heat Code / No</label>
                <input type="text" className="form-control" value={editRecordForm.heatCode || editRecordForm.fcNoHeatNo || ''} onChange={e => {
                  if (editRecord.type === 'qcRegister') {
                    setEditRecordForm({...editRecordForm, fcNoHeatNo: e.target.value});
                  } else {
                    setEditRecordForm({...editRecordForm, heatCode: e.target.value});
                  }
                }} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={editRecordForm.status || ''} onChange={e => setEditRecordForm({...editRecordForm, status: e.target.value})}>
                  <option value="QC_ENTRY">QC_ENTRY</option>
                  <option value="HOF_APPROVED">HOF_APPROVED</option>
                  <option value="HOD_APPROVED">HOD_APPROVED</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRecordEditSave} disabled={editRecordLoading}>
                {editRecordLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

       <ConfirmModal 
         isOpen={deleteModal.isOpen}
         onClose={() => setDeleteModal({ isOpen: false, user: null })}
         onConfirm={handleDelete}
         title="Delete User?"
         message={`Are you sure you want to delete user "${deleteModal.user?.fullName}"? This action cannot be undone.`}
         confirmText="Delete User"
       />
    </>
  );
};

export default UserManagement;
