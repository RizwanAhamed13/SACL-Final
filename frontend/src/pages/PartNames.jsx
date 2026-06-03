import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

const emptyForm = {
  name: '', description: '', active: 'true',
  qcMinC: '', qcMaxC: '', qcMinSi: '', qcMaxSi: '', qcMinMn: '', qcMaxMn: '', qcMinP: '', qcMaxP: '', qcMinS: '', qcMaxS: '', qcMinMg: '', qcMaxMg: '', qcMinCu: '', qcMaxCu: '', qcMinCr: '', qcMaxCr: '', qcMinSn: '', qcMaxSn: '',
  microMinNodularity: '', microMaxNodularity: '', microMinCount: '', microMaxCount: '', microSize: '', microMinFerrite: '', microMaxFerrite: '', microMinPearlite: '', microMaxPearlite: '', microMinCarbide: '', microMaxCarbide: '',
  microLocations: '',
  tensileMinStrength: '', tensileMaxStrength: '', tensileMinYield: '', tensileMaxYield: '',
  tensileMinYield05: '', tensileMaxYield05: '',
  tensileMinElongation: '', tensileMaxElongation: '',
  impactMinSpec: '', impactMaxSpec: '',
  mechLocations: '',
  impactNotchTypes: '',
  impactMinTRAUnotch: '', impactMaxTRAUnotch: '',
  impactMinTRAVnotch: '', impactMaxTRAVnotch: '',
  impactMinTRAUnnotch: '', impactMaxTRAUnnotch: '',
  impactMinSBAUnotch: '', impactMaxSBAUnotch: '',
  impactMinSBAVnotch: '', impactMaxSBAVnotch: '',
  impactMinSBAUnnotch: '', impactMaxSBAUnnotch: '',
  ppMinPouringTemp: '', ppMaxPouringTemp: '', ppMinMgKgs: '', ppMaxMgKgs: '', ppMinStreamInnoculant: '', ppMaxStreamInnoculant: '', ppMinPTimeSec: '', ppMaxPTimeSec: '',
  ppMinResMgConvertor: '', ppMaxResMgConvertor: '', barDiaMin: '', barDiaMax: '', microSizeMin: '', microSizeMax: '',
  corrMinC: '', corrMaxC: '', corrMinSi: '', corrMaxSi: '', corrMinMn: '', corrMaxMn: '', corrMinS: '', corrMaxS: '', corrMinCr: '', corrMaxCr: '', corrMinCu: '', corrMaxCu: '', corrMinSn: '', corrMaxSn: ''
};

