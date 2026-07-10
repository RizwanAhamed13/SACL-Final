import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { PartNameSelect } from '../components/PartNameSelect';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';

const TENSILE_FIELDS = [
  { name: 'maxLoadKn', label: 'Max Load (KN)', type: 'number', step: '0.1', placeholder: 'e.g. 10.5' },
  { name: 'yieldLoadKn', label: 'Yield Load (KN)', type: 'number', step: '0.1', placeholder: 'e.g. 7.2' },
  { name: 'tensileStrength', label: 'Tensile Strength / UTS', type: 'number', step: '0.1', thMin: 'tensileMinStrength', thMax: 'tensileMaxStrength', placeholder: 'e.g. 540' },
  { name: 'yieldStrength02', label: 'Yield Strength @0.2%', type: 'number', step: '0.1', thMin: 'tensileMinYield', thMax: 'tensileMaxYield', placeholder: 'e.g. 350' },
  { name: 'yieldStrength05', label: 'Yield Strength @0.5%', type: 'number', step: '0.1', thMin: 'tensileMinYield05', thMax: 'tensileMaxYield05', placeholder: 'e.g. 300' },
  { name: 'elongationPercent', label: 'Elongation %', type: 'number', step: '0.1', thMin: 'tensileMinElongation', thMax: 'tensileMaxElongation', placeholder: 'e.g. 14' },
];

