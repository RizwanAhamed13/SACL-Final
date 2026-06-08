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

const RateBar = ({ value, color, bg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(value, 100)}%`,
        background: color, borderRadius: '99px',
        transition: 'width .6s ease',
      }} />
    </div>
    <span style={{ fontSize: '12px', fontWeight: 700, color, minWidth: '38px', textAlign: 'right' }}>
      {value}%
    </span>
  </div>
);

const ScoreBadge = ({ rate }) => {
  let color, bg, label;
  if (rate >= 80)      { color = '#059669'; bg = '#d1fae5'; label = 'Excellent'; }
  else if (rate >= 60) { color = '#d97706'; bg = '#fef3c7'; label = 'Good'; }
  else if (rate >= 40) { color = '#ea580c'; bg = '#ffedd5'; label = 'Average'; }
  else                 { color = '#dc2626'; bg = '#fee2e2'; label = 'Needs Work'; }
  return (
    <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:'99px', fontSize:'11px', fontWeight:700, background:bg, color }}>
      {label}
    </span>
  );
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
  const totalEmployees  = data.length;
  const totalSubmissions = data.reduce((s, e) => s + (e.totalSubmissions || 0), 0);
  const totalApproved   = data.reduce((s, e) => s + (e.hodApproved || 0), 0);
  const totalRejections = data.reduce((s, e) => s + (e.totalRejections || 0), 0);
  const avgApprovalRate = data.length ? Math.round(data.reduce((s, e) => s + (e.approvalRate || 0), 0) / data.length * 10) / 10 : 0;
  const topPerformer    = data.reduce((best, e) => (e.approvalRate > (best?.approvalRate || 0) ? e : best), null);

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
      `}</style>

      <div className="breadcrumb">
        <NavLink to="/" className="breadcrumb-item">Home</NavLink>
        <span className="breadcrumb-item active">Employee Efficiency</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Efficiency</h1>
          <p className="page-subtitle">Quality submission metrics, approval rates, and rejection analysis per employee</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
        <StatCard label="Total Employees" value={totalEmployees} icon="👥" color="#ff7b21" bg="#fff3e8" />
        <StatCard label="Total Submissions" value={totalSubmissions} icon="📋" color="#2563eb" bg="#dbeafe" sub="Across all forms" />
        <StatCard label="HOD Approved" value={totalApproved} icon="✅" color="#059669" bg="#d1fae5" sub="Fully approved records" />
        <StatCard label="Total Rejections" value={totalRejections} icon="🔴" color="#dc2626" bg="#fee2e2" sub="HOF + HOD stage" />
        <StatCard label="Avg Approval Rate" value={`${avgApprovalRate}%`} icon="📈" color="#7c3aed" bg="#f3e8ff" />
        {topPerformer && (
          <StatCard
            label="Top Performer"
            value={topPerformer.employeeId}
            icon="🏆"
            color="#d97706"
            bg="#fef3c7"
            sub={`${topPerformer.approvalRate}% approval`}
          />
        )}
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
            <span>Employee Performance</span>
            <span style={{ background:'#f1f5f9', color:'#6b7280', borderRadius:'99px', padding:'2px 10px', fontSize:'12px', fontWeight:600 }}>
              {filtered.length} employees
            </span>
          </h2>
          <div style={{ display:'flex', gap:'.75rem', alignItems:'center' }}>
            <input
              type="text"
              placeholder="Search employee ID or name…"
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
                  <th style={thStyle('employeeId')} onClick={() => handleSort('employeeId')}>Employee <SortIcon col="employeeId" /></th>
                  <th style={thStyle('totalSubmissions')} onClick={() => handleSort('totalSubmissions')}>Submissions <SortIcon col="totalSubmissions" /></th>
                  <th style={{ ...thStyle(''), cursor:'default' }}>By Form</th>
                  <th style={thStyle('hofApproved')} onClick={() => handleSort('hofApproved')}>HOF Approved <SortIcon col="hofApproved" /></th>
                  <th style={thStyle('hodApproved')} onClick={() => handleSort('hodApproved')}>HOD Approved <SortIcon col="hodApproved" /></th>
                  <th style={thStyle('hofRejections')} onClick={() => handleSort('hofRejections')}>HOF Rejected <SortIcon col="hofRejections" /></th>
                  <th style={thStyle('hodRejections')} onClick={() => handleSort('hodRejections')}>HOD Rejected <SortIcon col="hodRejections" /></th>
                  <th style={thStyle('pending')} onClick={() => handleSort('pending')}>Pending <SortIcon col="pending" /></th>
                  <th style={{ ...thStyle('approvalRate'), minWidth:'160px' }} onClick={() => handleSort('approvalRate')}>Approval Rate <SortIcon col="approvalRate" /></th>
                  <th style={{ ...thStyle(''), cursor:'default' }}>Score</th>
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

                      {/* HOF Rejected */}
                      <td style={{ padding:'12px 14px', textAlign:'center' }} className="eff-metric-cell">
                        <span style={{
                          background: emp.hofRejections > 0 ? '#fef2f2' : '#f9fafb',
                          color: emp.hofRejections > 0 ? '#dc2626' : '#9ca3af',
                          padding:'3px 10px', borderRadius:'99px', fontSize:'12px', fontWeight:700
                        }}>
                          {emp.hofRejections}
                        </span>
                      </td>

                      {/* HOD Rejected */}
                      <td style={{ padding:'12px 14px', textAlign:'center' }} className="eff-metric-cell">
                        <span style={{
                          background: emp.hodRejections > 0 ? '#fff7ed' : '#f9fafb',
                          color: emp.hodRejections > 0 ? '#ea580c' : '#9ca3af',
                          padding:'3px 10px', borderRadius:'99px', fontSize:'12px', fontWeight:700
                        }}>
                          {emp.hodRejections}
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

                      {/* Approval Rate bar */}
                      <td style={{ padding:'12px 14px', minWidth:'160px' }}>
                        <RateBar
                          value={emp.approvalRate}
                          color={emp.approvalRate >= 80 ? '#059669' : emp.approvalRate >= 60 ? '#d97706' : '#dc2626'}
                          bg="#f1f5f9"
                        />
                      </td>

                      {/* Score badge */}
                      <td style={{ padding:'12px 14px' }}>
                        <ScoreBadge rate={emp.approvalRate} />
                      </td>

                      {/* Last Activity */}
                      <td style={{ padding:'12px 14px', color:'#6b7280', fontSize:'12px', whiteSpace:'nowrap' }}>
                        {emp.lastActivity || '—'}
                      </td>
                    </tr>

                    {/* Expanded row with detail breakdown */}
                    {expanded === emp.employeeId && (
                      <tr className="eff-expand-row">
                        <td colSpan={11} style={{ padding:'0 14px 14px 58px', background:'#fafbff', borderBottom:'2px solid #e5e7eb' }}>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', paddingTop:'1rem' }}>

                            {/* Form breakdown detail */}
                            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'1rem' }}>
                              <div style={{ fontSize:'11px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.75rem' }}>Form Breakdown</div>
                              {Object.entries(FORM_COLORS).map(([key, { label, color, bg }]) => (
                                <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.5rem' }}>
                                  <span style={{ fontSize:'12px', color:'#374151', fontWeight:500 }}>{label}</span>
                                  <span className="eff-form-chip" style={{ background:bg, color }}>{emp[key]}</span>
                                </div>
                              ))}
                            </div>

                            {/* Rejection breakdown */}
                            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'1rem' }}>
                              <div style={{ fontSize:'11px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.75rem' }}>Rejection Breakdown</div>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.5rem' }}>
                                <span style={{ fontSize:'12px', color:'#374151' }}>Rejected at HOF level</span>
                                <span style={{ background:'#fef2f2', color:'#dc2626', padding:'2px 8px', borderRadius:'99px', fontSize:'11px', fontWeight:700 }}>{emp.hofRejections}</span>
                              </div>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.5rem' }}>
                                <span style={{ fontSize:'12px', color:'#374151' }}>Rejected at HOD level</span>
                                <span style={{ background:'#fff7ed', color:'#ea580c', padding:'2px 8px', borderRadius:'99px', fontSize:'11px', fontWeight:700 }}>{emp.hodRejections}</span>
                              </div>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.5rem' }}>
                                <span style={{ fontSize:'12px', color:'#374151', fontWeight:600 }}>Total Rejections</span>
                                <span style={{ background:'#f3f4f6', color:'#374151', padding:'2px 8px', borderRadius:'99px', fontSize:'11px', fontWeight:700 }}>{emp.totalRejections}</span>
                              </div>
                              <div style={{ marginTop:'.75rem', paddingTop:'.75rem', borderTop:'1px solid #f3f4f6' }}>
                                <div style={{ fontSize:'11px', color:'#9ca3af', marginBottom:'.25rem' }}>Rejection Rate</div>
                                <RateBar value={emp.rejectionRate} color="#dc2626" bg="#f9fafb" />
                              </div>
                            </div>

                            {/* Approval pipeline */}
                            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'1rem' }}>
                              <div style={{ fontSize:'11px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.75rem' }}>Approval Pipeline</div>
                              {[
                                { label:'Submitted',    value:emp.totalSubmissions, color:'#6b7280', bg:'#f3f4f6' },
                                { label:'HOF Approved', value:emp.hofApproved,      color:'#059669', bg:'#d1fae5' },
                                { label:'HOD Approved', value:emp.hodApproved,      color:'#2563eb', bg:'#dbeafe' },
                                { label:'Pending',      value:emp.pending,          color:'#d97706', bg:'#fef3c7' },
                              ].map(({ label, value, color, bg }) => (
                                <div key={label} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'.5rem' }}>
                                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:color, flexShrink:0 }} />
                                  <span style={{ flex:1, fontSize:'12px', color:'#374151' }}>{label}</span>
                                  <span style={{ background:bg, color, padding:'2px 8px', borderRadius:'99px', fontSize:'11px', fontWeight:700 }}>{value}</span>
                                </div>
                              ))}
                              <div style={{ marginTop:'.75rem', paddingTop:'.75rem', borderTop:'1px solid #f3f4f6' }}>
                                <div style={{ fontSize:'11px', color:'#9ca3af', marginBottom:'.25rem' }}>Approval Rate</div>
                                <RateBar
                                  value={emp.approvalRate}
                                  color={emp.approvalRate >= 80 ? '#059669' : emp.approvalRate >= 60 ? '#d97706' : '#dc2626'}
                                  bg="#f9fafb"
                                />
                              </div>
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
          <span style={{ fontSize:'11px', color:'#9ca3af' }}>💡 Click any row to expand detailed breakdown</span>
          <span style={{ fontSize:'11px', color:'#9ca3af' }}>
            Score: &nbsp;
            <span style={{ background:'#d1fae5', color:'#059669', padding:'1px 7px', borderRadius:'99px', fontWeight:700 }}>Excellent ≥80%</span>&nbsp;
            <span style={{ background:'#fef3c7', color:'#d97706', padding:'1px 7px', borderRadius:'99px', fontWeight:700 }}>Good ≥60%</span>&nbsp;
            <span style={{ background:'#ffedd5', color:'#ea580c', padding:'1px 7px', borderRadius:'99px', fontWeight:700 }}>Average ≥40%</span>&nbsp;
            <span style={{ background:'#fee2e2', color:'#dc2626', padding:'1px 7px', borderRadius:'99px', fontWeight:700 }}>Needs Work &lt;40%</span>
          </span>
        </div>
      </div>
    </>
  );
};

export default EmployeeEfficiency;