const PartNames = () => {
  const { user } = useAuth();
  const isAdminOrHod = user?.role?.includes('ADMIN') || user?.role?.includes('HOD');

  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
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
    setFormData({ ...emptyForm });
    setShowForm(true);
  };

  const openEditForm = (part) => {
    setEditingId(part.id);
    setFormData({
      name: part.name,
      description: part.description || '',
      active: part.active ? 'true' : 'false',
      qcMinC: part.qcMinC ?? '', qcMaxC: part.qcMaxC ?? '', qcMinSi: part.qcMinSi ?? '', qcMaxSi: part.qcMaxSi ?? '', qcMinMn: part.qcMinMn ?? '', qcMaxMn: part.qcMaxMn ?? '', qcMinP: part.qcMinP ?? '', qcMaxP: part.qcMaxP ?? '', qcMinS: part.qcMinS ?? '', qcMaxS: part.qcMaxS ?? '', qcMinMg: part.qcMinMg ?? '', qcMaxMg: part.qcMaxMg ?? '', qcMinCu: part.qcMinCu ?? '', qcMaxCu: part.qcMaxCu ?? '', qcMinCr: part.qcMinCr ?? '', qcMaxCr: part.qcMaxCr ?? '', qcMinSn: part.qcMinSn ?? '', qcMaxSn: part.qcMaxSn ?? '',
      microMinNodularity: part.microMinNodularity ?? '', microMaxNodularity: part.microMaxNodularity ?? '', microMinCount: part.microMinCount ?? '', microMaxCount: part.microMaxCount ?? '', microSize: part.microSize ?? '', microMinFerrite: part.microMinFerrite ?? '', microMaxFerrite: part.microMaxFerrite ?? '', microMinPearlite: part.microMinPearlite ?? '', microMaxPearlite: part.microMaxPearlite ?? '', microMinCarbide: part.microMinCarbide ?? '', microMaxCarbide: part.microMaxCarbide ?? '',
      microLocations: part.microLocations ?? '',
      tensileMinStrength: part.tensileMinStrength ?? '', tensileMaxStrength: part.tensileMaxStrength ?? '', tensileMinYield: part.tensileMinYield ?? '', tensileMaxYield: part.tensileMaxYield ?? '',
      tensileMinYield05: part.tensileMinYield05 ?? '', tensileMaxYield05: part.tensileMaxYield05 ?? '',
      tensileMinElongation: part.tensileMinElongation ?? '', tensileMaxElongation: part.tensileMaxElongation ?? '',
      impactMinSpec: part.impactMinSpec ?? '', impactMaxSpec: part.impactMaxSpec ?? '',
      mechLocations: part.mechLocations ?? '',
      impactNotchTypes: part.impactNotchTypes ?? '',
      impactMinTRAUnotch: part.impactMinTRAUnotch ?? '', impactMaxTRAUnotch: part.impactMaxTRAUnotch ?? '',
      impactMinTRAVnotch: part.impactMinTRAVnotch ?? '', impactMaxTRAVnotch: part.impactMaxTRAVnotch ?? '',
      impactMinTRAUnnotch: part.impactMinTRAUnnotch ?? '', impactMaxTRAUnnotch: part.impactMaxTRAUnnotch ?? '',
      impactMinSBAUnotch: part.impactMinSBAUnotch ?? '', impactMaxSBAUnotch: part.impactMaxSBAUnotch ?? '',
      impactMinSBAVnotch: part.impactMinSBAVnotch ?? '', impactMaxSBAVnotch: part.impactMaxSBAVnotch ?? '',
      impactMinSBAUnnotch: part.impactMinSBAUnnotch ?? '', impactMaxSBAUnnotch: part.impactMaxSBAUnnotch ?? '',
      ppMinPouringTemp: part.ppMinPouringTemp ?? '', ppMaxPouringTemp: part.ppMaxPouringTemp ?? '', ppMinMgKgs: part.ppMinMgKgs ?? '', ppMaxMgKgs: part.ppMaxMgKgs ?? '', ppMinStreamInnoculant: part.ppMinStreamInnoculant ?? '', ppMaxStreamInnoculant: part.ppMaxStreamInnoculant ?? '', ppMinPTimeSec: part.ppMinPTimeSec ?? '', ppMaxPTimeSec: part.ppMaxPTimeSec ?? '',
      ppMinResMgConvertor: part.ppMinResMgConvertor ?? '', ppMaxResMgConvertor: part.ppMaxResMgConvertor ?? '', barDiaMin: part.barDiaMin ?? '', barDiaMax: part.barDiaMax ?? '', microSizeMin: part.microSizeMin ?? '', microSizeMax: part.microSizeMax ?? '',
      corrMinC: part.corrMinC ?? '', corrMaxC: part.corrMaxC ?? '', corrMinSi: part.corrMinSi ?? '', corrMaxSi: part.corrMaxSi ?? '', corrMinMn: part.corrMinMn ?? '', corrMaxMn: part.corrMaxMn ?? '', corrMinS: part.corrMinS ?? '', corrMaxS: part.corrMaxS ?? '', corrMinCr: part.corrMinCr ?? '', corrMaxCr: part.corrMaxCr ?? '', corrMinCu: part.corrMinCu ?? '', corrMaxCu: part.corrMaxCu ?? '', corrMinSn: part.corrMinSn ?? '', corrMaxSn: part.corrMaxSn ?? ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Part Name is required");

    const n = (v) => v === '' ? null : v;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      qcMinC: n(formData.qcMinC), qcMaxC: n(formData.qcMaxC), qcMinSi: n(formData.qcMinSi), qcMaxSi: n(formData.qcMaxSi), qcMinMn: n(formData.qcMinMn), qcMaxMn: n(formData.qcMaxMn), qcMinP: n(formData.qcMinP), qcMaxP: n(formData.qcMaxP), qcMinS: n(formData.qcMinS), qcMaxS: n(formData.qcMaxS), qcMinMg: n(formData.qcMinMg), qcMaxMg: n(formData.qcMaxMg), qcMinCu: n(formData.qcMinCu), qcMaxCu: n(formData.qcMaxCu), qcMinCr: n(formData.qcMinCr), qcMaxCr: n(formData.qcMaxCr), qcMinSn: n(formData.qcMinSn), qcMaxSn: n(formData.qcMaxSn),
      microMinNodularity: n(formData.microMinNodularity), microMaxNodularity: n(formData.microMaxNodularity), microMinCount: n(formData.microMinCount), microMaxCount: n(formData.microMaxCount), microSize: formData.microSize || null, microMinFerrite: n(formData.microMinFerrite), microMaxFerrite: n(formData.microMaxFerrite), microMinPearlite: n(formData.microMinPearlite), microMaxPearlite: n(formData.microMaxPearlite), microMinCarbide: n(formData.microMinCarbide), microMaxCarbide: n(formData.microMaxCarbide),
      microLocations: formData.microLocations || null,
      tensileMinStrength: n(formData.tensileMinStrength), tensileMaxStrength: n(formData.tensileMaxStrength), tensileMinYield: n(formData.tensileMinYield), tensileMaxYield: n(formData.tensileMaxYield),
      tensileMinYield05: n(formData.tensileMinYield05), tensileMaxYield05: n(formData.tensileMaxYield05),
      tensileMinElongation: n(formData.tensileMinElongation), tensileMaxElongation: n(formData.tensileMaxElongation),
      impactMinSpec: n(formData.impactMinSpec), impactMaxSpec: n(formData.impactMaxSpec),
      mechLocations: formData.mechLocations || null,
      impactNotchTypes: formData.impactNotchTypes || null,
      impactMinTRAUnotch: n(formData.impactMinTRAUnotch), impactMaxTRAUnotch: n(formData.impactMaxTRAUnotch),
      impactMinTRAVnotch: n(formData.impactMinTRAVnotch), impactMaxTRAVnotch: n(formData.impactMaxTRAVnotch),
      impactMinTRAUnnotch: n(formData.impactMinTRAUnnotch), impactMaxTRAUnnotch: n(formData.impactMaxTRAUnnotch),
      impactMinSBAUnotch: n(formData.impactMinSBAUnotch), impactMaxSBAUnotch: n(formData.impactMaxSBAUnotch),
      impactMinSBAVnotch: n(formData.impactMinSBAVnotch), impactMaxSBAVnotch: n(formData.impactMaxSBAVnotch),
      impactMinSBAUnnotch: n(formData.impactMinSBAUnnotch), impactMaxSBAUnnotch: n(formData.impactMaxSBAUnnotch),
      ppMinPouringTemp: n(formData.ppMinPouringTemp), ppMaxPouringTemp: n(formData.ppMaxPouringTemp), ppMinMgKgs: n(formData.ppMinMgKgs), ppMaxMgKgs: n(formData.ppMaxMgKgs), ppMinStreamInnoculant: n(formData.ppMinStreamInnoculant), ppMaxStreamInnoculant: n(formData.ppMaxStreamInnoculant), ppMinPTimeSec: n(formData.ppMinPTimeSec), ppMaxPTimeSec: n(formData.ppMaxPTimeSec),
      ppMinResMgConvertor: n(formData.ppMinResMgConvertor), ppMaxResMgConvertor: n(formData.ppMaxResMgConvertor), barDiaMin: n(formData.barDiaMin), barDiaMax: n(formData.barDiaMax), microSizeMin: n(formData.microSizeMin), microSizeMax: n(formData.microSizeMax),
      corrMinC: n(formData.corrMinC), corrMaxC: n(formData.corrMaxC), corrMinSi: n(formData.corrMinSi), corrMaxSi: n(formData.corrMaxSi), corrMinMn: n(formData.corrMinMn), corrMaxMn: n(formData.corrMaxMn), corrMinS: n(formData.corrMinS), corrMaxS: n(formData.corrMaxS), corrMinCr: n(formData.corrMinCr), corrMaxCr: n(formData.corrMaxCr), corrMinCu: n(formData.corrMinCu), corrMaxCu: n(formData.corrMaxCu), corrMinSn: n(formData.corrMinSn), corrMaxSn: n(formData.corrMaxSn)
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
      toast.success("Part name saved successfully");
    } catch (err) {
      console.error(err);
      toast.error('Failed to save record: ' + (err.response?.data?.message || err.message));
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
        .form-section-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0; margin-top: 1.5rem; }
        .range-row { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.55rem; }
        .range-label { min-width:180px; font-size:12px; font-weight:600; color:#374151; flex-shrink:0; }
        .range-sep { color:#94a3b8; font-size:13px; font-weight:600; flex-shrink:0; }
        .range-input { width:100px !important; min-width:0; font-size:13px !important; padding:0.3rem 0.5rem !important; height:34px !important; }
        .range-block { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:0.85rem 1rem; margin-bottom:0.5rem; }
      `}</style>

      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">Part Names</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Part Names</h1>
          <p className="page-subtitle">Manage thresholds and quality standards for parts</p>
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
          <div className="card mb-3 shadow-lg">
            <div className="card-header bg-light">
              <h2 className="card-title">{editingId ? 'Edit Part Standards' : 'Add Part Standards'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label required">Part Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="e.g. YTA KNUCKLE" required disabled={editingId !== null} />
                  </div>
                </div>

                {/* Part Micro Locations */}
                <div className="form-section-title">Part Micro Locations</div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {['TRA', 'SBA', 'LBJ', 'BORE', 'SBA.CA', 'LBJ.CA'].map(loc => {
                    const isChecked = formData.microLocations ? formData.microLocations.split(',').includes(loc) : false;
                    return (
                      <label key={loc} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                        <input type="checkbox" checked={isChecked}
                          onChange={(e) => {
                            const current = formData.microLocations ? formData.microLocations.split(',').filter(Boolean) : [];
                            const next = e.target.checked ? [...current, loc] : current.filter(x => x !== loc);
                            setFormData(prev => ({ ...prev, microLocations: next.join(',') }));
                          }} />
                        {loc}
                      </label>
                    );
                  })}
                </div>

                {/* Mechanical Test Locations */}
                <div className="form-section-title">Mechanical Test Locations</div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {['TRA', 'SBA'].map(loc => {
                    const isChecked = formData.mechLocations ? formData.mechLocations.split(',').includes(loc) : false;
                    return (
                      <label key={loc} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                        <input type="checkbox" checked={isChecked}
                          onChange={(e) => {
                            const current = formData.mechLocations ? formData.mechLocations.split(',').filter(Boolean) : [];
                            const next = e.target.checked ? [...current, loc] : current.filter(x => x !== loc);
                            setFormData(prev => ({ ...prev, mechLocations: next.join(',') }));
                          }} />
                        {loc}
                      </label>
                    );
                  })}
                </div>

                <div className="form-section-title">1. Metal Composition Thresholds (%)</div>
                <div className="range-block">
                  {[
                    { label: 'C %', min: 'qcMinC', max: 'qcMaxC', step: '0.01' },
                    { label: 'Si %', min: 'qcMinSi', max: 'qcMaxSi', step: '0.01' },
                    { label: 'Mn %', min: 'qcMinMn', max: 'qcMaxMn', step: '0.01' },
                    { label: 'P %', min: 'qcMinP', max: 'qcMaxP', step: '0.001' },
                    { label: 'S %', min: 'qcMinS', max: 'qcMaxS', step: '0.001' },
                    { label: 'Mg F/L %', min: 'qcMinMg', max: 'qcMaxMg', step: '0.001' },
                    { label: 'Cu %', min: 'qcMinCu', max: 'qcMaxCu', step: '0.01' },
                    { label: 'Cr %', min: 'qcMinCr', max: 'qcMaxCr', step: '0.01' },
                    { label: 'Sn %', min: 'qcMinSn', max: 'qcMaxSn', step: '0.001' },
                  ].map(r => (
                    <div className="range-row" key={r.min}>
                      <span className="range-label">{r.label}</span>
                      <input type="number" step={r.step} name={r.min} value={formData[r.min] || ''} onChange={handleChange} className="form-control range-input" placeholder="Min" />
                      <span className="range-sep">—</span>
                      <input type="number" step={r.step} name={r.max} value={formData[r.max] || ''} onChange={handleChange} className="form-control range-input" placeholder="Max" />
                    </div>
                  ))}
                </div>

                <div className="form-section-title">2. Micro Structure Thresholds</div>
                <div className="range-block">
                  {[
                    { label: 'Nodularity/Graphite Type %', min: 'microMinNodularity', max: 'microMaxNodularity', step: '1' },
                    { label: 'Count (Nos/mm²)', min: 'microMinCount', max: 'microMaxCount', step: '1' },
                    { label: 'Ferrite %', min: 'microMinFerrite', max: 'microMaxFerrite', step: '1' },
                    { label: 'Pearlite %', min: 'microMinPearlite', max: 'microMaxPearlite', step: '1' },
                    { label: 'Carbide %', min: 'microMinCarbide', max: 'microMaxCarbide', step: '0.1' },
                  ].map(r => (
                    <div className="range-row" key={r.min}>
                      <span className="range-label">{r.label}</span>
                      <input type="number" step={r.step} name={r.min} value={formData[r.min] || ''} onChange={handleChange} className="form-control range-input" placeholder="Min" />
                      <span className="range-sep">—</span>
                      <input type="number" step={r.step} name={r.max} value={formData[r.max] || ''} onChange={handleChange} className="form-control range-input" placeholder="Max" />
                    </div>
                  ))}
                  <div className="range-row">
                    <span className="range-label">Nodule Size</span>
                    <input type="number" step="0.1" name="microSizeMin" value={formData.microSizeMin || ''} onChange={handleChange} className="form-control range-input" placeholder="Min" />
                    <span className="range-sep">—</span>
                    <input type="number" step="0.1" name="microSizeMax" value={formData.microSizeMax || ''} onChange={handleChange} className="form-control range-input" placeholder="Max" />
                  </div>
                </div>

                <div className="form-section-title">3. Mechanical Properties</div>
                <div className="range-block">
                  {[
                    { label: 'Tensile Strength', min: 'tensileMinStrength', max: 'tensileMaxStrength', step: '1' },
                    { label: 'Yield 0.2% Strength', min: 'tensileMinYield', max: 'tensileMaxYield', step: '1' },
                    { label: 'Yield 0.5% Strength', min: 'tensileMinYield05', max: 'tensileMaxYield05', step: '1' },
                    { label: 'Elongation Percentage', min: 'tensileMinElongation', max: 'tensileMaxElongation', step: '0.1' },
                    { label: 'Impact Strength', min: 'impactMinSpec', max: 'impactMaxSpec', step: '0.1' },
                    { label: 'Bar Dia (mm)', min: 'barDiaMin', max: 'barDiaMax', step: '0.01' },
                  ].map(r => (
                    <div className="range-row" key={r.min}>
                      <span className="range-label">{r.label}</span>
                      <input type="number" step={r.step} name={r.min} value={formData[r.min] || ''} onChange={handleChange} className="form-control range-input" placeholder="Min" />
                      <span className="range-sep">—</span>
                      <input type="number" step={r.step} name={r.max} value={formData[r.max] || ''} onChange={handleChange} className="form-control range-input" placeholder="Max" />
                    </div>
                  ))}
                </div>

                {/* Impact Notch Types */}
                <div className="form-section-title">Impact Notch Types</div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {['Unnotch', 'Unotch', 'Vnotch'].map(notch => {
                    const label = notch === 'Unnotch' ? 'Un-notch' : notch === 'Unotch' ? 'U-notch' : 'V-notch';
                    const isChecked = formData.impactNotchTypes ? formData.impactNotchTypes.split(',').includes(notch) : false;
                    return (
                      <label key={notch} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                        <input type="checkbox" checked={isChecked}
                          onChange={(e) => {
                            const current = formData.impactNotchTypes ? formData.impactNotchTypes.split(',').filter(Boolean) : [];
                            const next = e.target.checked ? [...current, notch] : current.filter(x => x !== notch);
                            setFormData(prev => ({ ...prev, impactNotchTypes: next.join(',') }));
                          }} />
                        {label}
                      </label>
                    );
                  })}
                </div>

                <div className="form-section-title">4. Process Parameter Thresholds</div>
                <div className="range-block">
                  {[
                    { label: 'Pouring Temp (°C)', min: 'ppMinPouringTemp', max: 'ppMaxPouringTemp', step: '1' },
                    { label: 'Mg (Kgs)', min: 'ppMinMgKgs', max: 'ppMaxMgKgs', step: '0.01' },
                    { label: 'Stream Inoculant (gms/s)', min: 'ppMinStreamInnoculant', max: 'ppMaxStreamInnoculant', step: '0.01' },
                    { label: 'P.Time (sec)', min: 'ppMinPTimeSec', max: 'ppMaxPTimeSec', step: '0.1' },
                    { label: 'Res Mg Convertor %', min: 'ppMinResMgConvertor', max: 'ppMaxResMgConvertor', step: '0.001' },
                  ].map(r => (
                    <div className="range-row" key={r.min}>
                      <span className="range-label">{r.label}</span>
                      <input type="number" step={r.step} name={r.min} value={formData[r.min] || ''} onChange={handleChange} className="form-control range-input" placeholder="Min" />
                      <span className="range-sep">—</span>
                      <input type="number" step={r.step} name={r.max} value={formData[r.max] || ''} onChange={handleChange} className="form-control range-input" placeholder="Max" />
                    </div>
                  ))}
                </div>

                {editingId && (
                  <div className="mt-4" style={{ maxWidth: '200px' }}>
                    <label className="form-label">System Status</label>
                    <select name="active" value={formData.active} onChange={handleChange} className="form-control">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                )}

                <div className="card-footer bg-white border-top mt-4" style={{ margin: '0 -1.5rem -1.5rem', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Save Standard
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
