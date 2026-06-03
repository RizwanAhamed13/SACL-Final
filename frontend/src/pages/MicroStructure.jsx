import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { PartNameSelect } from '../components/PartNameSelect';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';

const locKey = (loc) => loc.replace(/[^a-zA-Z0-9]/g, '_');

const MICRO_SINGLE_FIELDS = [
  { name: 'nodularityPercent', label: 'Nodularity/Graphite Type %', type: 'number', thMin: 'microMinNodularity', thMax: 'microMaxNodularity', placeholder: 'e.g. 90' },
  { name: 'graphiteType', label: 'Graphite Type', type: 'text', placeholder: 'e.g. VI' },
  { name: 'countNosPerMm2', label: 'Count (Nos/mm²)', type: 'number', thMin: 'microMinCount', thMax: 'microMaxCount', placeholder: 'e.g. 200' },
];

const MICRO_RANGE_FIELDS = [
  { nameMin: 'ferritePercentMin', nameMax: 'ferritePercentMax', label: 'Ferrite %', thMin: 'microMinFerrite', thMax: 'microMaxFerrite' },
  { nameMin: 'pearlitePercentMin', nameMax: 'pearlitePercentMax', label: 'Pearlite %', thMin: 'microMinPearlite', thMax: 'microMaxPearlite' },
  { nameMin: 'carbidePercentMin', nameMax: 'carbidePercentMax', label: 'Carbide %', thMin: 'microMinCarbide', thMax: 'microMaxCarbide' },
  { nameMin: 'sizeMin', nameMax: 'sizeMax', label: 'Nodule Size', thMin: 'microSizeMin', thMax: 'microSizeMax' },
];

// Keep MICRO_FIELDS for backward compat references
const MICRO_FIELDS = [
  ...MICRO_SINGLE_FIELDS,
  { name: 'size', label: 'Nodule Size', type: 'text', placeholder: 'e.g. 6' },
  { name: 'ferritePercent', label: 'Ferrite %', type: 'number', thMin: 'microMinFerrite', thMax: 'microMaxFerrite', placeholder: 'e.g. 5' },
  { name: 'pearlitePercent', label: 'Pearlite %', type: 'number', thMin: 'microMinPearlite', thMax: 'microMaxPearlite', placeholder: 'e.g. 95' },
  { name: 'carbidePercent', label: 'Carbide %', type: 'number', thMin: 'microMinCarbide', thMax: 'microMaxCarbide', placeholder: 'e.g. 0.5' },
];

