import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { PartNameSelect } from '../components/PartNameSelect';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import Skeleton from '../components/Skeleton';

const QcRegister = () => {
  const { user } = useAuth();
  const isStaff = user?.role?.toUpperCase()?.includes('HOF') || user?.role?.toUpperCase()?.includes('HOD') || user?.role?.toUpperCase()?.includes('ADMIN');

  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null, // for editing
    heatCode: '', date: new Date().toISOString().split('T')[0], dateCode: '', disa: '', partName: '', qtyMoulds: '',
    compositionC: '', compositionSi: '', compositionMn: '', compositionP: '', compositionS: '',
    compositionMgFl: '', compositionCu: '', compositionCr: '',
    fcNoHeatNo: '', conNo: '', tappingTime: '', tappingWtKgs: '', pouringTemp: '', timeOfPouring: '', streamInnoculant: '', ppCode: '',
    treatmentNo: '', mgKgs: '', resMgConvertorPercent: '', recMgPercent: '', pTimeSec: '',
    correctiveC: '', correctiveSi: '', correctiveMn: '', correctiveS: '', correctiveCr: '', correctiveCu: '', correctiveSn: '',
    remarks: '',
    status: 'QC_ENTRY', hofApprovedBy: '', hodApprovedBy: '', createdBy: ''
  });

  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, record: null });

  const fetchRecords = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await axios.get('/api/qc-register');
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

  const openEdit = (record) => {
    setFormData({
      ...record,
      date: record.date ? record.date.split('T')[0] : ''
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
      await axios.put(`/api/qc-register/${record.id}`, payload);
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
      await axios.post(`/api/qc-register/reject/${record.id}?rejectedBy=${user.fullName || user.username}`);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePartNameChange = (val) => {
    setFormData(prev => ({ ...prev, partName: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = { 
      ...formData,
      createdBy: formData.id ? formData.createdBy : (user?.fullName || user?.username)
    };
    try {
      if (formData.id) {
        await axios.put(`/api/qc-register/${formData.id}`, dataToSave);
      } else {
        await axios.post('/api/qc-register', dataToSave);
      }
      setShowForm(false);
      setFormData({
        id: null, heatCode: '', date: '', dateCode: '', disa: '', partName: '', qtyMoulds: '',
        compositionC: '', compositionSi: '', compositionMn: '', compositionP: '', compositionS: '',
        compositionMgFl: '', compositionCu: '', compositionCr: '',
        fcNoHeatNo: '', conNo: '', tappingTime: '', tappingWtKgs: '', pouringTemp: '', timeOfPouring: '', streamInnoculant: '', ppCode: '',
        treatmentNo: '', mgKgs: '', resMgConvertorPercent: '', recMgPercent: '', pTimeSec: '',
        correctiveC: '', correctiveSi: '', correctiveMn: '', correctiveS: '', correctiveCr: '', correctiveCu: '', correctiveSn: '',
        remarks: '', status: 'QC_ENTRY', hofApprovedBy: '', hodApprovedBy: ''
      });
      fetchRecords();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save record');
    }
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
          <h1 className="page-title">QC Register</h1>
          <p className="page-subtitle">Metal composition, pouring parameters, Mg treatment — DISA I/II/III/IV</p>
        </div>
        <div className="page-actions">
          {(user?.role?.toUpperCase()?.includes('QC') || user?.role?.toUpperCase()?.includes('ADMIN')) && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Heat Record
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="form-panel" style={{ display: 'block' }}>
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">Add New Heat Record</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-section">
                  <div className="form-section-title">Basic Information</div>
                  <div className="form-row form-row-4">
                    <div className="form-group">
                      <label className="form-label required">Heat Code</label>
                      <input type="text" name="heatCode" value={formData.heatCode} onChange={handleChange} className="form-control" placeholder="e.g. H240130-01" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">Date</label>
                      <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date Code</label>
                      <input type="text" name="dateCode" value={formData.dateCode} onChange={handleChange} className="form-control" placeholder="e.g. 6D08" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Shift</label>
                      <select name="disa" className="form-control" onChange={handleChange}>
                        <option value="">Select Shift</option>
                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                        <option>General</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label className="form-label">DISA Line</label>
                      <select name="disa" value={formData.disa} onChange={handleChange} className="form-control">
                        <option value="">Select Line</option>
                        <option>DISA I</option>
                        <option>DISA II</option>
                        <option>DISA III</option>
                        <option>DISA IV</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Part Name / Product</label>
                      <PartNameSelect value={formData.partName} onChange={handlePartNameChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Qty of Moulds</label>
                      <input type="number" name="qtyMoulds" value={formData.qtyMoulds} onChange={handleChange} className="form-control" placeholder="e.g. 120" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Metal Composition (%)</div>
                  <div className="form-row form-row-4">
                    <div className="form-group">
                      <label className="form-label">C <span style={{color:'var(--color-text-secondary)', fontWeight: 400}}>(3.00–4.00)</span></label>
                      <input type="number" step="0.001" name="compositionC" value={formData.compositionC} onChange={handleChange} className="form-control" placeholder="e.g. 3.60" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Si <span style={{color:'var(--color-text-secondary)', fontWeight: 400}}>(2.0–3.00)</span></label>
                      <input type="number" step="0.001" name="compositionSi" value={formData.compositionSi} onChange={handleChange} className="form-control" placeholder="e.g. 2.52" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mn <span style={{color:'var(--color-text-secondary)', fontWeight: 400}}>(0.20–0.50)</span></label>
                      <input type="number" step="0.001" name="compositionMn" value={formData.compositionMn} onChange={handleChange} className="form-control" placeholder="e.g. 0.22" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">P <span style={{color:'var(--color-text-secondary)', fontWeight: 400}}>(0–0.050)</span></label>
                      <input type="number" step="0.001" name="compositionP" value={formData.compositionP} onChange={handleChange} className="form-control" placeholder="e.g. 0.047" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">S <span style={{color:'var(--color-text-secondary)', fontWeight: 400}}>(0–0.010)</span></label>
                      <input type="number" step="0.001" name="compositionS" value={formData.compositionS} onChange={handleChange} className="form-control" placeholder="e.g. 0.003" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mg F/L <span style={{color:'var(--color-text-secondary)', fontWeight: 400}}>(0.015 Min)</span></label>
                      <input type="number" step="0.001" name="compositionMgFl" value={formData.compositionMgFl} onChange={handleChange} className="form-control" placeholder="e.g. 0.04" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cu <span style={{color:'var(--color-text-secondary)', fontWeight: 400}}>(0.50 Max)</span></label>
                      <input type="number" step="0.001" name="compositionCu" value={formData.compositionCu} onChange={handleChange} className="form-control" placeholder="e.g. 0.20" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cr</label>
                      <input type="number" step="0.001" name="compositionCr" value={formData.compositionCr} onChange={handleChange} className="form-control" placeholder="e.g. 0.03" />
                    </div>
                  </div>
                </div>

                {/* Other sections removed for brevity in previous rewrite but I will include them to fully match layout now */}
                <div className="form-section">
                  <div className="form-section-title">Process Parameters</div>
                  <div className="form-row form-row-4">
                    <div className="form-group"><label className="form-label">Time of Pouring</label><input type="time" name="timeOfPouring" value={formData.timeOfPouring} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Pouring Temp °C</label><input type="number" name="pouringTemp" value={formData.pouringTemp} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">PP Code</label><input type="text" name="ppCode" value={formData.ppCode} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Treatment No</label><input type="text" name="treatmentNo" value={formData.treatmentNo} onChange={handleChange} className="form-control" /></div>
                  </div>
                  <div className="form-row form-row-4">
                    <div className="form-group"><label className="form-label">F/C No / Heat No</label><input type="text" name="fcNoHeatNo" value={formData.fcNoHeatNo} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Con No</label><input type="text" name="conNo" value={formData.conNo} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Tapping Time</label><input type="time" name="tappingTime" value={formData.tappingTime} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Tapping Wt (Kgs)</label><input type="number" name="tappingWtKgs" value={formData.tappingWtKgs} onChange={handleChange} className="form-control" /></div>
                  </div>
                  <div className="form-row form-row-4">
                    <div className="form-group"><label className="form-label">Mg (Kgs)</label><input type="number" step="0.01" name="mgKgs" value={formData.mgKgs} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Res Mg Convertor %</label><input type="number" step="0.001" name="resMgConvertorPercent" value={formData.resMgConvertorPercent} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Rec of Mg %</label><input type="number" step="0.01" name="recMgPercent" value={formData.recMgPercent} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Stream Inoculant (gms/Sec)</label><input type="text" name="streamInnoculant" value={formData.streamInnoculant} onChange={handleChange} className="form-control" /></div>
                  </div>
                  <div className="form-row form-row-4">
                    <div className="form-group"><label className="form-label">P.Time (sec)</label><input type="number" step="0.1" name="pTimeSec" value={formData.pTimeSec} onChange={handleChange} className="form-control" /></div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Corrective Addition (Kgs)</div>
                  <div className="form-row form-row-4">
                    <div className="form-group"><label className="form-label">C</label><input type="number" step="0.1" name="correctiveC" value={formData.correctiveC} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Si</label><input type="number" step="0.1" name="correctiveSi" value={formData.correctiveSi} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Mn</label><input type="number" step="0.1" name="correctiveMn" value={formData.correctiveMn} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">S</label><input type="number" step="0.1" name="correctiveS" value={formData.correctiveS} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Cr</label><input type="number" step="0.1" name="correctiveCr" value={formData.correctiveCr} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Cu</label><input type="number" step="0.1" name="correctiveCu" value={formData.correctiveCu} onChange={handleChange} className="form-control" /></div>
                    <div className="form-group"><label className="form-label">Sn</label><input type="number" step="0.1" name="correctiveSn" value={formData.correctiveSn} onChange={handleChange} className="form-control" /></div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">Remarks &amp; Signatures</div>
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
                    <button type="button" className="btn btn-secondary" onClick={() => setFormData(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: '' }), {}), hodQc: user?.fullName || user?.username || '' }))}>Clear</button>
                    <button type="submit" className="btn btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Save Record
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
                  <th colSpan="8" className="text-center">Metal Composition (%)</th>
                  <th rowSpan="2">Time of Pouring</th>
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
                  <th style={{ fontSize: '10px' }}>P</th><th style={{ fontSize: '10px' }}>S</th><th style={{ fontSize: '10px' }}>Mg F/L</th>
                  <th style={{ fontSize: '10px' }}>Cu</th><th style={{ fontSize: '10px' }}>Cr</th>
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
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionMgFl)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionCu)}</td>
                    <td style={{ fontSize: '12px' }}>{dash(r.compositionCr)}</td>

                    <td>{dash(r.timeOfPouring)}</td>
                    <td>{dash(r.pouringTemp)}</td>
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
                    <td>{dash(r.pTimeSec)}</td>

                    <td style={{ fontSize: '11px', maxWidth: '200px', whiteSpace: 'normal' }}>{dash(r.remarks)}</td>
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

export default QcRegister;
