import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import Skeleton from '../components/Skeleton';

const FORM_COLORS = {
  qcCount:      { label: 'QC Register',  color: '#1e3a5f', bg: '#dbeafe' },
  microCount:   { label: 'Micro Str.',   color: '#134e4a', bg: '#ccfbf1' },
  tensileCount: { label: 'Tensile',      color: '#78350f', bg: '#fef3c7' },
  impactCount:  { label: 'Impact',       color: '#3b0764', bg: '#f3e8ff' },
};

const StatCard = ({ label, value, icon, color, bg, sub }) => (
  <div style={{
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px',
    padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
    display: 'flex', alignItems: 'flex-start', gap: '1rem',
    borderLeft: `3px solid ${color}`,
  }}>
    <div style={{ width:'40px',height:'40px',borderRadius:'10px',background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'20px' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize:'11px',fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'2px' }}>{label}</div>
      <div style={{ fontSize:'1.75rem',fontWeight:800,color:'#0d1117',lineHeight:1.1,letterSpacing:'-.03em' }}>{value}</div>
      {sub && <div style={{ fontSize:'11px',color:'#9ca3af',marginTop:'2px' }}>{sub}</div>}
    </div>
  </div>
);

const EmployeeEfficiency = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [sortBy, setSortBy]   = useState('totalSubmissions');
  const [sortDir, setSortDir] = useState('desc');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    axios.get('/api/efficiency/employees')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const filtered = data
    .filter(e =>
      !search ||
      (e.employeeId || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.fullName || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortBy] ?? 0;
      const bv = b[sortBy] ?? 0;
      const n  = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? n : -n;
    });

  // Summary stats
  const totalEmployees   = data.length;
  const totalSubmissions = data.reduce((s, e) => s + (e.totalSubmissions || 0), 0);
  const totalApproved    = data.reduce((s, e) => s + (e.hodApproved || 0), 0);
  const totalIssues      = data.reduce((s, e) => s + (e.issuesCount || 0), 0);

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span style={{ opacity:.3, fontSize:'10px' }}>↕</span>;
    return <span style={{ fontSize:'10px', color:'#ff7b21' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const thStyle = (col) => ({
    padding: '10px 14px', textAlign: 'left', fontSize: '10.5px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '.07em', color: '#6b7280',
    background: '#f8f9fc', borderBottom: '1.5px solid #e5e7eb',
    cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
  });

  return (
    <>
      <style>{`
        .eff-table tbody tr:hover { background: #fafbff !important; }
        .eff-table tbody tr { transition: background .1s; cursor: pointer; }
        .eff-expand-row { background: #fafbff !important; }
        .eff-form-chip {
          display:inline-flex;align-items:center;gap:4px;
          padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;
          margin-right:4px;margin-bottom:2px;
        }
        .eff-metric-cell { font-variant-numeric: tabular-nums; }
        .remarks-table th { padding: 8px; text-align: left; background: #f3f4f6; color: #374151; font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
        .remarks-table td { padding: 8px; font-size: 12px; color: #4b5563; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
      `}</style>

      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">Employee Remarks Log</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Remarks Log</h1>
          <p className="page-subtitle">Search employees by User ID to retrieve all remarks and observations on their submissions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
        <StatCard label="Total Employees" value={totalEmployees} icon="👥" color="#ff7b21" bg="#fff3e8" />
        <StatCard label="Total Submissions" value={totalSubmissions} icon="📋" color="#2563eb" bg="#dbeafe" sub="Across all forms" />
        <StatCard label="HOD Approved" value={totalApproved} icon="✅" color="#059669" bg="#d1fae5" sub="Fully approved records" />
        <StatCard label="Total Issues" value={totalIssues} icon="⚠️" color="#ea580c" bg="#ffedd5" sub="Forms with remarks" />
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
            <span>Employee Data</span>
            <span style={{ background:'#f1f5f9', color:'#6b7280', borderRadius:'99px', padding:'2px 10px', fontSize:'12px', fontWeight:600 }}>
              {filtered.length} employees
            </span>
          </h2>
          <div style={{ display:'flex', gap:'.75rem', alignItems:'center' }}>
            <input
              type="text"
              placeholder="Search by UID or Name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                height:'36px', padding:'0 .875rem', borderRadius:'8px',
                border:'1.5px solid #e5e7eb', fontSize:'13px', width:'240px',
                outline:'none', fontFamily:'inherit',
              }}
              onFocus={e => { e.target.style.borderColor='#ff7b21'; e.target.style.boxShadow='0 0 0 3px #fff3e8'; }}
              onBlur={e => { e.target.style.borderColor='#e5e7eb'; e.target.style.boxShadow='none'; }}
            />
          </div>
        </div>

        <div style={{ overflowX:'auto' }}>
          {loading ? (
            <div style={{ padding:'2rem' }}><Skeleton height="300px" /></div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>
              No employee data found. Records must have a <strong>createdBy</strong> field set.
            </div>
          ) : (
            <table className="eff-table" style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr>
                  <th style={thStyle('employeeId')} onClick={() => handleSort('employeeId')}>Employee UID <SortIcon col="employeeId" /></th>
                  <th style={thStyle('totalSubmissions')} onClick={() => handleSort('totalSubmissions')}>Submissions <SortIcon col="totalSubmissions" /></th>
                  <th style={{ ...thStyle(''), cursor:'default' }}>By Form</th>
                  <th style={thStyle('hofApproved')} onClick={() => handleSort('hofApproved')}>HOF Approved <SortIcon col="hofApproved" /></th>
                  <th style={thStyle('hodApproved')} onClick={() => handleSort('hodApproved')}>HOD Approved <SortIcon col="hodApproved" /></th>
                  <th style={thStyle('pending')} onClick={() => handleSort('pending')}>Pending <SortIcon col="pending" /></th>
                  <th style={thStyle('issuesCount')} onClick={() => handleSort('issuesCount')}>Forms w/ Remarks <SortIcon col="issuesCount" /></th>
                  <th style={thStyle('lastActivity')} onClick={() => handleSort('lastActivity')}>Last Activity <SortIcon col="lastActivity" /></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <React.Fragment key={emp.employeeId}>
                    <tr
                      onClick={() => setExpanded(expanded === emp.employeeId ? null : emp.employeeId)}
                      style={{ borderBottom:'1px solid #f3f4f6' }}
                    >
                      {/* Employee */}
                      <td style={{ padding:'12px 14px', fontWeight:600 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{
                            width:'34px', height:'34px', borderRadius:'9px', flexShrink:0,
                            background:'linear-gradient(135deg,#ff7b21,#e86a14)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:'13px', fontWeight:800, color:'#fff',
                          }}>
                            {(emp.fullName || emp.employeeId || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize:'13px', fontWeight:700, color:'#0d1117', lineHeight:1.2 }}>
                              {emp.fullName || emp.employeeId}
                            </div>
                            <div style={{ fontSize:'11px', color:'#9ca3af', lineHeight:1.2 }}>
                              {emp.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td style={{ padding:'12px 14px', textAlign:'center' }} className="eff-metric-cell">
                        <span style={{ fontSize:'18px', fontWeight:800, color:'#0d1117' }}>
                          {emp.totalSubmissions}
                        </span>
                      </td>

                      {/* Form breakdown chips */}
                      <td style={{ padding:'12px 14px' }}>
                        {Object.entries(FORM_COLORS).map(([key, { label, color, bg }]) =>
                          emp[key] > 0 ? (
                            <span key={key} className="eff-form-chip" style={{ background:bg, color }}>
                              {label}: {emp[key]}
                            </span>
                          ) : null
                        )}
                        {Object.keys(FORM_COLORS).every(k => !emp[k]) && <span style={{ color:'#d1d5db', fontSize:'12px' }}>—</span>}
                      </td>

                      {/* HOF Approved */}
                      <td style={{ padding:'12px 14px', textAlign:'center' }} className="eff-metric-cell">
                        <span style={{ background:'#ecfdf5', color:'#059669', padding:'3px 10px', borderRadius:'99px', fontSize:'12px', fontWeight:700 }}>
                          {emp.hofApproved}
                        </span>
                      </td>

                      {/* HOD Approved */}
                      <td style={{ padding:'12px 14px', textAlign:'center' }} className="eff-metric-cell">
                        <span style={{ background:'#eff6ff', color:'#2563eb', padding:'3px 10px', borderRadius:'99px', fontSize:'12px', fontWeight:700 }}>
                          {emp.hodApproved}
                        </span>
                      </td>

                      {/* Pending */}
                      <td style={{ padding:'12px 14px', textAlign:'center' }} className="eff-metric-cell">
                        <span style={{
                          background: emp.pending > 0 ? '#fffbeb' : '#f9fafb',
                          color: emp.pending > 0 ? '#d97706' : '#9ca3af',
                          padding:'3px 10px', borderRadius:'99px', fontSize:'12px', fontWeight:700
                        }}>
                          {emp.pending}
                        </span>
                      </td>

                      {/* Issues Count */}
                      <td style={{ padding:'12px 14px', textAlign:'center' }} className="eff-metric-cell">
                        <span style={{
                          background: emp.issuesCount > 0 ? '#fff7ed' : '#f9fafb',
                          color: emp.issuesCount > 0 ? '#ea580c' : '#9ca3af',
                          padding:'3px 10px', borderRadius:'99px', fontSize:'12px', fontWeight:700
                        }}>
                          {emp.issuesCount}
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td style={{ padding:'12px 14px', color:'#6b7280', fontSize:'12px', whiteSpace:'nowrap' }}>
                        {emp.lastActivity || '—'}
                      </td>
                    </tr>

                    {/* Expanded row with detail breakdown */}
                    {expanded === emp.employeeId && (
                      <tr className="eff-expand-row">
                        <td colSpan={8} style={{ padding:'0 14px 14px 58px', background:'#fafbff', borderBottom:'2px solid #e5e7eb' }}>
                          
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:'1rem', paddingTop:'1rem' }}>
                            {/* Issues Breakdown */}
                            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'1rem', gridColumn: '1 / -1' }}>
                              <div style={{ fontSize:'11px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.75rem' }}>
                                Remarks / Issues Log
                              </div>
                              {emp.remarksList && emp.remarksList.length > 0 ? (
                                <table className="remarks-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr>
                                      <th>Date</th>
                                      <th>Form Type</th>
                                      <th>Remarks</th>
                                      <th>Reviewer</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {emp.remarksList.map((r, idx) => (
                                      <tr key={idx}>
                                        <td style={{ whiteSpace: 'nowrap' }}>{r.date}</td>
                                        <td><span className="eff-form-chip" style={{ background: '#f3f4f6', color: '#4b5563', margin: 0 }}>{r.form}</span></td>
                                        <td style={{ width: '50%', color: '#dc2626', fontWeight: 500 }}>{r.text}</td>
                                        <td>{r.reviewer}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div style={{ fontSize: '12px', color: '#6b7280', padding: '1rem', textAlign: 'center', background: '#f9fafb', borderRadius: '6px' }}>
                                  No remarks found.
                                </div>
                              )}
                            </div>
                          </div>

                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Legend */}
        <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid #f3f4f6', background:'#fafbff', display:'flex', gap:'2rem', flexWrap:'wrap' }}>
          <span style={{ fontSize:'11px', color:'#9ca3af' }}>💡 Click any row to expand detailed breakdown and see specific remarks</span>
        </div>
      </div>
    </>
  );
};

export default EmployeeEfficiency;