const MicroStructure = () => {
  const { user } = useAuth();
  const isStaff = user?.role?.toUpperCase()?.includes('HOF') || user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN');

  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    inspectionDate: new Date().toISOString().split('T')[0], partName: '', disa: '', dateCode: '',
    microLocation: '',
    nodularityPercent: '', graphiteType: '', countNosPerMm2: '', size: '',
    ferritePercent: '', pearlitePercent: '', carbidePercent: '',
    ferritePercentMin: '', ferritePercentMax: '', pearlitePercentMin: '', pearlitePercentMax: '',
    carbidePercentMin: '', carbidePercentMax: '', sizeMin: '', sizeMax: '',
    remarks: '',
    status: 'QC_ENTRY', hofApprovedBy: '', hodApprovedBy: '', createdBy: ''
  });

  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, record: null });
  const [thresholds, setThresholds] = useState(null);
  const [errors, setErrors] = useState({});

  const activeLocations = !formData.id && thresholds?.microLocations
    ? thresholds.microLocations.split(',').filter(Boolean)
    : [];

  const fetchRecords = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await axios.get('/api/micro-structure');
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

  const validateAll = (data, ts, locs) => {
    const newErrors = {};
    if (!ts) return;
    const singleFields = [
      { key: 'nodularityPercent', min: ts.microMinNodularity, max: ts.microMaxNodularity },
      { key: 'countNosPerMm2', min: ts.microMinCount, max: ts.microMaxCount },
    ];
    if (!data.id && locs && locs.length > 0) {
      locs.forEach(loc => {
        const lk = locKey(loc);
        singleFields.forEach(({ key, min, max }) => {
          if (isOutOfRange(data[`${lk}_${key}`], min, max)) newErrors[`${lk}_${key}`] = true;
        });
        MICRO_RANGE_FIELDS.forEach(f => {
          if (isOutOfRange(data[`${lk}_${f.nameMin}`], ts[f.thMin], ts[f.thMax])) newErrors[`${lk}_${f.nameMin}`] = true;
          if (isOutOfRange(data[`${lk}_${f.nameMax}`], ts[f.thMin], ts[f.thMax])) newErrors[`${lk}_${f.nameMax}`] = true;
        });
      });
    } else {
      singleFields.forEach(({ key, min, max }) => {
        if (isOutOfRange(data[key], min, max)) newErrors[key] = true;
      });
      if (isOutOfRange(data.ferritePercentMin, ts.microMinFerrite, ts.microMaxFerrite)) newErrors.ferritePercentMin = true;
      if (isOutOfRange(data.ferritePercentMax, ts.microMinFerrite, ts.microMaxFerrite)) newErrors.ferritePercentMax = true;
      if (isOutOfRange(data.pearlitePercentMin, ts.microMinPearlite, ts.microMaxPearlite)) newErrors.pearlitePercentMin = true;
      if (isOutOfRange(data.pearlitePercentMax, ts.microMinPearlite, ts.microMaxPearlite)) newErrors.pearlitePercentMax = true;
      if (isOutOfRange(data.carbidePercentMin, ts.microMinCarbide, ts.microMaxCarbide)) newErrors.carbidePercentMin = true;
      if (isOutOfRange(data.carbidePercentMax, ts.microMinCarbide, ts.microMaxCarbide)) newErrors.carbidePercentMax = true;
      if (isOutOfRange(data.sizeMin, ts.microSizeMin, ts.microSizeMax)) newErrors.sizeMin = true;
      if (isOutOfRange(data.sizeMax, ts.microSizeMin, ts.microSizeMax)) newErrors.sizeMax = true;
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
        const locs = res.data.microLocations ? res.data.microLocations.split(',').filter(Boolean) : [];
        validateAll(currentData, res.data, locs);
      }
    } catch (err) {
      console.error("Failed to fetch thresholds", err);
    }
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
    if (thresholds) validateAll(nextData, thresholds, activeLocations);
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
      } else if (activeLocations.length > 0) {
        const base = {
          inspectionDate: formData.inspectionDate,
          partName: formData.partName,
          dateCode: formData.dateCode,
          remarks: formData.remarks,
          createdBy: user.fullName || user.username,
        };
        await Promise.all(activeLocations.map(loc => {
          const lk = locKey(loc);
          return axios.post('/api/micro-structure', {
            ...base,
            microLocation: loc,
            nodularityPercent: formData[`${lk}_nodularityPercent`] || null,
            graphiteType: formData[`${lk}_graphiteType`] || null,
            countNosPerMm2: formData[`${lk}_countNosPerMm2`] || null,
            size: formData[`${lk}_size`] || null,
            ferritePercent: formData[`${lk}_ferritePercent`] || null,
            pearlitePercent: formData[`${lk}_pearlitePercent`] || null,
            carbidePercent: formData[`${lk}_carbidePercent`] || null,
            ferritePercentMin: formData[`${lk}_ferritePercentMin`] || null,
            ferritePercentMax: formData[`${lk}_ferritePercentMax`] || null,
            pearlitePercentMin: formData[`${lk}_pearlitePercentMin`] || null,
            pearlitePercentMax: formData[`${lk}_pearlitePercentMax`] || null,
            carbidePercentMin: formData[`${lk}_carbidePercentMin`] || null,
            carbidePercentMax: formData[`${lk}_carbidePercentMax`] || null,
            sizeMin: formData[`${lk}_sizeMin`] || null,
            sizeMax: formData[`${lk}_sizeMax`] || null,
          });
        }));
        toast.success(`${activeLocations.length} location records saved`);
      } else {
        await axios.post('/api/micro-structure', { ...formData, createdBy: user.fullName || user.username });
        toast.success('Added successfully');
      }
      setShowForm(false);
      setFormData({
        id: null,
        inspectionDate: new Date().toISOString().split('T')[0], partName: '', disa: '', dateCode: '',
        microLocation: '',
        nodularityPercent: '', graphiteType: '', countNosPerMm2: '', size: '',
        ferritePercent: '', pearlitePercent: '', carbidePercent: '',
        ferritePercentMin: '', ferritePercentMax: '', pearlitePercentMin: '', pearlitePercentMax: '',
        carbidePercentMin: '', carbidePercentMax: '', sizeMin: '', sizeMax: '',
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
              <h2 className="card-title">{formData.id ? 'Edit Analysis Report' : 'Add Analysis Report'}</h2>
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
                      <label className="form-label">Date Code</label>
                      <input type="text" name="dateCode" value={formData.dateCode} onChange={handleChange} className="form-control" placeholder="e.g. 5D03-45" />
                    </div>
                    {formData.id && (
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input type="text" value={formData.microLocation || '—'} readOnly className="form-control" style={{ background: '#f8fafc', color: '#64748b' }} />
                      </div>
                    )}
                  </div>
                </div>

                {activeLocations.length > 0 ? (
                  <div className="form-section">
                    <div className="form-section-title">Micro Analysis — Per Location</div>
                    {activeLocations.map(loc => {
                      const lk = locKey(loc);
                      return (
                        <div key={loc} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.25rem', background: '#f8fafc' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            📍 {loc}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {MICRO_SINGLE_FIELDS.map(f => {
                              const errKey = `${lk}_${f.name}`;
                              const hasErr = errors[errKey];
                              const thHint = f.thMin && thresholds ? renderThreshold(thresholds[f.thMin], thresholds[f.thMax]) : '';
                              return (
                                <div className="form-group" key={f.name} style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: '12px' }}>
                                    {f.label}
                                    {thHint && <span style={{ color: hasErr ? '#ef4444' : 'var(--color-text-secondary)', fontWeight: 400, marginLeft: '4px' }}>{thHint}</span>}
                                  </label>
                                  <input
                                    type={f.type}
                                    name={`${lk}_${f.name}`}
                                    value={formData[`${lk}_${f.name}`] || ''}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder={f.placeholder}
                                    style={hasErr ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}}
                                  />
                                  {hasErr && <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', fontWeight: '600' }}>Value out of range!</div>}
                                </div>
                              );
                            })}
                            {MICRO_RANGE_FIELDS.map(f => {
                              const minKey = `${lk}_${f.nameMin}`;
                              const maxKey = `${lk}_${f.nameMax}`;
                              const hasErr = errors[minKey] || errors[maxKey];
                              const thHint = thresholds ? renderThreshold(thresholds[f.thMin], thresholds[f.thMax]) : '';
                              return (
                                <div className="form-group" key={f.nameMin} style={{ marginBottom: 0 }}>
                                  <label className="form-label" style={{ fontSize: '12px' }}>
                                    {f.label}
                                    {thHint && <span style={{ color: hasErr ? '#ef4444' : 'var(--color-text-secondary)', fontWeight: 400, marginLeft: '4px' }}>{thHint}</span>}
                                  </label>
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input type="number" step="0.1" name={minKey} value={formData[minKey] || ''} onChange={handleChange} className="form-control"
                                      style={errors[minKey] ? { borderColor:'#ef4444', backgroundColor:'#fef2f2', color:'#ef4444' } : {}} placeholder="Min" />
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>—</span>
                                    <input type="number" step="0.1" name={maxKey} value={formData[maxKey] || ''} onChange={handleChange} className="form-control"
                                      style={errors[maxKey] ? { borderColor:'#ef4444', backgroundColor:'#fef2f2', color:'#ef4444' } : {}} placeholder="Max" />
                                  </div>
                                  {hasErr && <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px', fontWeight: '600' }}>Value out of range!</div>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <div className="form-section">
                      <div className="form-section-title">Nodule Analysis</div>
                      <div className="form-row form-row-3">
                        <div className="form-group">
                          <label className="form-label">Nodularity/Graphite Type % <span style={{color: errors.nodularityPercent ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.microMinNodularity, thresholds.microMaxNodularity) : '(85 Min)'}</span></label>
                          <input type="number" name="nodularityPercent" value={formData.nodularityPercent} onChange={handleChange} className="form-control" style={errors.nodularityPercent ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 90" />
                          {errors.nodularityPercent && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Graphite Type</label>
                          <input type="text" name="graphiteType" value={formData.graphiteType} onChange={handleChange} className="form-control" placeholder="e.g. VI" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Count (Nos/mm²) <span style={{color: errors.countNosPerMm2 ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400}}>{thresholds ? renderThreshold(thresholds.microMinCount, thresholds.microMaxCount) : '(150 Min)'}</span></label>
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
                          <label className="form-label">Ferrite %
                            <span style={{color:(errors.ferritePercentMin||errors.ferritePercentMax)?'#ef4444':'var(--color-text-secondary)',fontWeight:400,marginLeft:'4px'}}>
                              {thresholds ? renderThreshold(thresholds.microMinFerrite, thresholds.microMaxFerrite) : '(Max 10)'}
                            </span>
                          </label>
                          <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                            <input type="number" name="ferritePercentMin" value={formData.ferritePercentMin} onChange={handleChange} className="form-control"
                              style={(errors.ferritePercentMin)?{borderColor:'#ef4444',backgroundColor:'#fef2f2',color:'#ef4444'}:{}} placeholder="Min" />
                            <span style={{color:'#94a3b8',fontWeight:600}}>—</span>
                            <input type="number" name="ferritePercentMax" value={formData.ferritePercentMax} onChange={handleChange} className="form-control"
                              style={(errors.ferritePercentMax)?{borderColor:'#ef4444',backgroundColor:'#fef2f2',color:'#ef4444'}:{}} placeholder="Max" />
                          </div>
                          {(errors.ferritePercentMin||errors.ferritePercentMax) && <div style={{color:'#ef4444',fontSize:'10px',marginTop:'2px',fontWeight:'600'}}>Value out of range!</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Pearlite %
                            <span style={{color:(errors.pearlitePercentMin||errors.pearlitePercentMax)?'#ef4444':'var(--color-text-secondary)',fontWeight:400,marginLeft:'4px'}}>
                              {thresholds ? renderThreshold(thresholds.microMinPearlite, thresholds.microMaxPearlite) : '(90 Min)'}
                            </span>
                          </label>
                          <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                            <input type="number" name="pearlitePercentMin" value={formData.pearlitePercentMin} onChange={handleChange} className="form-control"
                              style={(errors.pearlitePercentMin)?{borderColor:'#ef4444',backgroundColor:'#fef2f2',color:'#ef4444'}:{}} placeholder="Min" />
                            <span style={{color:'#94a3b8',fontWeight:600}}>—</span>
                            <input type="number" name="pearlitePercentMax" value={formData.pearlitePercentMax} onChange={handleChange} className="form-control"
                              style={(errors.pearlitePercentMax)?{borderColor:'#ef4444',backgroundColor:'#fef2f2',color:'#ef4444'}:{}} placeholder="Max" />
                          </div>
                          {(errors.pearlitePercentMin||errors.pearlitePercentMax) && <div style={{color:'#ef4444',fontSize:'10px',marginTop:'2px',fontWeight:'600'}}>Value out of range!</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Carbide %
                            <span style={{color:(errors.carbidePercentMin||errors.carbidePercentMax)?'#ef4444':'var(--color-text-secondary)',fontWeight:400,marginLeft:'4px'}}>
                              {thresholds ? renderThreshold(thresholds.microMinCarbide, thresholds.microMaxCarbide) : '(Max 1)'}
                            </span>
                          </label>
                          <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                            <input type="number" name="carbidePercentMin" value={formData.carbidePercentMin} onChange={handleChange} className="form-control"
                              style={(errors.carbidePercentMin)?{borderColor:'#ef4444',backgroundColor:'#fef2f2',color:'#ef4444'}:{}} placeholder="Min" />
                            <span style={{color:'#94a3b8',fontWeight:600}}>—</span>
                            <input type="number" name="carbidePercentMax" value={formData.carbidePercentMax} onChange={handleChange} className="form-control"
                              style={(errors.carbidePercentMax)?{borderColor:'#ef4444',backgroundColor:'#fef2f2',color:'#ef4444'}:{}} placeholder="Max" />
                          </div>
                          {(errors.carbidePercentMin||errors.carbidePercentMax) && <div style={{color:'#ef4444',fontSize:'10px',marginTop:'2px',fontWeight:'600'}}>Value out of range!</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Nodule Size
                            <span style={{color:(errors.sizeMin||errors.sizeMax)?'#ef4444':'var(--color-text-secondary)',fontWeight:400,marginLeft:'4px'}}>
                              {thresholds && (thresholds.microSizeMin || thresholds.microSizeMax) ? renderThreshold(thresholds.microSizeMin, thresholds.microSizeMax) : ''}
                            </span>
                          </label>
                          <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                            <input type="number" step="0.1" name="sizeMin" value={formData.sizeMin} onChange={handleChange} className="form-control"
                              style={errors.sizeMin?{borderColor:'#ef4444',backgroundColor:'#fef2f2',color:'#ef4444'}:{}} placeholder="Min" />
                            <span style={{color:'#94a3b8',fontWeight:600}}>—</span>
                            <input type="number" step="0.1" name="sizeMax" value={formData.sizeMax} onChange={handleChange} className="form-control"
                              style={errors.sizeMax?{borderColor:'#ef4444',backgroundColor:'#fef2f2',color:'#ef4444'}:{}} placeholder="Max" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
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
                    <button type="button" className="btn btn-secondary" onClick={() => setFormData(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: '' }), {}), approvedBy: user?.fullName || user?.username || '' }))}>Clear</button>
                    <button type="submit" className="btn btn-primary" disabled={Object.keys(errors).length > 0}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {Object.keys(errors).length > 0 ? 'Fix Errors to Save' : activeLocations.length > 1 ? `Save ${activeLocations.length} Location Records` : 'Save Analysis'}
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
