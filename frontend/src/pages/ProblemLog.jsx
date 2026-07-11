import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { PartNameSelect } from '../components/PartNameSelect';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';

const ProblemLog = () => {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeNo || !formData.problem || !formData.partName) {
      toast.error('Please fill required fields (Employee No, Problem, Part Name)');
      return;
    }

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

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Problem Log</h1>
          <p className="page-subtitle">Track and manage employee production issues</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Entry
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search by Employee No or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <Skeleton rows={5} />
        ) : (
          <table className="data-table">
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
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No records found
                  </td>
                </tr>
              ) : (
                records.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.employeeNo}</td>
                    <td>{r.problem}</td>
                    <td>{r.partName}</td>
                    <td>{r.heatCode}</td>
                    <td>{r.qty}</td>
                    <td>
                      <span className={`status-badge ${r.status === 'Resolved' ? 'status-green' : r.status === 'Hold' ? 'status-amber' : 'status-purple'}`}>
                        {r.status || 'Pending'}
                      </span>
                    </td>
                    <td>{r.reason}</td>
                    <td className="actions-cell">
                      <button className="icon-btn edit-btn" onClick={() => handleEdit(r)} title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(r.id)} title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
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
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee No *</label>
                  <input type="text" name="employeeNo" className="form-control" value={formData.employeeNo} onChange={e => setFormData({...formData, employeeNo: e.target.value})} required />
                </div>
                
                <div className="form-group">
                  <label>Problem *</label>
                  <input type="text" name="problem" className="form-control" value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label>Part Name *</label>
                  <PartNameSelect value={formData.partName} onChange={val => setFormData({...formData, partName: val})} required />
                </div>

                <div className="form-group">
                  <label>Date/Heat Code</label>
                  <input type="text" name="heatCode" className="form-control" value={formData.heatCode} onChange={e => setFormData({...formData, heatCode: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Qty</label>
                  <input type="number" name="qty" className="form-control" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Hold">Hold</option>
                    <option value="Scrapped">Scrapped</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Reason</label>
                  <textarea name="reason" className="form-control" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows="3"></textarea>
                </div>
              </div>

              <div className="card-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemLog;
