import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

const PartNames = () => {
  const { user } = useAuth();
  const isAdminOrHod = user?.role?.includes('ADMIN') || user?.role?.includes('HOD');

  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', active: 'true',
    qcMinC: '', qcMaxC: '', qcMinSi: '', qcMaxSi: '', qcMinMn: '', qcMaxMn: '', qcMinP: '', qcMaxP: '', qcMinS: '', qcMaxS: '', qcMinMg: '', qcMaxMg: '', qcMinCu: '', qcMaxCu: '', qcMinCr: '', qcMaxCr: '', qcMinSn: '', qcMaxSn: '',
    microMinNodularity: '', microMaxNodularity: '', microMinCount: '', microMaxCount: '', microSize: '', microMinFerrite: '', microMaxFerrite: '', microMinPearlite: '', microMaxPearlite: '', microMinCarbide: '', microMaxCarbide: '',
    tensileMinStrength: '', tensileMaxStrength: '', tensileMinYield: '', tensileMaxYield: '', tensileMinElongation: '', tensileMaxElongation: '',
    impactMinSpec: '', impactMaxSpec: '',
    corrMinC: '', corrMaxC: '', corrMinSi: '', corrMaxSi: '', corrMinMn: '', corrMaxMn: '', corrMinS: '', corrMaxS: '', corrMinCr: '', corrMaxCr: '', corrMinCu: '', corrMaxCu: '', corrMinSn: '', corrMaxSn: ''
  });
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
    setFormData({
      name: '', description: '', active: 'true',
      qcMinC: '', qcMaxC: '', qcMinSi: '', qcMaxSi: '', qcMinMn: '', qcMaxMn: '', qcMinP: '', qcMaxP: '', qcMinS: '', qcMaxS: '', qcMinMg: '', qcMaxMg: '', qcMinCu: '', qcMaxCu: '', qcMinCr: '', qcMaxCr: '', qcMinSn: '', qcMaxSn: '',
      microMinNodularity: '', microMaxNodularity: '', microMinCount: '', microMaxCount: '', microSize: '', microMinFerrite: '', microMaxFerrite: '', microMinPearlite: '', microMaxPearlite: '', microMinCarbide: '', microMaxCarbide: '',
      tensileMinStrength: '', tensileMaxStrength: '', tensileMinYield: '', tensileMaxYield: '', tensileMinElongation: '', tensileMaxElongation: '',
      impactMinSpec: '', impactMaxSpec: '',
      corrMinC: '', corrMaxC: '', corrMinSi: '', corrMaxSi: '', corrMinMn: '', corrMaxMn: '', corrMinS: '', corrMaxS: '', corrMinCr: '', corrMaxCr: '', corrMinCu: '', corrMaxCu: '', corrMinSn: '', corrMaxSn: ''
    });
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
      tensileMinStrength: part.tensileMinStrength ?? '', tensileMaxStrength: part.tensileMaxStrength ?? '', tensileMinYield: part.tensileMinYield ?? '', tensileMaxYield: part.tensileMaxYield ?? '', tensileMinElongation: part.tensileMinElongation ?? '', tensileMaxElongation: part.tensileMaxElongation ?? '',
      impactMinSpec: part.impactMinSpec ?? '', impactMaxSpec: part.impactMaxSpec ?? '',
      corrMinC: part.corrMinC ?? '', corrMaxC: part.corrMaxC ?? '', corrMinSi: part.corrMinSi ?? '', corrMaxSi: part.corrMaxSi ?? '', corrMinMn: part.corrMinMn ?? '', corrMaxMn: part.corrMaxMn ?? '', corrMinS: part.corrMinS ?? '', corrMaxS: part.corrMaxS ?? '', corrMinCr: part.corrMinCr ?? '', corrMaxCr: part.corrMaxCr ?? '', corrMinCu: part.corrMinCu ?? '', corrMaxCu: part.corrMaxCu ?? '', corrMinSn: part.corrMinSn ?? '', corrMaxSn: part.corrMaxSn ?? ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Part Name is required");

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      qcMinC: formData.qcMinC === '' ? null : formData.qcMinC,
      qcMaxC: formData.qcMaxC === '' ? null : formData.qcMaxC,
      qcMinSi: formData.qcMinSi === '' ? null : formData.qcMinSi,
      qcMaxSi: formData.qcMaxSi === '' ? null : formData.qcMaxSi,
      qcMinMn: formData.qcMinMn === '' ? null : formData.qcMinMn,
      qcMaxMn: formData.qcMaxMn === '' ? null : formData.qcMaxMn,
      qcMinP: formData.qcMinP === '' ? null : formData.qcMinP,
      qcMaxP: formData.qcMaxP === '' ? null : formData.qcMaxP,
      qcMinS: formData.qcMinS === '' ? null : formData.qcMinS,
      qcMaxS: formData.qcMaxS === '' ? null : formData.qcMaxS,
      qcMinMg: formData.qcMinMg === '' ? null : formData.qcMinMg,
      qcMaxMg: formData.qcMaxMg === '' ? null : formData.qcMaxMg,
      qcMinCu: formData.qcMinCu === '' ? null : formData.qcMinCu,
      qcMaxCu: formData.qcMaxCu === '' ? null : formData.qcMaxCu,
      qcMinCr: formData.qcMinCr === '' ? null : formData.qcMinCr,
      qcMaxCr: formData.qcMaxCr === '' ? null : formData.qcMaxCr,
      qcMinSn: formData.qcMinSn === '' ? null : formData.qcMinSn,
      qcMaxSn: formData.qcMaxSn === '' ? null : formData.qcMaxSn,
      microMinNodularity: formData.microMinNodularity === '' ? null : formData.microMinNodularity,
      microMaxNodularity: formData.microMaxNodularity === '' ? null : formData.microMaxNodularity,
      microMinCount: formData.microMinCount === '' ? null : formData.microMinCount,
      microMaxCount: formData.microMaxCount === '' ? null : formData.microMaxCount,
      microSize: formData.microSize || null,
      microMinFerrite: formData.microMinFerrite === '' ? null : formData.microMinFerrite,
      microMaxFerrite: formData.microMaxFerrite === '' ? null : formData.microMaxFerrite,
      microMinPearlite: formData.microMinPearlite === '' ? null : formData.microMinPearlite,
      microMaxPearlite: formData.microMaxPearlite === '' ? null : formData.microMaxPearlite,
      microMinCarbide: formData.microMinCarbide === '' ? null : formData.microMinCarbide,
      microMaxCarbide: formData.microMaxCarbide === '' ? null : formData.microMaxCarbide,
      tensileMinStrength: formData.tensileMinStrength === '' ? null : formData.tensileMinStrength,
      tensileMaxStrength: formData.tensileMaxStrength === '' ? null : formData.tensileMaxStrength,
      tensileMinYield: formData.tensileMinYield === '' ? null : formData.tensileMinYield,
      tensileMaxYield: formData.tensileMaxYield === '' ? null : formData.tensileMaxYield,
      tensileMinElongation: formData.tensileMinElongation === '' ? null : formData.tensileMinElongation,
      tensileMaxElongation: formData.tensileMaxElongation === '' ? null : formData.tensileMaxElongation,
      impactMinSpec: formData.impactMinSpec === '' ? null : formData.impactMinSpec,
      impactMaxSpec: formData.impactMaxSpec === '' ? null : formData.impactMaxSpec,
      corrMinC: formData.corrMinC === '' ? null : formData.corrMinC,
      corrMaxC: formData.corrMaxC === '' ? null : formData.corrMaxC,
      corrMinSi: formData.corrMinSi === '' ? null : formData.corrMinSi,
      corrMaxSi: formData.corrMaxSi === '' ? null : formData.corrMaxSi,
      corrMinMn: formData.corrMinMn === '' ? null : formData.corrMinMn,
      corrMaxMn: formData.corrMaxMn === '' ? null : formData.corrMaxMn,
      corrMinS: formData.corrMinS === '' ? null : formData.corrMinS,
      corrMaxS: formData.corrMaxS === '' ? null : formData.corrMaxS,
      corrMinCr: formData.corrMinCr === '' ? null : formData.corrMinCr,
      corrMaxCr: formData.corrMaxCr === '' ? null : formData.corrMaxCr,
      corrMinCu: formData.corrMinCu === '' ? null : formData.corrMinCu,
      corrMaxCu: formData.corrMaxCu === '' ? null : formData.corrMaxCu,
      corrMinSn: formData.corrMinSn === '' ? null : formData.corrMinSn,
      corrMaxSn: formData.corrMaxSn === '' ? null : formData.corrMaxSn
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
      alert('Failed to save record: ' + (err.response?.data?.message || err.message));
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
        .form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
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
                  <div className="col-md-6">
                    <label className="form-label">Internal Code / Desc</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} className="form-control" placeholder="Optional description" />
                  </div>
                </div>

                <div className="form-section-title">1. Metal Composition Thresholds (%)</div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label small">C (Min)</label><input type="number" step="0.01" name="qcMinC" value={formData.qcMinC} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">C (Max)</label><input type="number" step="0.01" name="qcMaxC" value={formData.qcMaxC} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Si (Min)</label><input type="number" step="0.01" name="qcMinSi" value={formData.qcMinSi} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Si (Max)</label><input type="number" step="0.01" name="qcMaxSi" value={formData.qcMaxSi} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Mn (Min)</label><input type="number" step="0.01" name="qcMinMn" value={formData.qcMinMn} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Mn (Max)</label><input type="number" step="0.01" name="qcMaxMn" value={formData.qcMaxMn} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">P (Min)</label><input type="number" step="0.001" name="qcMinP" value={formData.qcMinP} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">P (Max)</label><input type="number" step="0.001" name="qcMaxP" value={formData.qcMaxP} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">S (Min)</label><input type="number" step="0.001" name="qcMinS" value={formData.qcMinS} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">S (Max)</label><input type="number" step="0.001" name="qcMaxS" value={formData.qcMaxS} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Mg F/L (Min)</label><input type="number" step="0.001" name="qcMinMg" value={formData.qcMinMg} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Mg F/L (Max)</label><input type="number" step="0.001" name="qcMaxMg" value={formData.qcMaxMg} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Cu (Min)</label><input type="number" step="0.01" name="qcMinCu" value={formData.qcMinCu} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Cu (Max)</label><input type="number" step="0.01" name="qcMaxCu" value={formData.qcMaxCu} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Cr (Min)</label><input type="number" step="0.01" name="qcMinCr" value={formData.qcMinCr} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Cr (Max)</label><input type="number" step="0.01" name="qcMaxCr" value={formData.qcMaxCr} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Sn (Min)</label><input type="number" step="0.001" name="qcMinSn" value={formData.qcMinSn} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Sn (Max)</label><input type="number" step="0.001" name="qcMaxSn" value={formData.qcMaxSn} onChange={handleChange} className="form-control" /></div>
                </div>

                <div className="form-section-title">2. Micro Structure Thresholds</div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label small">Nodularity % (Min)</label><input type="number" name="microMinNodularity" value={formData.microMinNodularity} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Nodularity % (Max)</label><input type="number" name="microMaxNodularity" value={formData.microMaxNodularity} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Count (Min)</label><input type="number" name="microMinCount" value={formData.microMinCount} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Count (Max)</label><input type="number" name="microMaxCount" value={formData.microMaxCount} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Nodule Size</label><input type="text" name="microSize" value={formData.microSize} onChange={handleChange} className="form-control" placeholder="e.g. 6-7" /></div>
                  <div className="form-group"><label className="form-label small">Ferrite % (Min)</label><input type="number" name="microMinFerrite" value={formData.microMinFerrite} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Ferrite % (Max)</label><input type="number" name="microMaxFerrite" value={formData.microMaxFerrite} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Pearlite % (Min)</label><input type="number" name="microMinPearlite" value={formData.microMinPearlite} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Pearlite % (Max)</label><input type="number" name="microMaxPearlite" value={formData.microMaxPearlite} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Carbide % (Min)</label><input type="number" name="microMinCarbide" value={formData.microMinCarbide} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Carbide % (Max)</label><input type="number" name="microMaxCarbide" value={formData.microMaxCarbide} onChange={handleChange} className="form-control" /></div>
                </div>

                <div className="form-section-title">3. Mechanical Properties</div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label small">Tensile (Min)</label><input type="number" name="tensileMinStrength" value={formData.tensileMinStrength} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Tensile (Max)</label><input type="number" name="tensileMaxStrength" value={formData.tensileMaxStrength} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Yield 0.2% (Min)</label><input type="number" name="tensileMinYield" value={formData.tensileMinYield} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Yield 0.2% (Max)</label><input type="number" name="tensileMaxYield" value={formData.tensileMaxYield} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Elongation (Min)</label><input type="number" name="tensileMinElongation" value={formData.tensileMinElongation} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Elongation (Max)</label><input type="number" name="tensileMaxElongation" value={formData.tensileMaxElongation} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Impact Spec (Min)</label><input type="number" name="impactMinSpec" value={formData.impactMinSpec} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Impact Spec (Max)</label><input type="number" name="impactMaxSpec" value={formData.impactMaxSpec} onChange={handleChange} className="form-control" /></div>
                </div>

                <div className="form-section-title">4. Corrective Addition Thresholds (Kgs)</div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label small">C (Min)</label><input type="number" step="0.1" name="corrMinC" value={formData.corrMinC} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">C (Max)</label><input type="number" step="0.1" name="corrMaxC" value={formData.corrMaxC} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Si (Min)</label><input type="number" step="0.1" name="corrMinSi" value={formData.corrMinSi} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Si (Max)</label><input type="number" step="0.1" name="corrMaxSi" value={formData.corrMaxSi} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Mn (Min)</label><input type="number" step="0.1" name="corrMinMn" value={formData.corrMinMn} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Mn (Max)</label><input type="number" step="0.1" name="corrMaxMn" value={formData.corrMaxMn} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">S (Min)</label><input type="number" step="0.1" name="corrMinS" value={formData.corrMinS} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">S (Max)</label><input type="number" step="0.1" name="corrMaxS" value={formData.corrMaxS} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Cr (Min)</label><input type="number" step="0.1" name="corrMinCr" value={formData.corrMinCr} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Cr (Max)</label><input type="number" step="0.1" name="corrMaxCr" value={formData.corrMaxCr} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Cu (Min)</label><input type="number" step="0.1" name="corrMinCu" value={formData.corrMinCu} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Cu (Max)</label><input type="number" step="0.1" name="corrMaxCu" value={formData.corrMaxCu} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Sn (Min)</label><input type="number" step="0.1" name="corrMinSn" value={formData.corrMinSn} onChange={handleChange} className="form-control" /></div>
                  <div className="form-group"><label className="form-label small">Sn (Max)</label><input type="number" step="0.1" name="corrMaxSn" value={formData.corrMaxSn} onChange={handleChange} className="form-control" /></div>
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
