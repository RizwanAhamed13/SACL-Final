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
  { name: 'nodularityPercent', label: 'Nodularity/Graphite Type %', type: 'text', thMin: 'microMinNodularity', thMax: 'microMaxNodularity', placeholder: 'e.g. 90 or 85-95' },
  { name: 'graphiteType', label: 'Graphite Type', type: 'text', placeholder: 'e.g. VI' },
];

const MICRO_RANGE_FIELDS = [
  { nameMin: 'countNosPerMm2Min', nameMax: 'countNosPerMm2Max', label: 'Count (Nos/mm²)', thMin: 'microMinCount', thMax: 'microMaxCount', step: '1' },
  { nameMin: 'ferritePercentMin', nameMax: 'ferritePercentMax', label: 'Ferrite %', thMin: 'microMinFerrite', thMax: 'microMaxFerrite' },
  { nameMin: 'pearlitePercentMin', nameMax: 'pearlitePercentMax', label: 'Pearlite %', thMin: 'microMinPearlite', thMax: 'microMaxPearlite' },
  { nameMin: 'carbidePercentMin', nameMax: 'carbidePercentMax', label: 'Carbide %', thMin: 'microMinCarbide', thMax: 'microMaxCarbide' },
  { nameMin: 'sizeMin', nameMax: 'sizeMax', label: 'Nodule Size', thMin: 'microSizeMin', thMax: 'microSizeMax' },
];

// Keep MICRO_FIELDS for backward compat references
const MICRO_FIELDS = [
  ...MICRO_SINGLE_FIELDS,
  { name: 'size', label: 'Nodule Size', type: 'text', placeholder: 'e.g. 6' },
  { name: 'ferritePercent', label: 'Ferrite %', type: 'text', thMin: 'microMinFerrite', thMax: 'microMaxFerrite', placeholder: 'e.g. 5' },
  { name: 'pearlitePercent', label: 'Pearlite %', type: 'text', thMin: 'microMinPearlite', thMax: 'microMaxPearlite', placeholder: 'e.g. 95' },
  { name: 'carbidePercent', label: 'Carbide %', type: 'text', thMin: 'microMinCarbide', thMax: 'microMaxCarbide', placeholder: 'e.g. 0.5' },
];

