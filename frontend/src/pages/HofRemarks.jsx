import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const HofRemarks = () => {
  const { user } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState({ qc: [], micro: [], tensile: [], impact: [] });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [remarkText, setRemarkText] = useState('');

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
      
      setRecords({
        qc: qcRes.data.filter(matchUser).map(r => ({ ...r, formType: 'QC Register' })),
        micro: microRes.data.filter(matchUser).map(r => ({ ...r, formType: 'Micro Structure' })),
        tensile: tensileRes.data.filter(matchUser).map(r => ({ ...r, formType: 'Tensile Test' })),
        impact: impactRes.data.filter(matchUser).map(r => ({ ...r, formType: 'Impact Test' }))
      });
      setSelectedRecord(null);
      setRemarkText('');
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

  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setRemarkText(record.remarks || '');
  };

  const handleSaveRemark = async () => {
    if (!selectedRecord) return;
    try {
      let endpoint = '';
      if (selectedRecord.formType === 'QC Register') endpoint = `/api/qc-register/${selectedRecord.id}`;
      else if (selectedRecord.formType === 'Micro Structure') endpoint = `/api/micro-structure/${selectedRecord.id}`;
      else if (selectedRecord.formType === 'Tensile Test') endpoint = `/api/micro-tensile/${selectedRecord.id}`;
      else if (selectedRecord.formType === 'Impact Test') endpoint = `/api/impact-test/${selectedRecord.id}`;

      // We preserve everything and just update remarks
      const { formType, ...payload } = selectedRecord;
      const updatedPayload = { ...payload, remarks: remarkText, hofApprovedBy: user.employeeId || user.fullName };
      await axios.put(endpoint, updatedPayload);
      
      toast.success('Remark saved successfully');
      
      // Update local state
      const formKey = selectedRecord.formType === 'QC Register' ? 'qc' :
                      selectedRecord.formType === 'Micro Structure' ? 'micro' :
                      selectedRecord.formType === 'Tensile Test' ? 'tensile' : 'impact';
                      
      setRecords(prev => ({
        ...prev,
        [formKey]: prev[formKey].map(r => r.id === selectedRecord.id ? { ...updatedPayload, formType: selectedRecord.formType } : r)
      }));
      setSelectedRecord({ ...updatedPayload, formType: selectedRecord.formType });
    } catch (err) {
      toast.error('Failed to save remark');
    }
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
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* List of Records */}
          <div className="card" style={{ flex: 1, padding: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '14px', color: '#6b7280', textTransform: 'uppercase' }}>Submissions by {searchId}</h3>
            {allRecords.map(r => (
              <div 
                key={`${r.formType}-${r.id}`}
                onClick={() => handleSelectRecord(r)}
                style={{ 
                  padding: '1rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  marginBottom: '0.75rem', 
                  cursor: 'pointer',
                  background: selectedRecord?.id === r.id && selectedRecord?.formType === r.formType ? '#f0f9ff' : '#fff',
                  borderColor: selectedRecord?.id === r.id && selectedRecord?.formType === r.formType ? '#3b82f6' : '#e5e7eb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{r.formType} #{r.id}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {r.date || r.inspectionDate || r.dateOfInspection || 'N/A'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#4b5563' }}>Part: {r.partName || r.item || 'N/A'}</div>
                <div style={{ fontSize: '13px', color: '#4b5563' }}>Status: {r.status || 'QC_ENTRY'}</div>
                {r.remarks && (
                  <div style={{ marginTop: '0.5rem', fontSize: '12px', color: '#059669', background: '#ecfdf5', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    Has Remarks
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Remark Editor */}
          {selectedRecord && (
            <div className="card" style={{ flex: 1, padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
              <h2 className="card-title" style={{ marginBottom: '1rem' }}>
                Add Remark: {selectedRecord.formType} #{selectedRecord.id}
              </h2>
              
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '13px', color: '#4b5563' }}>
                <strong>Part Name:</strong> {selectedRecord.partName || selectedRecord.item || 'N/A'}<br/>
                <strong>Date Code:</strong> {selectedRecord.dateCode || 'N/A'}<br/>
                <strong>Heat Code:</strong> {selectedRecord.heatCode || 'N/A'}
              </div>

              <div className="form-group">
                <label className="form-label">Feedback / Remarks</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={remarkText}
                  onChange={e => setRemarkText(e.target.value)}
                  placeholder="Enter remarks for this submission..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveRemark}>Save Remark</button>
              </div>
            </div>
          )}
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
