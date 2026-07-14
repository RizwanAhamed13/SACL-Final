import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { PartNameSelect } from '../components/PartNameSelect';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';

const ProblemLog = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    employeeNo: '',
    problem: '',
    partName: '',
    heatCode: '',
    qty: '',
    status: 'Pending',
    reason: ''
  });

  const fetchRecords = async (query = '') => {
    try {
      setLoading(true);
      const res = await axios.get('/api/problem-log/search', { params: { query } });
      setRecords(res.data);
    } catch (err) {
      console.warn("Could not fetch problem logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRecords(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeNo || !formData.problem || !formData.partName) {
      toast.error('Please fill required fields (Employee No, Problem, Part Name)');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowSaveConfirm(false);
    try {
      if (formData.id) {
        await axios.put(`/api/problem-log/${formData.id}`, formData);
        toast.success('Record updated successfully');
      } else {
        await axios.post('/api/problem-log', formData);
        toast.success('Record created successfully');
      }
      setShowForm(false);
      fetchRecords(searchTerm);
    } catch (err) {
      toast.error('Error saving record');
    }
  };

  const handleEdit = (record) => {
    setFormData({ ...record });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`/api/problem-log/${id}`);
        toast.success('Record deleted');
        fetchRecords(searchTerm);
      } catch (err) {
        toast.error('Failed to delete record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      employeeNo: '',
      problem: '',
      partName: '',
      heatCode: '',
      qty: '',
      status: 'Pending',
      reason: ''
    });
    setShowForm(false);
  };

  const dash = (val) => (val !== null && val !== undefined && val !== '') ? val : '—';

  return (
    <>
      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">Problem Log</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Problem Log</h1>
          <p className="page-subtitle">Track and manage employee production issues</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-container" style={{ position: 'relative' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '32px', width: '200px' }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Entry
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-panel" style={{ display: 'block' }}>
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">{formData.id ? 'Edit Problem Log' : 'New Problem Log'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={resetForm}>Cancel</button>
            </div>
            
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-section">
                  <div className="form-section-title">Problem Details</div>
                  
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label required">Employee No</label>
                      <input 
                        type="text" 
                        name="employeeNo" 
                        className="form-control" 
                        value={formData.employeeNo} 
                        onChange={e => setFormData({...formData, employeeNo: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">Part Name</label>
                      <PartNameSelect 
                        value={formData.partName} 
                        onChange={val => setFormData({...formData, partName: val})} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date/Heat Code</label>
                      <input 
                        type="text" 
                        name="heatCode" 
                        className="form-control" 
                        value={formData.heatCode} 
                        onChange={e => setFormData({...formData, heatCode: e.target.value})} 
                      />
                    </div>
                  </div>
                  
                  <div className="form-row form-row-2">
                    <div className="form-group">
                      <label className="form-label required">Problem Description</label>
                      <input 
                        type="text" 
                        name="problem" 
                        className="form-control" 
                        value={formData.problem} 
                        onChange={e => setFormData({...formData, problem: e.target.value})} 
                        required 
                        placeholder="Describe the issue..."
                      />
                    </div>
                    <div className="form-row form-row-2" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Qty</label>
                        <input 
                          type="number" 
                          name="qty" 
                          className="form-control" 
                          value={formData.qty} 
                          onChange={e => setFormData({...formData, qty: e.target.value})} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select 
                          name="status" 
                          className="form-control" 
                          value={formData.status} 
                          onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Hold">Hold</option>
                          <option value="Scrapped">Scrapped</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-row form-row-1">
                    <div className="form-group">
                      <label className="form-label">Reason / Corrective Action</label>
                      <textarea 
                        name="reason" 
                        className="form-control" 
                        value={formData.reason} 
                        onChange={e => setFormData({...formData, reason: e.target.value})} 
                        rows="3"
                        placeholder="Provide details of resolution or action taken..."
                      />
                    </div>
                  </div>
                </div>

                <div className="card-footer" style={{ margin: '0 -1.5rem -1.5rem', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Save Record
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
          <h2 className="card-title">Problem Log Records</h2>
          <span className="badge badge-secondary">{records.length} records</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            {loading ? (
              <Skeleton rows={5} />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee No</th>
                    <th>Problem</th>
                    <th>Part Name</th>
                    <th>Date/Heat Code</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                        No records found
                      </td>
                    </tr>
                  ) : (
                    records.map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>{dash(r.employeeNo)}</td>
                        <td>{dash(r.problem)}</td>
                        <td><strong>{dash(r.partName)}</strong></td>
                        <td>{dash(r.heatCode)}</td>
                        <td>{dash(r.qty)}</td>
                        <td>
                          <span className={`status-badge status-${(r.status || 'Pending').toLowerCase()}`}>
                            {r.status || 'Pending'}
                          </span>
                        </td>
                        <td>{dash(r.reason)}</td>
                        <td className="actions-cell">
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button 
                              className="btn btn-primary btn-sm" 
                              onClick={() => handleEdit(r)} 
                              style={{ padding: '0.2rem 0.6rem', fontSize: '12px', background: 'var(--color-primary)', border: 'none' }}
                            >
                              Edit
                            </button>
                            {(user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && (
                              <button 
                                className="btn btn-danger btn-sm" 
                                onClick={() => handleDelete(r.id)} 
                                style={{ padding: '0.2rem 0.6rem', fontSize: '12px', background: '#ef4444', border: 'none' }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={showSaveConfirm} 
        onConfirm={handleConfirmSave} 
        onClose={() => setShowSaveConfirm(false)} 
        message="Are you sure you want to save this record?" 
      />
    </>
  );
};

export default ProblemLog;