const MicroStructure = () => {
  const { user } = useAuth();
  const isStaff = user?.role?.toUpperCase()?.includes('HOF') || user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN');

  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    inspectionDate: new Date().toISOString().split('T')[0], partName: '', dateCode: '', disa: '',
    microLocation: '',
    nodularityPercent: '', graphiteType: '', countNosPerMm2: '', countNosPerMm2Min: '', countNosPerMm2Max: '', size: '',
    ferritePercent: '', pearlitePercent: '', carbidePercent: '',
    ferritePercentMin: '', ferritePercentMax: '', pearlitePercentMin: '', pearlitePercentMax: '',
    carbidePercentMin: '', carbidePercentMax: '', sizeMin: '', sizeMax: '',
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
  


  const getSelectableRecords = () => {
    const isHof = user?.role?.toUpperCase()?.includes('HOF');
    const isHod = user?.role?.toUpperCase()?.includes('HOD');
    const isAdmin = user?.role?.toUpperCase()?.includes('ADMIN');
    
    if (isHod || (isAdmin && records.some(r => r.status === 'HOF_APPROVED'))) {
      return records.filter(r => r.status === 'HOF_APPROVED');
    }
    if (isHof || isAdmin) {
      return records.filter(r => (r.status || 'QC_ENTRY') === 'QC_ENTRY');
    }
    return [];
  };

  const isSelectableRow = (r) => {
    const isHof = user?.role?.toUpperCase()?.includes('HOF');
    const isHod = user?.role?.toUpperCase()?.includes('HOD');
    const isAdmin = user?.role?.toUpperCase()?.includes('ADMIN');
    
    if (isHod || (isAdmin && r.status === 'HOF_APPROVED')) {
      return r.status === 'HOF_APPROVED';
    }
    if (isHof || (isAdmin && (r.status || 'QC_ENTRY') === 'QC_ENTRY')) {
      return (r.status || 'QC_ENTRY') === 'QC_ENTRY';
    }
    return false;
  };

  const toggleSelectAll = () => {
    const selectable = getSelectableRecords();
    if (selectedIds.length === selectable.length && selectable.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectable.map(r => r.id));
    }
  };

  const [approveAllModal, setApproveAllModal] = useState(false);
  const [approveAllLoading, setApproveAllLoading] = useState(false);
  const [hofPendingCount, setHofPendingCount] = useState(0);

  const activeLocations = formData.microLocation
    ? formData.microLocation.split(',').filter(Boolean)
    : (thresholds?.microLocations ? thresholds.microLocations.split(',').filter(Boolean) : []);

  const fetchRecords = async (query = '') => {
    try {
      const res = await axios.get('/api/micro-structure/search', { params: { q: query } });
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
    const delayDebounceFn = setTimeout(() => {
      fetchRecords(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const isOutOfRange = (val, min, max) => {
    if (val === undefined || val === null || val === '') return false;
    const hasMin = min !== null && min !== undefined && min !== '';
    const hasMax = max !== null && max !== undefined && max !== '';
    if (!hasMin && !hasMax) return false;

    const str = String(val).trim();
    if (str.includes('-') && !str.startsWith('-')) {
      const parts = str.split('-').map(s => s.trim()).filter(s => s !== '');
      if (parts.length === 2) {
        const low = parseFloat(parts[0]);
        const high = parseFloat(parts[1]);
        if (isNaN(low) || isNaN(high)) return false;
        if (low > high) return true;
        if (hasMin && low < parseFloat(min)) return true;
        if (hasMax && high > parseFloat(max)) return true;
        return false;
      }
    }

    const num = parseFloat(str);
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
        const locs = currentData.id && currentData.microLocation ? currentData.microLocation.split(',').filter(Boolean) : (res.data.microLocations ? res.data.microLocations.split(',').filter(Boolean) : []);
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
          const lk = locKey(loc);
          Object.keys(parsed[loc]).forEach(k => {
            flatLocData[`${lk}_${k}`] = parsed[loc][k];
          });
        });
      } catch (e) { console.error("Error parsing locationValues", e); }
    }
    
    // Ensure microLocation is populated for UI rendering
    let currentLocs = record.microLocation ? record.microLocation.split(',').filter(Boolean) : [];
    if (currentLocs.length === 0 && discoveredLocs.length > 0) currentLocs = discoveredLocs;
    if (currentLocs.length === 0) currentLocs = ['TRA'];

    setFormData({
      ...record,
      ...flatLocData,
      microLocation: currentLocs.join(','),
      inspectionDate: record.inspectionDate ? record.inspectionDate.split('T')[0] : ''
    });
    fetchThresholds(record.partName, {
      ...record,
      ...flatLocData,
      inspectionDate: record.inspectionDate ? record.inspectionDate.split('T')[0] : ''
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
      await axios.put(`/api/micro-structure/${record.id}`, payload);
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
      let payload = { ...formData };
      
      if (activeLocations.length > 0) {
        const locationValues = {};
        activeLocations.forEach(loc => {
          const lk = locKey(loc);
          locationValues[loc] = {
            nodularityPercent: formData[`${lk}_nodularityPercent`] || null,
            graphiteType: formData[`${lk}_graphiteType`] || null,
            countNosPerMm2: formData[`${lk}_countNosPerMm2`] || null,
            countNosPerMm2Min: formData[`${lk}_countNosPerMm2Min`] || null,
            countNosPerMm2Max: formData[`${lk}_countNosPerMm2Max`] || null,
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
          };
        });
        payload.microLocation = activeLocations.join(',');
        payload.locationValues = JSON.stringify(locationValues);
      } else {
        ['nodularityPercent', 'countNosPerMm2', 'countNosPerMm2Min', 'countNosPerMm2Max', 'ferritePercent', 'pearlitePercent', 'carbidePercent', 'ferritePercentMin', 'ferritePercentMax', 'pearlitePercentMin', 'pearlitePercentMax', 'carbidePercentMin', 'carbidePercentMax', 'sizeMin', 'sizeMax'].forEach(k => {
          if (payload[k] === '') payload[k] = null;
        });
      }

      if (payload.id) {
        if (user?.role?.toUpperCase()?.includes('HOD') && payload.status === 'HOF_APPROVED') {
          payload = { ...payload, status: 'HOD_APPROVED', hodApprovedBy: user.employeeId || user.fullName };
        }
        await axios.put(`/api/micro-structure/${payload.id}`, payload);
        toast.success('Updated successfully');
      } else {
        payload.createdBy = user.employeeId || user.fullName;
        await axios.post('/api/micro-structure', payload);
        toast.success('Added successfully');
      }
      setShowForm(false);
      setFormData({
        id: null,
        inspectionDate: new Date().toISOString().split('T')[0], partName: '', disa: '', dateCode: '',
        microLocation: '',
        nodularityPercent: '', graphiteType: '', countNosPerMm2: '', countNosPerMm2Min: '', countNosPerMm2Max: '', size: '',
        ferritePercent: '', pearlitePercent: '', carbidePercent: '',
        ferritePercentMin: '', ferritePercentMax: '', pearlitePercentMin: '', pearlitePercentMax: '',
        carbidePercentMin: '', carbidePercentMax: '', sizeMin: '', sizeMax: '',
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
  const rangeDash = (min, max, fallback) => {
    const hasMin = min !== null && min !== undefined && min !== '';
    const hasMax = max !== null && max !== undefined && max !== '';
    if (hasMin && hasMax) return `${min}-${max}`;
    if (hasMin) return `${min}-`;
    if (hasMax) return `-${max}`;
    return dash(fallback);
  };

  return (
    <>
      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">Micro Structure</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Micro Structure Analysis</h1>
          <p className="page-subtitle">Nodularity, nodule count, matrix composition, and carbide percentage — QF/08/FYQ-13 · Rev.01 dt 29.05.2024</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
          {(user?.role?.toUpperCase()?.includes('QC') || user?.role?.toUpperCase()?.includes('ADMIN') || user?.role?.toUpperCase()?.includes('USER')) && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Analysis
            </button>
          )}
          {(user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN') || user?.role?.toUpperCase()?.includes('HOF')) && getSelectableRecords().length > 0 && (
            <button
              className="btn btn-secondary"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setApproveAllModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Approve {selectedIds.length > 0 ? `Selected (${selectedIds.length})` : `All (${getSelectableRecords().length})`}
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
                    <div className="form-group">
                      <label className="form-label">DISA</label>
                      <select name="disa" value={formData.disa || ''} onChange={handleChange} className="form-control">
                        <option value="">Select</option>
                        <option>DISA I</option>
                        <option>DISA II</option>
                        <option>DISA III</option>
                        <option>DISA IV</option>
                      </select>
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
                                    <input type="number" step={f.step || '0.1'} name={minKey} value={formData[minKey] || ''} onChange={handleChange} className="form-control"
                                      style={errors[minKey] ? { borderColor:'#ef4444', backgroundColor:'#fef2f2', color:'#ef4444' } : {}} placeholder="Min" />
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>—</span>
                                    <input type="number" step={f.step || '0.1'} name={maxKey} value={formData[maxKey] || ''} onChange={handleChange} className="form-control"
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
                          <input type="text" name="nodularityPercent" value={formData.nodularityPercent} onChange={handleChange} className="form-control" style={errors.nodularityPercent ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="e.g. 90 or 85-95" />
                          {errors.nodularityPercent && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Graphite Type</label>
                          <input type="text" name="graphiteType" value={formData.graphiteType} onChange={handleChange} className="form-control" placeholder="e.g. VI" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Count (Nos/mm²)
                            <span style={{color: (errors.countNosPerMm2Min || errors.countNosPerMm2Max) ? '#ef4444' : 'var(--color-text-secondary)', fontWeight:400, marginLeft:'4px'}}>
                              {thresholds ? renderThreshold(thresholds.microMinCount, thresholds.microMaxCount) : '(150 Min)'}
                            </span>
                          </label>
                          <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                            <input type="number" step="1" name="countNosPerMm2Min" value={formData.countNosPerMm2Min} onChange={handleChange} className="form-control"
                              style={errors.countNosPerMm2Min ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="Min" />
                            <span style={{color:'#94a3b8',fontWeight:600}}>—</span>
                            <input type="number" step="1" name="countNosPerMm2Max" value={formData.countNosPerMm2Max} onChange={handleChange} className="form-control"
                              style={errors.countNosPerMm2Max ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#ef4444' } : {}} placeholder="Max" />
                          </div>
                          {(errors.countNosPerMm2Min || errors.countNosPerMm2Max) && <div style={{color:'#ef4444', fontSize:'10px', marginTop:'2px', fontWeight:'600'}}>Value out of range!</div>}
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
                    <div className="form-section">
                      <div className="form-section-title">Matrix</div>
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
                      </div>
                    </div>
                  </>
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
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th rowSpan="2" style={{ width: '40px', textAlign: 'center' }}>
                    {getSelectableRecords().length > 0 && (
                      <input 
                        type="checkbox" 
                        onChange={toggleSelectAll} 
                        checked={selectedIds.length === getSelectableRecords().length && getSelectableRecords().length > 0}
                      />
                    )}
                  </th>
                   <th rowSpan="2" style={{ whiteSpace: 'nowrap' }}>Inspection Date</th>
                   <th rowSpan="2">Part Name</th>
                   <th rowSpan="2">Date/Heat Code</th>
                   <th rowSpan="2">DISA</th>
                   <th rowSpan="2">Loc</th>
                   <th rowSpan="2">Nodularity (%)</th>
                   <th rowSpan="2">Graphite Type</th>
                   <th rowSpan="2">Count / mm²</th>
                   <th rowSpan="2">Size</th>
                   <th colSpan="3" style={{ textAlign: 'center' }}>Matrix (%)</th>
                   <th rowSpan="2">Remarks</th>
                   <th rowSpan="2">Status</th>
                   <th rowSpan="2">Approval Info</th>
                   {isStaff && <th rowSpan="2">Actions</th>}
                 </tr>
                 <tr>
                   <th style={{ fontSize: '10px' }}>Ferrite</th>
                   <th style={{ fontSize: '10px' }}>Pearlite</th>
                   <th style={{ fontSize: '10px' }}>Carbide</th>
                 </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="14"><Skeleton width="100%" height="40px" /></td>
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="14" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>No records found</td>
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
                      nodularityPercent: r.nodularityPercent,
                      graphiteType: r.graphiteType,
                      countNosPerMm2: r.countNosPerMm2,
                      countNosPerMm2Min: r.countNosPerMm2Min,
                      countNosPerMm2Max: r.countNosPerMm2Max,
                      size: r.size,
                      ferritePercent: r.ferritePercent,
                      pearlitePercent: r.pearlitePercent,
                      carbidePercent: r.carbidePercent,
                      ferritePercentMin: r.ferritePercentMin,
                      ferritePercentMax: r.ferritePercentMax,
                      pearlitePercentMin: r.pearlitePercentMin,
                      pearlitePercentMax: r.pearlitePercentMax,
                      carbidePercentMin: r.carbidePercentMin,
                      carbidePercentMax: r.carbidePercentMax,
                      sizeMin: r.sizeMin,
                      sizeMax: r.sizeMax,
                    }]];
                  }

                  const rowCount = locations.length;
                  return (
                    <React.Fragment key={r.id}>
                      {locations.map(([loc, vals], idx) => (
                        <tr key={`${r.id}-${loc}`}>
                    <td style={{ textAlign: 'center' }}>
                      {isSelectableRow(r) && (
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(r.id)} 
                          onChange={() => toggleSelection(r.id)} 
                        />
                      )}
                    </td>
                          {idx === 0 && (
                            <>
                              <td rowSpan={rowCount}>{r.inspectionDate?.split('T')[0] || '—'}</td>
                              <td rowSpan={rowCount}><strong>{dash(r.partName)}</strong></td>
                              <td rowSpan={rowCount}>{dash(r.dateCode)}</td>
                              <td rowSpan={rowCount} style={{ fontSize: '12px' }}>{dash(r.disa)}</td>
                            </>
                          )}
                          <td style={{ fontWeight: 600, color: '#4b5563', fontSize: '12px' }}>{loc}</td>
                          <td style={{ fontSize: '12px' }}>{dash(vals.nodularityPercent)}</td>
                          <td style={{ fontSize: '12px' }}>{dash(vals.graphiteType)}</td>
                          <td style={{ fontSize: '12px' }}>{rangeDash(vals.countNosPerMm2Min, vals.countNosPerMm2Max, vals.countNosPerMm2)}</td>
                          <td style={{ fontSize: '12px' }}>
                            {vals.sizeMin && vals.sizeMax ? `${vals.sizeMin}-${vals.sizeMax}` : dash(vals.size)}
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {vals.ferritePercentMin && vals.ferritePercentMax ? `${vals.ferritePercentMin}-${vals.ferritePercentMax}` : dash(vals.ferritePercent)}
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {vals.pearlitePercentMin && vals.pearlitePercentMax ? `${vals.pearlitePercentMin}-${vals.pearlitePercentMax}` : dash(vals.pearlitePercent)}
                          </td>
                          <td style={{ fontSize: '12px' }}>
                            {vals.carbidePercentMin && vals.carbidePercentMax ? `${vals.carbidePercentMin}-${vals.carbidePercentMax}` : dash(vals.carbidePercent)}
                          </td>
                          
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
                                {(user?.role?.toUpperCase()?.includes('ADMIN') || user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('HOF') || r.createdBy === user?.username || r.createdBy === user?.employeeId || r.createdBy === user?.fullName) && (
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
            const selectable = getSelectableRecords();
            const isHofApproval = selectable.some(r => (r.status || 'QC_ENTRY') === 'QC_ENTRY');
            const idsToApprove = selectedIds.length > 0 ? selectedIds : selectable.map(r => r.id);
            
            if (isHofApproval) {
              const promises = idsToApprove.map(id => {
                const record = records.find(r => r.id === id);
                const payload = {
                  ...record,
                  status: 'HOF_APPROVED',
                  remarks: tableRemarks[id] || record.remarks,
                  hofApprovedBy: user.employeeId || user.fullName
                };
                return axios.put(`/api/micro-structure/${id}`, payload);
              });
              await Promise.all(promises);
              toast.success(`${idsToApprove.length} Micro Structure records approved by HOF!`);
            } else {
              const res = selectedIds.length > 0 
                ? await axios.post('/api/micro-structure/approve-bulk', selectedIds) 
                : await axios.post('/api/micro-structure/approve-all');
              toast.success(`${res.data.approved ?? idsToApprove.length} Micro Structure records approved by HOD!`);
            }
            fetchRecords();
            setSelectedIds([]);
          } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve records');
          } finally {
            setApproveAllLoading(false);
          }
        }}
        title={selectedIds.length > 0 ? "Approve Selected Records" : "Bulk Approval"}
        message={`${selectedIds.length > 0 ? `Approve ${selectedIds.length} selected` : `Approve all ${getSelectableRecords().length}`} pending records in one shot?`}
        confirmText={approveAllLoading ? 'Approving...' : 'Approve'}
      />
    </>
  );
};

export default MicroStructure;
