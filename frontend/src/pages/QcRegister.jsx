import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { PartNameSelect } from '../components/PartNameSelect';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';
import TimePicker from '../components/TimePicker';

const QcRegister = () => {
  const { user } = useAuth();
  const isStaff = user?.role?.toUpperCase()?.includes('HOF') || user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN');

  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [formData, setFormData] = useState({
    id: null, // for editing
    heatCode: '', date: new Date().toISOString().split('T')[0], dateCode: '', disa: '', partName: '', qtyMoulds: '',
    compositionC: '', compositionSi: '', compositionMn: '', compositionP: '', compositionS: '',
    compositionMgFirst: '', compositionMgLast: '', compositionCu: '', compositionCr: '',
    fcNoHeatNo: '', conNo: '', tappingTime: '', tappingWtKgs: '', pouringTemp: '', pouringTempStart: '', pouringTempEnd: '', timeOfPouringStart: '', timeOfPouringEnd: '', streamInnoculant: '', ppCode: '',
    treatmentNo: '', mgKgs: '', resMgConvertorPercent: '', recMgPercent: '', pTimeSec: '', pTimeSecStart: '', pTimeSecEnd: '',
    correctiveC: '', correctiveSi: '', correctiveMn: '', correctiveS: '', correctiveCr: '', correctiveCu: '', correctiveSn: '',
    remarks: '',
    status: 'QC_ENTRY', hofApprovedBy: '', hodApprovedBy: '', createdBy: ''
  });

  const [loading, setLoading] = useState(true);
  const [tableRemarks, setTableRemarks] = useState({});
  const [thresholds, setThresholds] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchRecords = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await axios.get('/api/qc-register');
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

  const fetchThresholds = async (partName, currentData = formData) => {
    if (!partName) {
      setThresholds(null);
      setErrors({});
      return;
    }
    try {
      const res = await axios.get(`/api/part-names/name/${encodeURIComponent(partName)}`);
      setThresholds(res.data);
      // Re-validate existing data with new thresholds
      if (res.data) validateAll(currentData, res.data);
    } catch (err) {
      console.error("Failed to fetch thresholds", err);
    }
  };

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

  const validateAll = (data, ts) => {
    const newErrors = {};
    if (!ts) return;

    // Composition Validation (%)
    if (isOutOfRange(data.compositionC, ts.qcMinC, ts.qcMaxC)) newErrors.compositionC = true;
    if (isOutOfRange(data.compositionSi, ts.qcMinSi, ts.qcMaxSi)) newErrors.compositionSi = true;
    if (isOutOfRange(data.compositionMn, ts.qcMinMn, ts.qcMaxMn)) newErrors.compositionMn = true;
    if (isOutOfRange(data.compositionP, ts.qcMinP, ts.qcMaxP)) newErrors.compositionP = true;
    if (isOutOfRange(data.compositionS, ts.qcMinS, ts.qcMaxS)) newErrors.compositionS = true;
    if (isOutOfRange(data.compositionMgFirst, ts.qcMinMg, ts.qcMaxMg)) newErrors.compositionMgFirst = true;
    if (isOutOfRange(data.compositionMgLast, ts.qcMinMg, ts.qcMaxMg)) newErrors.compositionMgLast = true;
    if (isOutOfRange(data.compositionCu, ts.qcMinCu, ts.qcMaxCu)) newErrors.compositionCu = true;
    if (isOutOfRange(data.compositionCr, ts.qcMinCr, ts.qcMaxCr)) newErrors.compositionCr = true;
    if (isOutOfRange(data.compositionSn, ts.qcMinSn, ts.qcMaxSn)) newErrors.compositionSn = true;

    // Process Parameter Validation
    if (isOutOfRange(data.pouringTemp, ts.ppMinPouringTemp, ts.ppMaxPouringTemp)) newErrors.pouringTemp = true;
    if (isOutOfRange(data.pouringTempStart, ts.ppMinPouringTemp, ts.ppMaxPouringTemp)) newErrors.pouringTempStart = true;
    if (isOutOfRange(data.pouringTempEnd, ts.ppMinPouringTemp, ts.ppMaxPouringTemp)) newErrors.pouringTempEnd = true;
    if (isOutOfRange(data.mgKgs, ts.ppMinMgKgs, ts.ppMaxMgKgs)) newErrors.mgKgs = true;
    if (isOutOfRange(data.streamInnoculant, ts.ppMinStreamInnoculant, ts.ppMaxStreamInnoculant)) newErrors.streamInnoculant = true;
    if (isOutOfRange(data.pTimeSec, ts.ppMinPTimeSec, ts.ppMaxPTimeSec)) newErrors.pTimeSec = true;
    if (isOutOfRange(data.pTimeSecStart, ts.ppMinPTimeSec, ts.ppMaxPTimeSec)) newErrors.pTimeSecStart = true;
    if (isOutOfRange(data.pTimeSecEnd, ts.ppMinPTimeSec, ts.ppMaxPTimeSec)) newErrors.pTimeSecEnd = true;
    if (isOutOfRange(data.resMgConvertorPercent, ts.ppMinResMgConvertor, ts.ppMaxResMgConvertor)) newErrors.resMgConvertorPercent = true;

    // Corrective Addition Validation (Kgs)
    if (isOutOfRange(data.correctiveC, ts.corrMinC, ts.corrMaxC)) newErrors.correctiveC = true;
    if (isOutOfRange(data.correctiveSi, ts.corrMinSi, ts.corrMaxSi)) newErrors.correctiveSi = true;
    if (isOutOfRange(data.correctiveMn, ts.corrMinMn, ts.corrMaxMn)) newErrors.correctiveMn = true;
    if (isOutOfRange(data.correctiveS, ts.corrMinS, ts.corrMaxS)) newErrors.correctiveS = true;
    if (isOutOfRange(data.correctiveCr, ts.corrMinCr, ts.corrMaxCr)) newErrors.correctiveCr = true;
    if (isOutOfRange(data.correctiveCu, ts.corrMinCu, ts.corrMaxCu)) newErrors.correctiveCu = true;
    if (isOutOfRange(data.correctiveSn, ts.corrMinSn, ts.corrMaxSn)) newErrors.correctiveSn = true;

    setErrors(newErrors);
  };

  const openEdit = (record) => {
    setFormData({
      ...record,
      date: record.date ? record.date.split('T')[0] : ''
    });
    fetchThresholds(record.partName, {
      ...record,
      date: record.date ? record.date.split('T')[0] : ''
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
      await axios.put(`/api/qc-register/${record.id}`, payload);
      fetchRecords();
      toast.success('Record approved');
    } catch (err) {
      toast.error('Approval failed');
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
      if (formData.id) {
        await axios.put(`/api/qc-register/${formData.id}`, formData);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/qc-register', { ...formData, createdBy: user.employeeId || user.fullName });
        toast.success('Added successfully');
      }
      setShowForm(false);
      setFormData({
        disa: '', date: '', partName: '', dateCode: '', heatCode: '', qtyMoulds: '',
        compositionC: '', compositionSi: '', compositionMn: '', compositionP: '', compositionS: '', compositionMgFirst: '', compositionMgLast: '', compositionCu: '', compositionCr: '', compositionSn: '',
        timeOfPouringStart: '', timeOfPouringEnd: '', pouringTemp: '', pouringTempStart: '', pouringTempEnd: '', ppCode: '', treatmentNo: '', fcNoHeatNo: '', conNo: '', tappingTime: '',
        correctiveC: '', correctiveSi: '', correctiveMn: '', correctiveS: '', correctiveCr: '', correctiveCu: '', correctiveSn: '',
        tappingWtKgs: '', mgKgs: '', resMgConvertorPercent: '', recMgPercent: '', streamInnoculant: '', pTimeSec: '', pTimeSecStart: '', pTimeSecEnd: '', remarks: ''
      });
      setThresholds(null);
      setErrors({});
      fetchRecords();
    } catch (err) {
      toast.error('Submission failed');
    }
  };

  const renderThreshold = (min, max) => {
    const minText = (min !== null && min !== undefined && min !== '') ? `Min: ${min}` : '';
    const maxText = (max !== null && max !== undefined && max !== '') ? `Max: ${max}` : '';
    
    if (minText && maxText) return `[${minText}] [${maxText}]`;
    if (minText) return `[${minText}]`;
    if (maxText) return `[${maxText}]`;
    return '(—)';
  };

  const dash = (val) => val || '—';

  return (
    <>
      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">QC Register</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Quality Control Register</h1>
          <p className="page-subtitle">Daily chemical composition &amp; metal treatment log — DISA I/II/III/IV</p>
        </div>
        <div className="page-actions">
          {(user?.role?.toUpperCase()?.includes('QC') || user?.role?.toUpperCase()?.includes('ADMIN')) && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Entry
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="form-panel" style={{ display: 'block' }}>
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">{formData.id ? 'Edit Entry' : 'Add New Entry'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                
                <div className="form-section">
                  <div className="form-section-title">Record Identification</div>
                  <div className="form-row form-row-4">
                    <div className="form-group">
                      <label className="form-label">DISA</label>
                      <select name="disa" value={formData.disa} onChange={handleChange} className="form-control">
                        <option value="">Select</option>
                        <option>DISA I</option>
                        <option>DISA II</option>
                        <option>DISA III</option>
                        <option>DISA IV</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label required">Date</label>
                      <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Part Name</label>
                      <PartNameSelect value={formData.partName} onChange={handlePartNameChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date Code</label>
                      <input type="text" name="dateCode" value={formData.dateCode} onChange={handleChange} className="form-control" placeholder="e.g. 10D02" />
                    </div>
                  </div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label">Heat Code</label>
                      <input type="text" name="heatCode" value={formData.heatCode} onChange={handleChange} className="form-control" placeholder="e.g. 5D03-45" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Qty Moulds</label>
                      <input type="number" name="qtyMoulds" value={formData.qtyMoulds} onChange={handleChange} className="form-control" placeholder="0" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Chemical Composition (%)</div>
                  <div className="form-row form-row-4">
                    <div className="form-group">
                      <label className="form-label">C <span style={{color: errors.compositionC ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.qcMinC, thresholds.qcMaxC) : '[Min: 3.00] [Max: 4.00]'}</span></label>
                      <input type="number" step="0.01" name="compositionC" value={formData.compositionC} onChange={handleChange} className="form-control" style={errors.compositionC ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="3.55" />
                      {errors.compositionC && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Si <span style={{color: errors.compositionSi ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.qcMinSi, thresholds.qcMaxSi) : '[Min: 2.00] [Max: 3.00]'}</span></label>
                      <input type="number" step="0.01" name="compositionSi" value={formData.compositionSi} onChange={handleChange} className="form-control" style={errors.compositionSi ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="2.55" />
                      {errors.compositionSi && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mn <span style={{color: errors.compositionMn ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.qcMinMn, thresholds.qcMaxMn) : '[Min: 0.10] [Max: 0.50]'}</span></label>
                      <input type="number" step="0.01" name="compositionMn" value={formData.compositionMn} onChange={handleChange} className="form-control" style={errors.compositionMn ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="0.25" />
                      {errors.compositionMn && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">P <span style={{color: errors.compositionP ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.qcMinP, thresholds.qcMaxP) : '[Max: 0.05]'}</span></label>
                      <input type="number" step="0.001" name="compositionP" value={formData.compositionP} onChange={handleChange} className="form-control" style={errors.compositionP ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="0.03" />
                      {errors.compositionP && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Exceeds limit!</div>}
                    </div>
                  </div>
                  <div className="form-row form-row-4">
                    <div className="form-group">
                      <label className="form-label">S <span style={{color: errors.compositionS ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.qcMinS, thresholds.qcMaxS) : '[Max: 0.02]'}</span></label>
                      <input type="number" step="0.001" name="compositionS" value={formData.compositionS} onChange={handleChange} className="form-control" style={errors.compositionS ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="0.012" />
                      {errors.compositionS && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Exceeds limit!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mg First <span style={{color: errors.compositionMgFirst ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.qcMinMg, thresholds.qcMaxMg) : '[Min: 0.015] [Max: 0.050]'}</span></label>
                      <input type="number" step="0.001" name="compositionMgFirst" value={formData.compositionMgFirst} onChange={handleChange} className="form-control" style={errors.compositionMgFirst ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="0.035" />
                      {errors.compositionMgFirst && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mg Last <span style={{color: errors.compositionMgLast ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.qcMinMg, thresholds.qcMaxMg) : '[Min: 0.015] [Max: 0.050]'}</span></label>
                      <input type="number" step="0.001" name="compositionMgLast" value={formData.compositionMgLast} onChange={handleChange} className="form-control" style={errors.compositionMgLast ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="0.035" />
                      {errors.compositionMgLast && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cu <span style={{color: errors.compositionCu ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.qcMinCu, thresholds.qcMaxCu) : '[Max: 0.20]'}</span></label>
                      <input type="number" step="0.01" name="compositionCu" value={formData.compositionCu} onChange={handleChange} className="form-control" style={errors.compositionCu ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="0.05" />
                      {errors.compositionCu && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Exceeds limit!</div>}
                    </div>
                  </div>
                  <div className="form-row form-row-4">
                    <div className="form-group">
                      <label className="form-label">Cr <span style={{color: errors.compositionCr ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.qcMinCr, thresholds.qcMaxCr) : '[Max: 0.05]'}</span></label>
                      <input type="number" step="0.01" name="compositionCr" value={formData.compositionCr} onChange={handleChange} className="form-control" style={errors.compositionCr ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="0.02" />
                      {errors.compositionCr && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Exceeds limit!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sn <span style={{color: errors.compositionSn ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.qcMinSn, thresholds.qcMaxSn) : '[Max: 0.01]'}</span></label>
                      <input type="number" step="0.001" name="compositionSn" value={formData.compositionSn} onChange={handleChange} className="form-control" style={errors.compositionSn ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="0.005" />
                      {errors.compositionSn && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Process Parameters</div>
                  <div className="form-row form-row-4">
                    <div className="form-group">
                      <label className="form-label">Time of Pouring</label>
                      <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                        <TimePicker name="timeOfPouringStart" value={formData.timeOfPouringStart} onChange={handleChange} />
                        <span style={{color:'#94a3b8', fontWeight:600}}>—</span>
                        <TimePicker name="timeOfPouringEnd" value={formData.timeOfPouringEnd} onChange={handleChange} />
                      </div>
                    </div>
                      <div className="form-group">
                        <label className="form-label">Pouring Temp °C
                          {thresholds && (thresholds.ppMinPouringTemp || thresholds.ppMaxPouringTemp) && (
                            <span style={{color:'var(--color-text-secondary)', fontWeight:400, marginLeft:'4px'}}>
                              {renderThreshold(thresholds.ppMinPouringTemp, thresholds.ppMaxPouringTemp)}
                            </span>
                          )}
                        </label>
                        <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                          <input type="number" name="pouringTempStart" value={formData.pouringTempStart} onChange={handleChange} className="form-control"
                            style={errors.pouringTempStart ? { borderColor:'#ef4444', backgroundColor:'#fef2f2', color:'#ef4444' } : {}}
                            placeholder="Start" />
                          <span style={{color:'#94a3b8', fontWeight:600}}>—</span>
                          <input type="number" name="pouringTempEnd" value={formData.pouringTempEnd} onChange={handleChange} className="form-control"
                            style={errors.pouringTempEnd ? { borderColor:'#ef4444', backgroundColor:'#fef2f2', color:'#ef4444' } : {}}
                            placeholder="End" />
                        </div>
                        {(errors.pouringTempStart || errors.pouringTempEnd) && <div style={{color:'#ef4444',fontSize:'10px',marginTop:'2px',fontWeight:'600'}}>Value out of range!</div>}
                      </div>
                    <div className="form-group"><label className="form-label">PP Code</label><input type="text" name="ppCode" value={formData.ppCode} onChange={handleChange} className="form-control" placeholder="e.g. A1" /></div>
                    <div className="form-group"><label className="form-label">Treatment No</label><input type="text" name="treatmentNo" value={formData.treatmentNo} onChange={handleChange} className="form-control" placeholder="e.g. 12" /></div>
                  </div>
                  <div className="form-row form-row-4">
                    <div className="form-group"><label className="form-label">F/C No / Heat No</label><input type="text" name="fcNoHeatNo" value={formData.fcNoHeatNo} onChange={handleChange} className="form-control" placeholder="e.g. F1/H2" /></div>
                    <div className="form-group"><label className="form-label">Con No</label><input type="text" name="conNo" value={formData.conNo} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Tapping Time</label><TimePicker name="tappingTime" value={formData.tappingTime} onChange={handleChange} /></div>
                    <div className="form-group"><label className="form-label">Tapping Wt (Kgs)</label><input type="number" name="tappingWtKgs" value={formData.tappingWtKgs} onChange={handleChange} className="form-control" /></div>
                  </div>
                  <div className="form-row form-row-4">

                  </div>
                  <div className="form-row form-row-4">
                    <div className="form-group">
                      <label className="form-label">Mg (Kgs) <span style={{color: errors.mgKgs ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds && (thresholds.ppMinMgKgs || thresholds.ppMaxMgKgs) ? renderThreshold(thresholds.ppMinMgKgs, thresholds.ppMaxMgKgs) : ''}</span></label>
                      <input type="number" step="0.01" name="mgKgs" value={formData.mgKgs} onChange={handleChange} className="form-control" style={errors.mgKgs ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} />
                      {errors.mgKgs && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Res Mg Convertor %
                        {thresholds && (thresholds.ppMinResMgConvertor || thresholds.ppMaxResMgConvertor) && (
                          <span style={{color: errors.resMgConvertorPercent ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400, marginLeft:'4px'}}>
                            {renderThreshold(thresholds.ppMinResMgConvertor, thresholds.ppMaxResMgConvertor)}
                          </span>
                        )}
                      </label>
                      <input type="number" step="0.001" name="resMgConvertorPercent" value={formData.resMgConvertorPercent} onChange={handleChange} className="form-control"
                        style={errors.resMgConvertorPercent ? { borderColor:'#ef4444', backgroundColor:'#fef2f2', color:'#ef4444' } : {}} />
                      {errors.resMgConvertorPercent && <div style={{color:'#ef4444',fontSize:'10px',marginTop:'2px',fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                    <div className="form-group"><label className="form-label">Rec of Mg %</label><input type="number" step="0.01" name="recMgPercent" value={formData.recMgPercent} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group">
                      <label className="form-label">Stream Inoculant (gms/Sec) <span style={{color: errors.streamInnoculant ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds && (thresholds.ppMinStreamInnoculant || thresholds.ppMaxStreamInnoculant) ? renderThreshold(thresholds.ppMinStreamInnoculant, thresholds.ppMaxStreamInnoculant) : ''}</span></label>
                      <input type="text" name="streamInnoculant" value={formData.streamInnoculant} onChange={handleChange} className="form-control" style={errors.streamInnoculant ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} />
                      {errors.streamInnoculant && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                  </div>
                  <div className="form-row form-row-4">
                    <div className="form-group">
                      <label className="form-label">P.Time (sec)
                        {thresholds && (thresholds.ppMinPTimeSec || thresholds.ppMaxPTimeSec) && (
                          <span style={{color:'var(--color-text-secondary)', fontWeight:400, marginLeft:'4px'}}>
                            {renderThreshold(thresholds.ppMinPTimeSec, thresholds.ppMaxPTimeSec)}
                          </span>
                        )}
                      </label>
                      <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                        <input type="number" step="0.1" name="pTimeSecStart" value={formData.pTimeSecStart} onChange={handleChange} className="form-control"
                          style={errors.pTimeSecStart ? { borderColor:'#ef4444', backgroundColor:'#fef2f2', color:'#ef4444' } : {}}
                          placeholder="Start" />
                        <span style={{color:'#94a3b8', fontWeight:600}}>—</span>
                        <input type="number" step="0.1" name="pTimeSecEnd" value={formData.pTimeSecEnd} onChange={handleChange} className="form-control"
                          style={errors.pTimeSecEnd ? { borderColor:'#ef4444', backgroundColor:'#fef2f2', color:'#ef4444' } : {}}
                          placeholder="End" />
                      </div>
                      {(errors.pTimeSecStart || errors.pTimeSecEnd) && <div style={{color:'#ef4444',fontSize:'10px',marginTop:'2px',fontWeight:'600'}}>Value out of range!</div>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Corrective Addition (Kgs)</div>
                  <div className="form-row form-row-4">
                    <div className="form-group">
                      <label className="form-label">C <span style={{color: errors.correctiveC ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds && renderThreshold(thresholds.corrMinC, thresholds.corrMaxC)}</span></label>
                      <input type="number" step="0.1" name="correctiveC" value={formData.correctiveC} onChange={handleChange} className="form-control" style={errors.correctiveC ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Si <span style={{color: errors.correctiveSi ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds && renderThreshold(thresholds.corrMinSi, thresholds.corrMaxSi)}</span></label>
                      <input type="number" step="0.1" name="correctiveSi" value={formData.correctiveSi} onChange={handleChange} className="form-control" style={errors.correctiveSi ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mn <span style={{color: errors.correctiveMn ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds && renderThreshold(thresholds.corrMinMn, thresholds.corrMaxMn)}</span></label>
                      <input type="number" step="0.1" name="correctiveMn" value={formData.correctiveMn} onChange={handleChange} className="form-control" style={errors.correctiveMn ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">S <span style={{color: errors.correctiveS ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds && renderThreshold(thresholds.corrMinS, thresholds.corrMaxS)}</span></label>
                      <input type="number" step="0.1" name="correctiveS" value={formData.correctiveS} onChange={handleChange} className="form-control" style={errors.correctiveS ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} />
                    </div>
                  </div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label">Cr <span style={{color: errors.correctiveCr ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds && renderThreshold(thresholds.corrMinCr, thresholds.corrMaxCr)}</span></label>
                      <input type="number" step="0.1" name="correctiveCr" value={formData.correctiveCr} onChange={handleChange} className="form-control" style={errors.correctiveCr ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cu <span style={{color: errors.correctiveCu ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds && renderThreshold(thresholds.corrMinCu, thresholds.corrMaxCu)}</span></label>
                      <input type="number" step="0.1" name="correctiveCu" value={formData.correctiveCu} onChange={handleChange} className="form-control" style={errors.correctiveCu ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sn <span style={{color: errors.correctiveSn ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds && renderThreshold(thresholds.corrMinSn, thresholds.corrMaxSn)}</span></label>
                      <input type="number" step="0.1" name="correctiveSn" value={formData.correctiveSn} onChange={handleChange} className="form-control" style={errors.correctiveSn ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} />
                    </div>
                  </div>
                </div>

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
                    <button type="button" className="btn btn-secondary" onClick={() => { setFormData(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: '' }), {}) })); setThresholds(null); setErrors({}); }}>Clear</button>
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
          <h2 className="card-title">Heat Records</h2>
          <span className="badge badge-secondary">{records.length} records</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th rowSpan="2" style={{ minWidth: '150px' }}>PART NAME / DATE / HEAT CODE</th>
                  <th rowSpan="2">Qty of Moulds</th>
                  <th colSpan="10" className="text-center">Metal Composition (%)</th>
                  <th colSpan="2" className="text-center">Time of Pouring</th>
                  <th rowSpan="2">Pouring Temp °C</th>
                  <th rowSpan="2">pp Code</th>
                  <th rowSpan="2">Treatment No</th>
                  <th rowSpan="2">F/C No / Heat No</th>
                  <th rowSpan="2">Con No</th>
                  <th rowSpan="2">Tapping Time</th>
                  <th colSpan="7" className="text-center">Corrective Addition (Kgs)</th>
                  <th rowSpan="2">Tapping Wt. (kgs)</th>
                  <th rowSpan="2">Mg (Kgs)</th>
                  <th rowSpan="2">Res.Mg Convertor %</th>
                  <th rowSpan="2">Rec. Of Mg %</th>
                  <th colSpan="2" className="text-center">Stream Inoculant</th>

                  <th rowSpan="2" style={{ minWidth: '150px' }}>Remarks</th>
                  <th rowSpan="2">Status</th>
                  <th rowSpan="2" style={{ minWidth: '150px' }}>Approval Info</th>
                  {isStaff && <th rowSpan="2">Actions</th>}
                </tr>
                <tr>
                  {/* Metal Comp */}
                  <th style={{ fontSize: '10px' }}>C</th><th style={{ fontSize: '10px' }}>Si</th><th style={{ fontSize: '10px' }}>Mn</th>
                  <th style={{ fontSize: '10px' }}>P</th><th style={{ fontSize: '10px' }}>S</th>
                  <th style={{ fontSize: '10px' }}>Mg First</th><th style={{ fontSize: '10px' }}>Mg Last</th>
                  <th style={{ fontSize: '10px' }}>Cu</th><th style={{ fontSize: '10px' }}>Cr</th><th style={{ fontSize: '10px' }}>Sn</th>
                  <th style={{ fontSize: '10px' }}>Start</th><th style={{ fontSize: '10px' }}>End</th>
                  {/* Corrective */}
                  <th style={{ fontSize: '10px' }}>C</th><th style={{ fontSize: '10px' }}>Si</th><th style={{ fontSize: '10px' }}>Mn</th>
                  <th style={{ fontSize: '10px' }}>S</th><th style={{ fontSize: '10px' }}>Cr</th><th style={{ fontSize: '10px' }}>Cu</th><th style={{ fontSize: '10px' }}>Sn</th>
                  {/* Stream */}
                  <th style={{ fontSize: '10px' }}>gms/Sec</th><th style={{ fontSize: '10px' }}>P.Time (sec)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="8"><Skeleton width="100%" height="40px" /></td>
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>No records found</td>
                  </tr>
                ) : records.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{dash(r.partName)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{r.date?.split('T')[0]}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '500' }}>{dash(r.heatCode)}</div>
                    </td>
                    <td className="text-center">{dash(r.qtyMoulds)}</td>
                    
                    {/* Metal Composition */}
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionC)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionSi)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionMn)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionP)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionS)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionMgFirst)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionMgLast)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionCu)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionCr)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionSn)}</td>

                    <td>{dash(r.timeOfPouringStart)}</td>
                    <td>{dash(r.timeOfPouringEnd)}</td>
                    <td>{r.pouringTempStart || r.pouringTempEnd ? `${dash(r.pouringTempStart)} - ${dash(r.pouringTempEnd)}` : dash(r.pouringTemp)}</td>
                    <td>{dash(r.ppCode)}</td>
                    <td>{dash(r.treatmentNo)}</td>
                    <td>{dash(r.fcNoHeatNo)}</td>
                    <td>{dash(r.conNo)}</td>
                    <td>{dash(r.tappingTime)}</td>

                    {/* Corrective Addition */}
                    <td style={{ fontSize: '12px' }}>{dash(r.correctiveC)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.correctiveSi)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.correctiveMn)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.correctiveS)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.correctiveCr)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.correctiveCu)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.correctiveSn)}</td>

                    <td>{dash(r.tappingWtKgs)}</td>
                    <td>{dash(r.mgKgs)}</td>
                    <td>{dash(r.resMgConvertorPercent)}</td>
                    <td>{dash(r.recMgPercent)}</td>
                    
                    {/* Stream Inoculant */}
                    <td>{dash(r.streamInnoculant)}</td>
                    <td>{r.pTimeSecStart || r.pTimeSecEnd ? `${dash(r.pTimeSecStart)} - ${dash(r.pTimeSecEnd)}` : dash(r.pTimeSec)}</td>



                    <td style={{ fontSize: '11px', maxWidth: '200px', whiteSpace: 'normal' }}>
                      {dash(r.remarks)}
                    </td>
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
                         <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                         {((user?.role?.toUpperCase()?.includes('HOF') && (r.status || 'QC_ENTRY') === 'QC_ENTRY') ||
                           user?.role?.toUpperCase()?.includes('ADMIN') || user?.role?.toUpperCase()?.includes('HOD')) && (
                           <button className="btn btn-primary btn-sm" onClick={() => openEdit(r)} style={{ padding: '0.2rem 0.6rem', fontSize: '12px', background: 'var(--color-primary)', border: 'none' }}>
                             Edit
                           </button>
                         )}

                         {user?.role?.toUpperCase()?.includes('HOF') && (r.status || 'QC_ENTRY') === 'QC_ENTRY' && (
                           <button className="btn btn-primary btn-sm" onClick={() => handleApprove(r, 'HOF_APPROVED', tableRemarks[r.id])} style={{ padding: '0.2rem 0.6rem', fontSize: '12px', background: '#059669', border: 'none' }}>
                             Approve HOF
                           </button>
                         )}

                         {(user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN')) && (r.status || 'QC_ENTRY') === 'HOF_APPROVED' && (
                           <button className="btn btn-primary btn-sm" onClick={() => handleApprove(r, 'HOD_APPROVED', tableRemarks[r.id])} style={{ padding: '0.2rem 0.6rem', fontSize: '12px', background: '#2563eb', border: 'none' }}>
                             Approve HOD
                           </button>
                         )}

                          </div>
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
        isOpen={showSaveConfirm} 
        onConfirm={handleConfirmSave} 
        onClose={() => setShowSaveConfirm(false)} 
        message="Are you sure you want to save this record?" 
      />
    </>
  );
};

export default QcRegister;