const MicroTensile = () => {
  const { user } = useAuth();
  const isStaff = user?.role?.toUpperCase()?.includes('HOF') || user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN');

  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    dateOfInspection: new Date().toISOString().split('T')[0], item: '', dateCode: '', disa: '',
    barDiaMm: '', gaugeLengthMm: '', mechLocation: '',
    maxLoadKn: '', yieldLoadKn: '', tensileStrength: '', yieldStrength02: '', yieldStrength05: '', elongationPercent: '',
    remarks: '',
    status: 'QC_ENTRY', hofApprovedBy: '', hodApprovedBy: '', createdBy: ''
  });

  const [loading, setLoading] = useState(true);
  const [tableRemarks, setTableRemarks] = useState({});
  const [thresholds, setThresholds] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  
  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const toggleSelectAll = () => {
    const pending = records.filter(r => r.status === 'HOF_APPROVED');
    if (selectedIds.length === pending.length && pending.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pending.map(r => r.id));
    }
  };

  const [approveAllModal, setApproveAllModal] = useState(false);
  const [approveAllLoading, setApproveAllLoading] = useState(false);
  const [hofPendingCount, setHofPendingCount] = useState(0);

  const activeLocations = formData.mechLocation
    ? formData.mechLocation.split(',').filter(Boolean)
    : (thresholds?.mechLocations ? thresholds.mechLocations.split(',').filter(Boolean) : []);

  const fetchRecords = async (query = searchTerm) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await axios.get('/api/micro-tensile/search', { params: { q: query } });
      const data = res.data.content ?? res.data;
      setRecords(data);
      setHofPendingCount(data.filter(r => r.status === 'HOF_APPROVED').length);
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

  const validateAll = (data, ts, locs) => {
    const newErrors = {};
    if (!ts) return;
    const thFields = TENSILE_FIELDS.filter(f => f.thMin);
    if (!data.id && locs && locs.length > 0) {
      locs.forEach(loc => {
        thFields.forEach(f => {
          if (isOutOfRange(data[`${loc}_${f.name}`], ts[f.thMin], ts[f.thMax])) newErrors[`${loc}_${f.name}`] = true;
        });
        if (isOutOfRange(data[`${loc}_barDiaMm`] ?? data.barDiaMm, ts.barDiaMin, ts.barDiaMax)) newErrors.barDiaMm = true;
      });
    } else {
      thFields.forEach(f => {
        if (isOutOfRange(data[f.name], ts[f.thMin], ts[f.thMax])) newErrors[f.name] = true;
      });
      if (isOutOfRange(data.barDiaMm, ts.barDiaMin, ts.barDiaMax)) newErrors.barDiaMm = true;
    }
    setErrors(newErrors);
  };

  const fetchThresholds = async (partName, currentData = formData) => {
    if (!partName) {
      setThresholds(null);
      setErrors({});
      return;
    }
    try {
      const res = await axios.get(`/api/part-names/name/${encodeURIComponent(partName)}`);
      setThresholds(res.data);
      if (res.data) {
        const locs = currentData.id && currentData.mechLocation ? currentData.mechLocation.split(',').filter(Boolean) : (res.data.mechLocations ? res.data.mechLocations.split(',').filter(Boolean) : []);
        validateAll(currentData, res.data, locs);
      }
    } catch (err) {
      console.error("Failed to fetch thresholds", err);
    }
  };

  const openEdit = (record) => {
    let flatLocData = {};
    let discoveredLocs = [];
    if (record.locationValues) {
      try {
        const parsed = JSON.parse(record.locationValues);
        Object.keys(parsed).forEach(loc => {
          if (!discoveredLocs.includes(loc)) discoveredLocs.push(loc);
          Object.keys(parsed[loc]).forEach(k => {
            flatLocData[`${loc}_${k}`] = parsed[loc][k];
          });
        });
      } catch (e) { console.error("Error parsing locationValues", e); }
    }
    
    // Ensure mechLocation is populated for UI rendering
    let currentLocs = record.mechLocation ? record.mechLocation.split(',').filter(Boolean) : [];
    if (currentLocs.length === 0 && discoveredLocs.length > 0) currentLocs = discoveredLocs;
    if (currentLocs.length === 0) currentLocs = ['TRA'];

    setFormData({
      ...record,
      ...flatLocData,
      mechLocation: currentLocs.join(','),
      dateOfInspection: record.dateOfInspection ? record.dateOfInspection.split('T')[0] : ''
    });
    fetchThresholds(record.item, {
      ...record,
      ...flatLocData,
      dateOfInspection: record.dateOfInspection ? record.dateOfInspection.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleApprove = async (record, nextStatus, customRemarks = null) => {
    try {
      const approvalField = nextStatus === 'HOF_APPROVED' ? 'hofApprovedBy' : 'hodApprovedBy';
      const finalRemarks = customRemarks !== null ? customRemarks : record.remarks;
      const payload = {
        ...record,
        status: nextStatus,
        remarks: finalRemarks,
        [approvalField]: user.employeeId || user.fullName
      };
      await axios.put(`/api/micro-tensile/${record.id}`, payload);
      fetchRecords();
      toast.success('Record approved');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error(err.response.data.message || 'Record modified by another user. Please refresh.', { duration: 5000 });
      } else {
        toast.error('Approval failed');
      }
    }
  };

    const handleChange = (e) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (thresholds) validateAll(nextData, thresholds, activeLocations);
  };

  const handlePartNameChange = (val) => {
    const nextData = { ...formData, item: val };
    setFormData(nextData);
    fetchThresholds(val, nextData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix validation errors before saving.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowSaveConfirm(false);
    if (Object.keys(errors).length > 0) {
      return toast.error("Please correct values out of engineering range!");
    }
    try {
      let payload = { ...formData };
      
      if (activeLocations.length > 0) {
        const locationValues = {};
        activeLocations.forEach(loc => {
          locationValues[loc] = {
            maxLoadKn: formData[`${loc}_maxLoadKn`] || formData.maxLoadKn || null,
            yieldLoadKn: formData[`${loc}_yieldLoadKn`] || formData.yieldLoadKn || null,
            tensileStrength: formData[`${loc}_tensileStrength`] || formData.tensileStrength || null,
            yieldStrength02: formData[`${loc}_yieldStrength02`] || formData.yieldStrength02 || null,
            yieldStrength05: formData[`${loc}_yieldStrength05`] || formData.yieldStrength05 || null,
            elongationPercent: formData[`${loc}_elongationPercent`] || formData.elongationPercent || null,
          };
        });
        payload.mechLocation = activeLocations.join(',');
        payload.locationValues = JSON.stringify(locationValues);
      } else {
        ['maxLoadKn', 'yieldLoadKn', 'tensileStrength', 'yieldStrength02', 'yieldStrength05', 'elongationPercent', 'barDiaMm', 'gaugeLengthMm'].forEach(k => {
          if (payload[k] === '') payload[k] = null;
        });
      }

      if (payload.id) {
        if (user?.role?.toUpperCase()?.includes('HOD') && payload.status === 'HOF_APPROVED') {
          payload = { ...payload, status: 'HOD_APPROVED', hodApprovedBy: user.employeeId || user.fullName };
        }
        await axios.put(`/api/micro-tensile/${payload.id}`, payload);
        toast.success('Updated successfully');
      } else {
        payload.createdBy = user.employeeId || user.fullName;
        await axios.post('/api/micro-tensile', payload);
        toast.success('Added successfully');
      }
      setShowForm(false);
      setFormData({
        id: null,
        dateOfInspection: new Date().toISOString().split('T')[0], item: '', dateCode: '', disa: '',
        barDiaMm: '', gaugeLengthMm: '', mechLocation: '',
        maxLoadKn: '', yieldLoadKn: '', tensileStrength: '', yieldStrength02: '', yieldStrength05: '', elongationPercent: '',
        remarks: '',
        status: 'QC_ENTRY', hofApprovedBy: '', hodApprovedBy: '', createdBy: ''
      });
      setErrors({});
      fetchRecords();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error(err.response.data.message || 'Record modified by another user. Please refresh.', { duration: 5000 });
      } else {
        toast.error('Submission failed');
      }
    }
  };

  const renderThreshold = (min, max) => {
    if (min !== null && min !== undefined && max !== null && max !== undefined && min !== '' && max !== '') return `(${min}–${max})`;
    if (max !== null && max !== undefined && max !== '') return `(Max ${max})`;
    if (min !== null && min !== undefined && min !== '') return `(${min} Min)`;
    return '';
  };

  const dash = (val) => (val !== null && val !== undefined && val !== '') ? val : '—';

  return (
    <>
      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">Tensile Test</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Micro Tensile Test Report</h1>
          <p className="page-subtitle">Bar dia, gauge length, max/yield load, tensile strength, elongation — DISA I/II/III/IV</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRecords()}
              style={{ padding: '0.5rem', width: '250px' }}
            />
            <button className="btn btn-secondary" onClick={() => fetchRecords()}>Search</button>
          </div>
          {(user?.role?.toUpperCase()?.includes('HOF') || user?.role?.toUpperCase()?.includes('ADMIN') || user?.role?.toUpperCase()?.includes('USER') || user?.role?.toUpperCase()?.includes('QC')) && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Test
            </button>
          )}
          {(user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && hofPendingCount > 0 && (
            <button
              className="btn btn-secondary"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setApproveAllModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Approve {selectedIds.length > 0 ? `Selected (${selectedIds.length})` : `All (${hofPendingCount})`}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="form-panel" style={{ display: 'block' }}>
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">{formData.id ? 'Edit Tensile Test' : 'Add Tensile Test'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>

                <div className="form-section">
                  <div className="form-section-title">Test Reference</div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label required">Date of Inspection</label>
                      <input type="date" name="dateOfInspection" value={formData.dateOfInspection} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Item / Part Name</label>
                      <PartNameSelect value={formData.item} onChange={handlePartNameChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date Code</label>
                      <input type="text" name="dateCode" value={formData.dateCode} onChange={handleChange} className="form-control" placeholder="e.g. 6D08-41" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">DISA</label>
                      <input type="text" name="disa" value={formData.disa || ''} onChange={handleChange} className="form-control" placeholder="e.g. D1234" />
                    </div>
                    {formData.id && (
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input type="text" value={formData.mechLocation || '—'} readOnly className="form-control" style={{ background: '#f8fafc', color: '#64748b' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Specimen Data</div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label">Bar Dia <span style={{color: errors.barDiaMm ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>
                        (mm, 5±0.06) {thresholds && (thresholds.barDiaMin || thresholds.barDiaMax) ? renderThreshold(thresholds.barDiaMin, thresholds.barDiaMax) : ''}
                      </span></label>
                      <input type="number" step="0.01" name="barDiaMm" value={formData.barDiaMm} onChange={handleChange} className="form-control"
                        style={errors.barDiaMm ? { borderColor:'#ef4444', backgroundColor:'#fef2f2', color:'#ef4444' } : {}} placeholder="e.g. 5.00" />
                      {errors.barDiaMm && <div style={{color:'#ef4444',fontSize:'10px',marginTop:'2px',fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gauge Length Lo <span style={{color:'var(--color-text-secondary)', fontWeight:400}}>(mm)</span></label>
                      <input type="number" step="0.1" name="gaugeLengthMm" value={formData.gaugeLengthMm} onChange={handleChange} className="form-control" placeholder="e.g. 25" />
                    </div>
                  </div>
                </div>

                {activeLocations.length > 0 ? (
                  <div className="form-section">
                    <div className="form-section-title">Test Results — Per Location</div>
                    {activeLocations.map(loc => (
                      <div key={loc} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.25rem', background: '#f8fafc' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          📍 {loc}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {TENSILE_FIELDS.map(f => {
                            const errKey = `${loc}_${f.name}`;
                            const hasErr = errors[errKey];
                            const thHint = f.thMin && thresholds ? renderThreshold(thresholds[f.thMin], thresholds[f.thMax]) : '';
                            return (
                              <div className="form-group" key={f.name} style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: '12px' }}>
                                  {f.label}
                                  {thHint && <span style={{ color: hasErr ? '#ef4444' : 'var(--color-text-secondary)', fontWeight: 400, marginLeft: '4px' }}>{thHint}</span>}
                                </label>
                                <input type={f.type} step={f.step} name={`${loc}_${f.name}`} value={formData[`${loc}_${f.name}`] || ''} onChange={handleChange} className="form-control" placeholder={f.placeholder} style={hasErr ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} />
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
                    <div className="form-section-title">Test Results</div>
                    <div className="form-row form-row-3">
                      <div className="form-group">
                        <label className="form-label">Max Load <span style={{color:'var(--color-text-secondary)', fontWeight:400}}>(KN)</span></label>
                        <input type="number" step="0.1" name="maxLoadKn" value={formData.maxLoadKn} onChange={handleChange} className="form-control" placeholder="e.g. 10.5" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Yield Load <span style={{color:'var(--color-text-secondary)', fontWeight:400}}>(KN)</span></label>
                        <input type="number" step="0.1" name="yieldLoadKn" value={formData.yieldLoadKn} onChange={handleChange} className="form-control" placeholder="e.g. 7.2" />
                      </div>
                    </div>
                    <div className="form-row form-row-3">
                      <div className="form-group">
                        <label className="form-label">Tensile Strength / UTS <span style={{color: errors.tensileStrength ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.tensileMinStrength, thresholds.tensileMaxStrength) : '(500 Min)'}</span></label>
                        <input type="number" step="0.1" name="tensileStrength" value={formData.tensileStrength} onChange={handleChange} className="form-control" style={errors.tensileStrength ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 540" />
                        {errors.tensileStrength && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Yield Strength @0.2% <span style={{color: errors.yieldStrength02 ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.tensileMinYield, thresholds.tensileMaxYield) : '(320 Min)'}</span></label>
                        <input type="number" step="0.1" name="yieldStrength02" value={formData.yieldStrength02} onChange={handleChange} className="form-control" style={errors.yieldStrength02 ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 350" />
                        {errors.yieldStrength02 && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Yield Strength @0.5% <span style={{color: errors.yieldStrength05 ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.tensileMinYield05, thresholds.tensileMaxYield05) : ''}</span></label>
                        <input type="number" step="0.1" name="yieldStrength05" value={formData.yieldStrength05} onChange={handleChange} className="form-control" style={errors.yieldStrength05 ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 300" />
                        {errors.yieldStrength05 && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Elongation % <span style={{color: errors.elongationPercent ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.tensileMinElongation, thresholds.tensileMaxElongation) : '(10 Min)'}</span></label>
                        <input type="number" step="0.1" name="elongationPercent" value={formData.elongationPercent} onChange={handleChange} className="form-control" style={errors.elongationPercent ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 14" />
                        {errors.elongationPercent && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-section">
                  <div className="form-section-title">Additional Info</div>
                  <div className="form-row form-row-1">
                    <div className="form-group">
                      <label className="form-label">Remarks</label>
                      <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="form-control" rows="2" placeholder="Enter any remarks..." />
                    </div>
                  </div>
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

                    
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Tensile Test Records</h2>
          <span className="badge badge-secondary">{records.length} records</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th rowSpan="2" style={{ width: '40px', textAlign: 'center' }}>
                    {(user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && (
                      <input 
                        type="checkbox" 
                        onChange={toggleSelectAll} 
                        checked={records.filter(r => r.status === 'HOF_APPROVED').length > 0 && selectedIds.length === records.filter(r => r.status === 'HOF_APPROVED').length}
                      />
                    )}
                  </th>
                   <th rowSpan="2" style={{ whiteSpace: 'nowrap' }}>Inspection Date</th>
                   <th rowSpan="2">Item / Part</th>
                   <th rowSpan="2">Date/Heat Code</th>
                   <th rowSpan="2">DISA</th>
                   <th rowSpan="2">Bar Dia (mm)</th>
                   <th rowSpan="2">Gauge Len (mm)</th>
                   <th rowSpan="2">Loc</th>
                   <th colSpan="2" style={{ textAlign: 'center' }}>Load (kN)</th>
                   <th colSpan="3" style={{ textAlign: 'center' }}>Strength (N/mm²)</th>
                   <th rowSpan="2">Elongation (%)</th>
                   <th rowSpan="2">Remarks</th>
                   <th rowSpan="2">Status</th>
                   <th rowSpan="2">Approval Info</th>
                   <th rowSpan="2">Actions</th>
                 </tr>
                 <tr>
                   <th style={{ fontSize: '10px' }}>Max</th>
                   <th style={{ fontSize: '10px' }}>Yield</th>
                   <th style={{ fontSize: '10px' }}>UTS</th>
                   <th style={{ fontSize: '10px' }}>Yield 0.2%</th>
                   <th style={{ fontSize: '10px' }}>Yield 0.5%</th>
                 </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="13"><Skeleton width="100%" height="40px" /></td>
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="13" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>No records found</td>
                  </tr>
                ) : records.map((r) => {
                  let locations = [];
                  if (r.locationValues) {
                    try {
                      locations = Object.entries(JSON.parse(r.locationValues));
                    } catch (e) { console.error("Error parsing locationValues", e); }
                  }
                  if (locations.length === 0) {
                    locations = [['—', {
                      maxLoadKn: r.maxLoadKn,
                      yieldLoadKn: r.yieldLoadKn,
                      tensileStrength: r.tensileStrength,
                      yieldStrength02: r.yieldStrength02,
                      yieldStrength05: r.yieldStrength05,
                      elongationPercent: r.elongationPercent,
                    }]];
                  }

                  const rowCount = locations.length;
                  return (
                    <React.Fragment key={r.id}>
                      {locations.map(([loc, vals], idx) => (
                        <tr key={`${r.id}-${loc}`}>
                    <td style={{ textAlign: 'center' }}>
                      {(user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && r.status === 'HOF_APPROVED' && (
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(r.id)} 
                          onChange={() => toggleSelection(r.id)} 
                        />
                      )}
                    </td>
                          {idx === 0 && (
                            <>
                              <td rowSpan={rowCount}>{r.dateOfInspection?.split('T')[0] || '—'}</td>
                              <td rowSpan={rowCount}><strong>{dash(r.item)}</strong></td>
                              <td rowSpan={rowCount}>{dash(r.dateCode)}</td>
                              <td rowSpan={rowCount} style={{ fontSize: '12px' }}>{dash(r.disa)}</td>
                              <td rowSpan={rowCount} style={{ fontSize: '12px' }}>{dash(r.barDiaMm)}</td>
                              <td rowSpan={rowCount} style={{ fontSize: '12px' }}>{dash(r.gaugeLengthMm)}</td>
                            </>
                          )}
                          <td style={{ fontWeight: 600, color: '#4b5563', fontSize: '12px' }}>{loc}</td>
                          <td style={{ fontSize: '12px' }}>{dash(vals.maxLoadKn)}</td>
                          <td style={{ fontSize: '12px' }}>{dash(vals.yieldLoadKn)}</td>
                          <td style={{ fontSize: '12px' }}>{dash(vals.tensileStrength)}</td>
                          <td style={{ fontSize: '12px' }}>{dash(vals.yieldStrength02)}</td>
                          <td style={{ fontSize: '12px' }}>{dash(vals.yieldStrength05)}</td>
                          <td style={{ fontSize: '12px' }}>{dash(vals.elongationPercent)}</td>
                          
                          {idx === 0 && (
                            <>
                              <td rowSpan={rowCount} style={{ fontSize: '11px', maxWidth: '200px', whiteSpace: 'normal' }}>
                                {dash(r.remarks)}
                              </td>
                              <td rowSpan={rowCount}>
                                <span className={`status-badge status-${(r.status || 'QC_ENTRY').toLowerCase()}`}>
                                  {(r.status || 'QC_ENTRY').replace('_', ' ')}
                                </span>
                              </td>
                              <td rowSpan={rowCount} style={{ fontSize: '11px', lineHeight: '1.4' }}>
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
                              <td rowSpan={rowCount} style={{ whiteSpace: 'nowrap' }}>
                                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                  {((user?.role?.toUpperCase()?.includes('HOF') && (r.status || 'QC_ENTRY') === 'QC_ENTRY') || user?.role?.toUpperCase()?.includes('ADMIN') || user?.role?.toUpperCase()?.includes('HOD') || r.createdBy === user?.username || r.createdBy === user?.employeeId || r.createdBy === user?.fullName) && (
                                    <button className="btn btn-primary btn-sm" onClick={() => openEdit(r)} style={{ padding: '0.2rem 0.6rem', fontSize: '12px', background: 'var(--color-primary)', border: 'none' }}>
                                      Edit
                                    </button>
                                  )}

                                  {user?.role?.toUpperCase()?.includes('HOF') && (r.status || 'QC_ENTRY') === 'QC_ENTRY' && (
                                    <button className="btn btn-primary btn-sm" onClick={() => handleApprove(r, 'HOF_APPROVED', tableRemarks[r.id])} style={{ padding: '0.2rem 0.6rem', fontSize: '12px', background: '#059669', border: 'none' }}>
                                      Approve HOF
                                    </button>
                                  )}

                                  

                                  </div>
                                </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
       
      <ConfirmModal 
        isOpen={showSaveConfirm} 
        onConfirm={handleConfirmSave} 
        onClose={() => setShowSaveConfirm(false)} 
        message="Are you sure you want to save this record?" 
      />
      <ConfirmModal
        isOpen={approveAllModal}
        onClose={() => setApproveAllModal(false)}
        onConfirm={async () => {
          setApproveAllModal(false);
          setApproveAllLoading(true);
          try {
            const res = await selectedIds.length > 0 ? axios.post('/api/micro-tensile/approve-bulk', selectedIds) : axios.post('/api/micro-tensile/approve-all');
            toast.success(`${res.data.approved} Tensile Test records approved!`);
            fetchRecords();
            setSelectedIds([]);
          } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve records');
          } finally {
            setApproveAllLoading(false);
          }
        }}
        title={selectedIds.length > 0 ? "Approve Selected Records" : "HOD Bulk Approval"}
        message={`${selectedIds.length > 0 ? `Approve ${selectedIds.length} selected` : `Approve all ${hofPendingCount}`} pending HOF-approved Tensile Test records in one shot?`}
        confirmText={approveAllLoading ? 'Approving...' : 'Approve All'}
      />
    </>
  );
};

export default MicroTensile;
