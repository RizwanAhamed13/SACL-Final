import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PerformanceFeedback = () => {
  const { user } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setTargetUser(null);
    setFeedbacks([]);
    
    try {
      // Fetch feedback history for this employee ID
      const res = await axios.get(`/api/performance-feedback/${searchId}`);
      setFeedbacks(res.data || []);
      setTargetUser(searchId.toUpperCase());
    } catch (err) {
      toast.error('Failed to fetch feedback history. Make sure you entered a valid ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!newFeedback.trim()) return;
    setSaving(true);
    try {
      const payload = {
        targetEmployeeId: targetUser,
        feedbackText: newFeedback,
        reviewerName: user.employeeId || user.fullName || 'Reviewer'
      };
      const res = await axios.post('/api/performance-feedback', payload);
      setFeedbacks([res.data, ...feedbacks]);
      setNewFeedback('');
      toast.success('Performance feedback saved successfully!');
    } catch (err) {
      toast.error('Failed to save feedback');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">Performance Feedback</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Performance Feedback</h1>
          <p className="page-subtitle">Add general performance remarks and review history for a specific employee</p>
        </div>
      </div>

      <div className="card mb-3" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>
              Employee ID
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., EMP001"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              style={{ width: '250px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>
            Load History
          </button>
        </form>
      </div>

      {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}

      {!loading && targetUser && (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          
          {/* New Feedback Entry Form */}
          <div className="card" style={{ flex: '1', padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
            <h2 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>✍️</span> Add Feedback for {targetUser}
            </h2>
            <div className="form-group">
              <textarea
                className="form-control"
                rows="6"
                value={newFeedback}
                onChange={e => setNewFeedback(e.target.value)}
                placeholder={`Write your performance remark about ${targetUser} here...`}
                style={{ fontSize: '14px', padding: '12px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveFeedback} 
                disabled={saving || !newFeedback.trim()}
              >
                {saving ? 'Saving...' : 'Save Feedback'}
              </button>
            </div>
          </div>

          {/* Feedback History Log */}
          <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📜</span> History Log ({feedbacks.length})
            </h3>
            
            {feedbacks.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderStyle: 'dashed' }}>
                <div style={{ fontSize: '24px', marginBottom: '1rem' }}>📭</div>
                <h4 style={{ color: '#475569', marginBottom: '0.5rem' }}>No Feedback Yet</h4>
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>There are no previous performance remarks for this employee.</p>
              </div>
            ) : (
              feedbacks.map(f => (
                <div key={f.id} className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #ff7b21' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                        {(f.reviewerName || 'R')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{f.reviewerName}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Reviewer</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                      {f.createdAt ? new Date(f.createdAt).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                  <div style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {f.feedbackText}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </>
  );
};

export default PerformanceFeedback;
