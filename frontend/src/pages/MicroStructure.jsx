import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { PartNameSelect } from '../components/PartNameSelect';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';

const MicroStructure = () => {
  const { user } = useAuth();
  const isStaff = user?.role?.toUpperCase()?.includes('HOF') || user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN');

  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    inspectionDate: new Date().toISOString().split('T')[0], partName: '', disa: '', dateCode: '',
    nodularityPercent: '', graphiteType: '', countNosPerMm2: '', size: '',
    ferritePercent: '', pearlitePercent: '', carbidePercent: '',
    remarks: '',
    status: 'QC_ENTRY', hofApprovedBy: '', hodApprovedBy: '', createdBy: ''
  });

  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, record: null });
  const [thresholds, setThresholds] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchRecords = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await axios.get('/api/micro-structure');
      setRecords(res.data);
    } catch (err) {
      console.warn("Could not fetch records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchThresholds = async (partName, currentData = formData) => {
    if (!partName) {
      setThresholds(null);
      setErrors({});
      return;
    }
    try {
      const res = await axios.get(`/api/part-names/name/${encodeURIComponent(partName)}`);
      setThresholds(res.data);
      if (res.data) validateAll(currentData, res.data);
    } catch (err) {
      console.error("Failed to fetch thresholds", err);
    }
  };

  const isOutOfRange = (val, min, max) => {
    if (val === undefined || val === null || val === '') return false;
    const num = parseFloat(val);
    if (isNaN(num)) return false;
    if (min !== null && min !== undefined && num < min) return true;
    if (max !== null && max !== undefined && num > max) return true;
    return false;
  };

  const validateAll = (data, ts) => {
    const newErrors = {};
    if (!ts) return;
    if (isOutOfRange(data.nodularityPercent, ts.microMinNodularity, ts.microMaxNodularity)) newErrors.nodularityPercent = true;
    if (isOutOfRange(data.countNosPerMm2, ts.microMinCount, ts.microMaxCount)) newErrors.countNosPerMm2 = true;
    if (isOutOfRange(data.ferritePercent, ts.microMinFerrite, ts.microMaxFerrite)) newErrors.ferritePercent = true;
    if (isOutOfRange(data.pearlitePercent, ts.microMinPearlite, ts.microMaxPearlite)) newErrors.pearlitePercent = true;
    if (isOutOfRange(data.carbidePercent, ts.microMinCarbide, ts.microMaxCarbide)) newErrors.carbidePercent = true;
    setErrors(newErrors);
  };

  const openEdit = (record) => {
    setFormData({
      ...record,
      inspectionDate: record.inspectionDate ? record.inspectionDate.split('T')[0] : ''
    });
    fetchThresholds(record.partName, {
      ...record,
      inspectionDate: record.inspectionDate ? record.inspectionDate.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleApprove = async (record, nextStatus) => {
    try {
      const approvalField = nextStatus === 'HOF_APPROVED' ? 'hofApprovedBy' : 'hodApprovedBy';
      const payload = {
        ...record,
        status: nextStatus,
        [approvalField]: user.fullName || user.username
      };
      await axios.put(`/api/micro-structure/${record.id}`, payload);
      fetchRecords();
      toast.success('Record approved');
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const handleReject = async () => {
    const record = rejectModal.record;
    if (!record) return;
    try {
      await axios.post(`/api/micro-structure/reject/${record.id}?rejectedBy=${user.fullName || user.username}`);
      fetchRecords();
      setShowForm(false);
      setRejectModal({ isOpen: false, record: null });
      toast.success('Record rejected and archived');
    } catch (err) {
      toast.error('Rejection failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (thresholds) validateAll(nextData, thresholds);
  };

  const handlePartNameChange = (val) => {
    const nextData = { ...formData, partName: val };
    setFormData(nextData);
    fetchThresholds(val, nextData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      return toast.error("Please correct values out of engineering range!");
    }
    try {
      if (formData.id) {
        await axios.put(`/api/micro-structure/${formData.id}`, formData);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/micro-structure', { ...formData, createdBy: user.fullName || user.username });
        toast.success('Added successfully');
      }
      setShowForm(false);
      setFormData({
        inspectionDate: '', partName: '', heatCode: '',
        nodularityPercent: '', countNosPerMm2: '', size: '',
        ferritePercent: '', pearlitePercent: '', carbidePercent: '',
        status: 'QC_ENTRY', hofApprovedBy: '', hodApprovedBy: ''
      });
      setErrors({});
      fetchRecords();
    } catch (err) {
      toast.error('Submission failed');
    }
  };

  const renderThreshold = (min, max) => {
    if (min !== null && min !== undefined && max !== null && max !== undefined && min !== '' && max !== '') return `(${min}–${max})`;
    if (max !== null && max !== undefined && max !== '') return `(Max ${max})`;
    if (min !== null && min !== undefined && min !== '') return `(${min} Min)`;
    return '(—)';
  };

  const dash = (val) => val || '—';

  return (
    <>
      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">Micro Structure</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Micro Structure Analysis</h1>
          <p className="page-subtitle">Nodularity, nodule count, matrix composition, and carbide percentage</p>
        </div>
        <div className="page-actions">
          {(user?.role?.toUpperCase()?.includes('QC') || user?.role?.toUpperCase()?.includes('ADMIN')) && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Analysis
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="form-panel" style={{ display: 'block' }}>
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">Add Analysis Report</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>

                <div className="form-section">
                  <div className="form-section-title">Analysis Reference</div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label required">Inspection Date</label>
                      <input type="date" name="inspectionDate" value={formData.inspectionDate} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Part Name</label>
                      <PartNameSelect value={formData.partName} onChange={handlePartNameChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Heat Code / Date Code</label>
                      <input type="text" name="heatCode" value={formData.heatCode} onChange={handleChange} className="form-control" placeholder="e.g. 5D03-45" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Nodule Analysis</div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label">Nodularity % <span style={{color: errors.nodularityPercent ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.microMinNodularity, thresholds.microMaxNodularity) : '(85 Min)'}</span></label>
                      <input type="number" name="nodularityPercent" value={formData.nodularityPercent} onChange={handleChange} className="form-control" style={errors.nodularityPercent ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 90" />
                      {errors.nodularityPercent && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Count <span style={{color: errors.countNosPerMm2 ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>(Nos/mm²) {thresholds ? renderThreshold(thresholds.microMinCount, thresholds.microMaxCount) : '(150 Min)'}</span></label>
                      <input type="number" name="countNosPerMm2" value={formData.countNosPerMm2} onChange={handleChange} className="form-control" style={errors.countNosPerMm2 ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 200" />
                      {errors.countNosPerMm2 && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Size <span style={{color:'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? `(${thresholds.microSize || '—'})` : '(6-7)'}</span></label>
                      <input type="text" name="size" value={formData.size} onChange={handleChange} className="form-control" placeholder="e.g. 6" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Matrix Composition (%)</div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label">Ferrite % <span style={{color: errors.ferritePercent ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.microMinFerrite, thresholds.microMaxFerrite) : '(Max 10)'}</span></label>
                      <input type="number" name="ferritePercent" value={formData.ferritePercent} onChange={handleChange} className="form-control" style={errors.ferritePercent ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 5" />
                      {errors.ferritePercent && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pearlite % <span style={{color: errors.pearlitePercent ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.microMinPearlite, thresholds.microMaxPearlite) : '(90 Min)'}</span></label>
                      <input type="number" name="pearlitePercent" value={formData.pearlitePercent} onChange={handleChange} className="form-control" style={errors.pearlitePercent ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 95" />
                      {errors.pearlitePercent && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Carbide % <span style={{color: errors.carbidePercent ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.microMinCarbide, thresholds.microMaxCarbide) : '(Max 1)'}</span></label>
                      <input type="number" name="carbidePercent" value={formData.carbidePercent} onChange={handleChange} className="form-control" style={errors.carbidePercent ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 0.5" />
                      {errors.carbidePercent && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Approval</div>
                  <div className="form-group">
                    <label className="form-label">Remarks</label>
                    <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="form-control" rows="2" placeholder="Any observations..."></textarea>
                  </div>
                  <div className="form-row form-row-1">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <div className={`status-badge status-${(formData.status || 'QC_ENTRY').toLowerCase()}`} style={{ padding: '0.6rem', textAlign: 'center', width: '100%', borderRadius: '8px' }}>
                        {(formData.status || 'QC_ENTRY').replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  {formData.hofApprovedBy && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>HOF Approved By: <strong>{formData.hofApprovedBy}</strong></p>}
                  {formData.hodApprovedBy && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>HOD Approved By: <strong>{formData.hodApprovedBy}</strong></p>}
                </div>

                <div className="card-footer" style={{ margin: '0 -1.5rem -1.5rem', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setFormData(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: '' }), {}), approvedBy: user?.fullName || user?.username || '' }))}>Clear</button>
                    <button type="submit" className="btn btn-primary" disabled={Object.keys(errors).length > 0}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {Object.keys(errors).length > 0 ? 'Fix Errors to Save' : 'Save Analysis'}
                    </button>

                    {formData.id && user?.role?.toUpperCase()?.includes('HOF') && (formData.status || 'QC_ENTRY') === 'QC_ENTRY' && (
                      <button type="button" className="btn" style={{ background: '#059669', color: 'white' }} onClick={() => handleApprove(formData, 'HOF_APPROVED')}>
                        Approve HOF
                      </button>
                    )}

                    {formData.id && (user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && (formData.status || 'QC_ENTRY') === 'HOF_APPROVED' && (
                      <button type="button" className="btn" style={{ background: '#2563eb', color: 'white' }} onClick={() => handleApprove(formData, 'HOD_APPROVED')}>
                        Approve HOD
                      </button>
                    )}

                    {formData.id && (
                      ((user?.role?.toUpperCase()?.includes('HOF') && (formData.status || 'QC_ENTRY') === 'QC_ENTRY')) ||
                      ((user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && (formData.status || 'QC_ENTRY') === 'HOF_APPROVED')
                    ) && (
                      <button type="button" className="btn" style={{ background: '#dc2626', color: 'white' }} onClick={() => setRejectModal({ isOpen: true, record: formData })}>
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Analysis Records</h2>
          <span className="badge badge-secondary">{records.length} records</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                   <th>Inspection Date</th>
                  <th>Part Name</th>
                  <th>Date/Heat Code</th>
                   <th>Status</th>
                   <th>Approval Info</th>
                   {isStaff && <th>Actions</th>}
                 </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="7"><Skeleton width="100%" height="40px" /></td>
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>No records found</td>
                  </tr>
                ) : records.map((r) => (
                  <tr key={r.id}>
                    <td>{r.inspectionDate?.split('T')[0] || '—'}</td>
                    <td><strong>{dash(r.partName)}</strong></td>
                    <td>{dash(r.dateCode)}</td>
                    <td>
                      <span className={`status-badge status-${(r.status || 'QC_ENTRY').toLowerCase()}`}>
                        {(r.status || 'QC_ENTRY').replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', lineHeight: '1.4' }}>
                      <div style={{ marginBottom: '6px' }}>
                        <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Entered By</span>
                        <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{r.createdBy || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {r.hofApprovedBy ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            HOF: {r.hofApprovedBy}
                          </div>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f3f4f6', color: '#6b7280', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                            Awaiting HOF
                          </div>
                        )}
                        {r.hodApprovedBy ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="7 13 12 18 22 8"/><polyline points="2 13 7 18 13 12"/></svg>
                            HOD: {r.hodApprovedBy}
                          </div>
                        ) : r.hofApprovedBy && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f3f4f6', color: '#6b7280', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                            Awaiting HOD
                          </div>
                        )}
                      </div>
                    </td>
                    {isStaff && (
                       <td style={{ whiteSpace: 'nowrap' }}>
                         {((user?.role?.toUpperCase()?.includes('HOF') && (r.status || 'QC_ENTRY') === 'QC_ENTRY') ||
                           user?.role?.toUpperCase()?.includes('ADMIN') || user?.role?.toUpperCase()?.includes('HOD')) && (
                           <button className="btn btn-primary btn-sm" onClick={() => openEdit(r)} style={{ padding: '0.2rem 0.6rem', fontSize: '12px', background: 'var(--color-primary)', border: 'none' }}>
                             Edit
                           </button>
                         )}

                         {user?.role?.toUpperCase()?.includes('HOF') && (r.status || 'QC_ENTRY') === 'QC_ENTRY' && (
                           <button className="btn btn-primary btn-sm" onClick={() => handleApprove(r, 'HOF_APPROVED')} style={{ marginLeft: '0.5rem', padding: '0.2rem 0.6rem', fontSize: '12px', background: '#059669', border: 'none' }}>
                             Approve HOF
                           </button>
                         )}

                         {(user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && (r.status || 'QC_ENTRY') === 'HOF_APPROVED' && (
                           <button className="btn btn-primary btn-sm" onClick={() => handleApprove(r, 'HOD_APPROVED')} style={{ marginLeft: '0.5rem', padding: '0.2rem 0.6rem', fontSize: '12px', background: '#2563eb', border: 'none' }}>
                             Approve HOD
                           </button>
                         )}

                         {((user?.role?.toUpperCase()?.includes('HOF') && (r.status || 'QC_ENTRY') === 'QC_ENTRY') ||
                           ((user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && (r.status || 'QC_ENTRY') === 'HOF_APPROVED')) && (
                           <button className="btn btn-primary btn-sm" onClick={() => setRejectModal({ isOpen: true, record: r })} style={{ marginLeft: '0.5rem', padding: '0.2rem 0.6rem', fontSize: '12px', background: '#dc2626', border: 'none' }}>
                             Reject
                           </button>
                         )}
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
         isOpen={rejectModal.isOpen}
         onClose={() => setRejectModal({ isOpen: false, record: null })}
         onConfirm={handleReject}
         title="Reject Record?"
         message="Are you sure you want to REJECT this record? This action will archive and remove it from the active list."
         confirmText="Confirm Rejection"
       />
    </>
  );
};

export default MicroStructure;
