import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RemarkCell = ({ record, user, setRecords }) => {
  const [text, setText] = useState(record.hofRemarks || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      let endpoint = '';
      if (record.formType === 'QC Register') endpoint = `/api/qc-register/${record.id}`;
      else if (record.formType === 'Micro Structure') endpoint = `/api/micro-structure/${record.id}`;
      else if (record.formType === 'Tensile Test') endpoint = `/api/micro-tensile/${record.id}`;
      else if (record.formType === 'Impact Test') endpoint = `/api/impact-test/${record.id}`;

      const { formType, ...payload } = record;
      const updatedPayload = { ...payload, hofRemarks: text, hofApprovedBy: user.employeeId || user.fullName };
      await axios.put(endpoint, updatedPayload);
      
      toast.success('Remark saved successfully');
      
      const formKey = record.formType === 'QC Register' ? 'qc' :
                      record.formType === 'Micro Structure' ? 'micro' :
                      record.formType === 'Tensile Test' ? 'tensile' : 'impact';
                      
      setRecords(prev => ({
        ...prev,
        [formKey]: prev[formKey].map(r => r.id === record.id ? { ...updatedPayload, formType: record.formType } : r)
      }));
    } catch (err) {
      toast.error('Failed to save remark');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
      <textarea
        className="form-control"
        style={{ fontSize: '12px', minHeight: '60px' }}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter internal remarks..."
      />
      <button 
        className="btn btn-primary btn-sm" 
        onClick={handleSave} 
        disabled={saving || text === record.hofRemarks}
        style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

const HofRemarks = () => {
  const { user } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState({ qc: [], micro: [], tensile: [], impact: [] });

  const fetchUserRecords = async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const [qcRes, microRes, tensileRes, impactRes] = await Promise.all([
        axios.get('/api/qc-register'),
        axios.get('/api/micro-structure'),
        axios.get('/api/micro-tensile'),
        axios.get('/api/impact-test')
      ]);

      const matchUser = (r) => (r.createdBy && r.createdBy.toLowerCase() === userId.toLowerCase());
      const qcData = qcRes.data.content || qcRes.data;
      const microData = microRes.data.content || microRes.data;
      const tensileData = tensileRes.data.content || tensileRes.data;
      const impactData = impactRes.data.content || impactRes.data;

      setRecords({
        qc: qcData.filter(matchUser).map(r => ({ ...r, formType: 'QC Register' })),
        micro: microData.filter(matchUser).map(r => ({ ...r, formType: 'Micro Structure' })),
        tensile: tensileData.filter(matchUser).map(r => ({ ...r, formType: 'Tensile Test' })),
        impact: impactData.filter(matchUser).map(r => ({ ...r, formType: 'Impact Test' }))
      });
    } catch (err) {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUserRecords(searchId);
  };

  const allRecords = [...records.qc, ...records.micro, ...records.tensile, ...records.impact].sort((a, b) => b.id - a.id);

  return (
    <>
      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">Inspector Feedback</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Inspector Feedback</h1>
          <p className="page-subtitle">Search for a user by ID and add remarks to their submissions</p>
        </div>
      </div>

      <div className="card mb-3" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter User ID (e.g., EMP001)"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <button type="submit" className="btn btn-primary">Search Submissions</button>
        </form>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : allRecords.length > 0 ? (
        <div className="card" style={{ width: '100%', overflowX: 'auto', padding: '0' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
              Submissions by {searchId} ({allRecords.length})
            </h3>
          </div>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Form Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Part / Heat Code</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', width: '45%' }}>Internal Remark (HOF/Admin)</th>
              </tr>
            </thead>
            <tbody>
              {allRecords.map(r => (
                <tr key={`${r.formType}-${r.id}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>{r.formType}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>#{r.id}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>{r.date || r.inspectionDate || r.dateOfInspection || '—'}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{r.partName || r.item || '—'}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>HC: {r.heatCode || '—'}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                      background: (r.status || '').includes('APPROVED') ? '#dcfce7' : '#f1f5f9',
                      color: (r.status || '').includes('APPROVED') ? '#166534' : '#475569'
                    }}>
                      {r.status || 'QC_ENTRY'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <RemarkCell record={r} user={user} setRecords={setRecords} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : searchId && !loading && (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>No Submissions Found</h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Could not find any quality records created by "{searchId}".</p>
        </div>
      )}
    </>
  );
};

export default HofRemarks;
