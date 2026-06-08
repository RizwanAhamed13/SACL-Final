import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { PartNameSelect } from '../components/PartNameSelect';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';

const IMPACT_FIELDS = [
  { name: 'observedValue1', label: 'Observed Value 1 (J)', placeholder: 'e.g. 14.5' },
  { name: 'observedValue2', label: 'Observed Value 2 (J)', placeholder: 'e.g. 13.8' },
  { name: 'observedValue3', label: 'Observed Value 3 (J)', placeholder: 'e.g. 15.2' },
];

const NOTCH_LABEL = { Unnotch: 'Un-notch', Unotch: 'U-notch', Vnotch: 'V-notch' };
const NOTCH_REVERSE = Object.entries(NOTCH_LABEL).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});
const normalizeNotch = (notch) => NOTCH_REVERSE[notch] || notch;
const comboKey = (loc, notch, field) => `${loc}_${notch}_${field}`;
const ALL_NOTCHES = Object.entries(NOTCH_LABEL).map(([k, v]) => ({ key: k, label: v }));

const ImpactTest = () => {
  const { user } = useAuth();
  const isStaff = user?.role?.toUpperCase()?.includes('HOF') || user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN');

  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedNotches, setSelectedNotches] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    dateOfInspection: new Date().toISOString().split('T')[0], partName: '', dateCode: '',
    specification: '', testType: '', mechLocation: '',
    observedValue1: '', observedValue2: '', observedValue3: '',
    remarks: '',
    status: 'QC_ENTRY', hofApprovedBy: '', hodApprovedBy: '', createdBy: ''
  });

  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, record: null });
  const [thresholds, setThresholds] = useState(null);
  const [errors, setErrors] = useState({});

  const activeLocations = !formData.id && thresholds?.mechLocations
    ? thresholds.mechLocations.split(',').filter(Boolean)
    : [];
  const activeNotches = !formData.id ? selectedNotches.map(k => NOTCH_LABEL[k]) : [];
  const useCombos = activeLocations.length > 0 && activeNotches.length > 0;

  const fetchRecords = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await axios.get('/api/impact-test');
      setRecords(res.data.content ?? res.data);
    } catch (err) {
      console.warn("Could not fetch records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const isOutOfRange = (val, min, max) => {
    if (val === undefined || val === null || val === '') return false;
    const hasMin = min !== null && min !== undefined && min !== '';
    const hasMax = max !== null && max !== undefined && max !== '';
    if (!hasMin && !hasMax) return false; // no threshold set — accept any value
    const num = parseFloat(val);
    if (isNaN(num)) return false;
    if (hasMin && num < parseFloat(min)) return true;
    if (hasMax && num > parseFloat(max)) return true;
    return false;
  };

  // Get the threshold for a specific notch type (per-notch takes priority over generic)
  const getNotchThreshold = (ts, notchKey) => {
    const perNotch = {
      Unnotch: { min: ts.impactMinUnnotch, max: ts.impactMaxUnnotch },
      Unotch:  { min: ts.impactMinUnotch,  max: ts.impactMaxUnotch  },
      Vnotch:  { min: ts.impactMinVnotch,  max: ts.impactMaxVnotch  },
    };
    const t = perNotch[notchKey];
    if (t && (t.min !== null && t.min !== undefined && t.min !== '' ||
              t.max !== null && t.max !== undefined && t.max !== '')) return t;
    return { min: ts.impactMinSpec, max: ts.impactMaxSpec };
  };

  const validateAll = (data, ts, locs, notches) => {
    const newErrors = {};
    if (!ts) return;
    if (!data.id && locs && locs.length > 0 && notches && notches.length > 0) {
      // Per (location x notch) — use per-notch threshold
      locs.forEach(loc => {
        notches.forEach(notch => {
          const { min: cMin, max: cMax } = getNotchThreshold(ts, notch);
          IMPACT_FIELDS.forEach(f => {
            const key = comboKey(loc, notch, f.name);
            if (isOutOfRange(data[key], cMin, cMax)) newErrors[key] = true;
          });
        });
      });
    } else if (!data.id && locs && locs.length > 0) {
      locs.forEach(loc => {
        IMPACT_FIELDS.forEach(f => {
          if (isOutOfRange(data[`${loc}_${f.name}`], ts.impactMinSpec, ts.impactMaxSpec)) newErrors[`${loc}_${f.name}`] = true;
        });
      });
    } else {
      if (isOutOfRange(data.observedValue1, ts.impactMinSpec, ts.impactMaxSpec)) newErrors.observedValue1 = true;
      if (isOutOfRange(data.observedValue2, ts.impactMinSpec, ts.impactMaxSpec)) newErrors.observedValue2 = true;
      if (isOutOfRange(data.observedValue3, ts.impactMinSpec, ts.impactMaxSpec)) newErrors.observedValue3 = true;
    }
    setErrors(newErrors);
  };

  const fetchThresholds = async (partName, currentData = formData) => {
    if (!partName) {
      setThresholds(null);
      setSelectedNotches([]);
      setErrors({});
      return;
    }
    try {
      const res = await axios.get(`/api/part-names/name/${encodeURIComponent(partName)}`);
      setThresholds(res.data);
      if (res.data) {
        const locs = res.data.mechLocations ? res.data.mechLocations.split(',').filter(Boolean) : [];
        const notches = res.data.impactNotchTypes ? res.data.impactNotchTypes.split(',').filter(Boolean) : [];
        setSelectedNotches(notches);
        validateAll(currentData, res.data, locs, notches);
      }
    } catch (err) {
      console.error("Failed to fetch thresholds", err);
    }
  };

  const openEdit = (record) => {
    setFormData({
      ...record,
      dateOfInspection: record.dateOfInspection ? record.dateOfInspection.split('T')[0] : ''
    });
    fetchThresholds(record.partName, {
      ...record,
      dateOfInspection: record.dateOfInspection ? record.dateOfInspection.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleApprove = async (record, nextStatus) => {
    try {
      const approvalField = nextStatus === 'HOF_APPROVED' ? 'hofApprovedBy' : 'hodApprovedBy';
      const payload = {
        ...record,
        status: nextStatus,
        [approvalField]: user.employeeId || user.fullName
      };
      await axios.put(`/api/impact-test/${record.id}`, payload);
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
      await axios.post(`/api/impact-test/reject/${record.id}?rejectedBy=${user.employeeId || user.fullName}`);
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
    if (thresholds) validateAll(nextData, thresholds, activeLocations, activeNotches);
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
        await axios.put(`/api/impact-test/${formData.id}`, formData);
        toast.success('Updated successfully');
      } else if (useCombos) {
        const locationValues = {};
        activeLocations.forEach(loc => {
          locationValues[loc] = {};
          selectedNotches.forEach(notchKey => {
            locationValues[loc][notchKey] = {
              v1: formData[comboKey(loc, notchKey, 'observedValue1')] || null,
              v2: formData[comboKey(loc, notchKey, 'observedValue2')] || null,
              v3: formData[comboKey(loc, notchKey, 'observedValue3')] || null,
            };
          });
        });
        await axios.post('/api/impact-test', {
          dateOfInspection: formData.dateOfInspection,
          partName: formData.partName,
          dateCode: formData.dateCode,
          specification: formData.specification,
          remarks: formData.remarks,
          createdBy: user.employeeId || user.fullName,
          mechLocation: activeLocations.join(','),
          notchType: selectedNotches.join(','),
          testType: selectedNotches.map(k => NOTCH_LABEL[k]).join(','),
          locationValues: JSON.stringify(locationValues),
        });
        toast.success('1 record saved');
      } else if (activeLocations.length > 0) {
        const locationValues = {};
        activeLocations.forEach(loc => {
          locationValues[loc] = {
            v1: formData[`${loc}_observedValue1`] || null,
            v2: formData[`${loc}_observedValue2`] || null,
            v3: formData[`${loc}_observedValue3`] || null,
          };
        });
        await axios.post('/api/impact-test', {
          dateOfInspection: formData.dateOfInspection,
          partName: formData.partName,
          dateCode: formData.dateCode,
          specification: formData.specification,
          testType: formData.testType,
          remarks: formData.remarks,
          createdBy: user.employeeId || user.fullName,
          mechLocation: activeLocations.join(','),
          locationValues: JSON.stringify(locationValues),
        });
        toast.success('1 record saved');
      } else {
        await axios.post('/api/impact-test', { ...formData, createdBy: user.employeeId || user.fullName });
        toast.success('Added successfully');
      }
      setShowForm(false);
      setSelectedNotches([]);
      setFormData({
        id: null,
        dateOfInspection: new Date().toISOString().split('T')[0], partName: '', dateCode: '',
        specification: '', testType: '', mechLocation: '',
        observedValue1: '', observedValue2: '', observedValue3: '',
        remarks: '',
        status: 'QC_ENTRY', hofApprovedBy: '', hodApprovedBy: '', createdBy: ''
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
    return '';
  };

  const dash = (val) => val || '—';

  return (
    <>
      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">Impact Test</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Charpy Impact Test Report</h1>
          <p className="page-subtitle">Impact energy absorption (Joules) for V-notch specimens</p>
        </div>
        <div className="page-actions">
          {(user?.role?.toUpperCase()?.includes('QC') || user?.role?.toUpperCase()?.includes('ADMIN')) && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Test
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="form-panel" style={{ display: 'block' }}>
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">{formData.id ? 'Edit Impact Test Report' : 'Add Impact Test Report'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>

                <div className="form-section">
                  <div className="form-section-title">Test Reference</div>
                  <div className="form-row form-row-4">
                    <div className="form-group">
                      <label className="form-label required">Date of Inspection</label>
                      <input type="date" name="dateOfInspection" value={formData.dateOfInspection} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Part Name</label>
                      <PartNameSelect value={formData.partName} onChange={handlePartNameChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date Code</label>
                      <input type="text" name="dateCode" value={formData.dateCode} onChange={handleChange} className="form-control" placeholder="e.g. 5D03-45" />
                    </div>
                    {formData.id && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Location</label>
                          <input type="text" value={formData.mechLocation || '—'} readOnly className="form-control" style={{ background: '#f8fafc', color: '#64748b' }} />
                        </div>
                        {formData.notchType && (
                          <div className="form-group">
                            <label className="form-label">Notch Type</label>
                            <input type="text" value={NOTCH_LABEL[formData.notchType] || formData.notchType} readOnly className="form-control" style={{ background: '#f8fafc', color: '#64748b' }} />
                          </div>
                        )}
                      </>
                    )}
                  </div>


                </div>

                {useCombos ? (
                  <div className="form-section">
                    <div className="form-section-title">Test Results — {activeLocations.length} Location{activeLocations.length > 1 ? 's' : ''} × {selectedNotches.length} Notch{selectedNotches.length > 1 ? 'es' : ''} = {activeLocations.length * selectedNotches.length} Block{activeLocations.length * selectedNotches.length > 1 ? 's' : ''}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      {activeLocations.flatMap(loc => selectedNotches.map(notchKey => {
                        const notchLabel = NOTCH_LABEL[notchKey];
                        const notchTh = thresholds ? getNotchThreshold(thresholds, notchKey) : { min: null, max: null };
                        const thHint = renderThreshold(notchTh.min, notchTh.max);
                        return (
                          <div key={`${loc}_${notchKey}`} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem 1.25rem', background: '#f8fafc' }}>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              📍 {loc} — {notchLabel}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                              {IMPACT_FIELDS.map(f => {
                                const errKey = comboKey(loc, notchKey, f.name);
                                const hasErr = errors[errKey];
                                return (
                                  <div className="form-group" key={f.name} style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: '12px' }}>
                                      {f.label}
                                      {thHint && <span style={{ color: hasErr ? '#ef4444' : 'var(--color-text-secondary)', fontWeight: 400, marginLeft: '4px' }}>{thHint}</span>}
                                    </label>
                                    <input
                                      type="number" step="0.1"
                                      name={errKey}
                                      value={formData[errKey] || ''}
                                      onChange={handleChange}
                                      className="form-control"
                                      placeholder={f.placeholder}
                                      style={hasErr ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}}
                                    />
                                    {hasErr && <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', fontWeight: '600' }}>Value out of range!</div>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }))}
                    </div>
                  </div>
                ) : activeLocations.length > 0 ? (
                  <div className="form-section">
                    <div className="form-section-title">Test Results — Per Location</div>
                    {activeLocations.map(loc => (
                      <div key={loc} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.25rem', background: '#f8fafc' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          📍 {loc}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {IMPACT_FIELDS.map(f => {
                            const errKey = `${loc}_${f.name}`;
                            const hasErr = errors[errKey];
                            const thHint = thresholds ? renderThreshold(thresholds.impactMinSpec, thresholds.impactMaxSpec) : '';
                            return (
                              <div className="form-group" key={f.name} style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: '12px' }}>
                                  {f.label}
                                  {thHint && <span style={{ color: hasErr ? '#ef4444' : 'var(--color-text-secondary)', fontWeight: 400, marginLeft: '4px' }}>{thHint}</span>}
                                </label>
                                <input
                                  type="number" step="0.1"
                                  name={`${loc}_${f.name}`}
                                  value={formData[`${loc}_${f.name}`] || ''}
                                  onChange={handleChange}
                                  className="form-control"
                                  placeholder={f.placeholder}
                                  style={hasErr ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}}
                                />
                                {hasErr && <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', fontWeight: '600' }}>Value out of range!</div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="form-section">
                    <div className="form-section-title">Test Results (Joules)</div>
                    <div className="form-row form-row-3">
                      <div className="form-group">
                        <label className="form-label">Observed Value 1 <span style={{color: errors.observedValue1 ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.impactMinSpec, thresholds.impactMaxSpec) : '(12 Min)'}</span></label>
                        <input type="number" step="0.1" name="observedValue1" value={formData.observedValue1} onChange={handleChange} className="form-control" style={errors.observedValue1 ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 14.5" />
                        {errors.observedValue1 && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Observed Value 2 <span style={{color: errors.observedValue2 ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.impactMinSpec, thresholds.impactMaxSpec) : '(12 Min)'}</span></label>
                        <input type="number" step="0.1" name="observedValue2" value={formData.observedValue2} onChange={handleChange} className="form-control" style={errors.observedValue2 ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 13.8" />
                        {errors.observedValue2 && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Observed Value 3 <span style={{color: errors.observedValue3 ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.impactMinSpec, thresholds.impactMaxSpec) : '(12 Min)'}</span></label>
                        <input type="number" step="0.1" name="observedValue3" value={formData.observedValue3} onChange={handleChange} className="form-control" style={errors.observedValue3 ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 15.2" />
                        {errors.observedValue3 && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                      </div>
                    </div>
                  </div>
                )}

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
                    <button type="button" className="btn btn-secondary" onClick={() => setFormData(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: '' }), {}), approvedBy: user?.employeeId || user?.fullName || '' }))}>Clear</button>
                    <button type="submit" className="btn btn-primary" disabled={Object.keys(errors).length > 0}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {Object.keys(errors).length > 0 ? 'Fix Errors to Save' : 'Save Record'}
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
          <h2 className="card-title">Impact Test Records</h2>
          <span className="badge badge-secondary">{records.length} records</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                   <th>Inspection Date</th>
                  <th>Part Name</th>
                  <th>Date Code</th>
                  <th>Location</th>
                  <th>Notch</th>
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
                    <td>{r.dateOfInspection?.split('T')[0] || '—'}</td>
                    <td><strong>{dash(r.partName)}</strong></td>
                    <td>{dash(r.dateCode)}</td>
                    <td>{dash(r.mechLocation)}</td>
                    <td>{r.notchType ? (NOTCH_LABEL[r.notchType] || r.notchType) : '—'}</td>
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

export default ImpactTest;
