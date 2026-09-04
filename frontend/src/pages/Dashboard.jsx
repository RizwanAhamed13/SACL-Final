import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ── tiny helpers ─────────────────────────────────────── */
const count = (d) => d?.totalElements ?? (Array.isArray(d) ? d.length : 0);
const records = (d) => (Array.isArray(d) ? d : d?.content ?? []);

// BUG-012: Guard against -0 and null
const fmt = (n) => (n == null ? '—' : (n === 0 || Object.is(n, -0)) ? '0' : n.toLocaleString());
const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ── sub-components ────────────────────────────────────── */

const Spinner = () => (
  <div style={{
    width: 20, height: 20, borderRadius: '50%',
    border: '2px solid #e5e7eb', borderTopColor: '#ff7b21',
    animation: 'spin .7s linear infinite', display: 'inline-block',
  }} />
);

const StatCard = ({ label, value, icon, color, bg, sub, loading, to }) => {
  const inner = (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
      padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start',
      gap: '1rem', borderLeft: `4px solid ${color}`,
      boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      transition: 'all .2s ease', cursor: to ? 'pointer' : 'default',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 22,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#0d1117', lineHeight: 1, letterSpacing: '-.04em' }}>
          {loading ? <Spinner /> : fmt(value)}
        </div>
        {sub && !loading && (
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontWeight: 500 }}>{sub}</div>
        )}
      </div>
    </div>
  );
  return to ? (
    <NavLink to={to} style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={e => e.currentTarget.firstChild.style.boxShadow = '0 4px 16px rgba(255,123,33,.15)'}
      onMouseLeave={e => e.currentTarget.firstChild.style.boxShadow = '0 1px 3px rgba(0,0,0,.04)'}>
      {inner}
    </NavLink>
  ) : inner;
};

const PipelineBar = ({ label, value, total, color, bg }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 7, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .6s ease' }} />
      </div>
    </div>
  );
};

const QuickCard = ({ to, icon, title, desc, color, bg, count: cnt, loading }) => (
  <NavLink to={to} style={{ textDecoration: 'none' }}>
    <div style={{
      background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14,
      padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      gap: '.625rem', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
      transition: 'all .2s ease', cursor: 'pointer', height: '100%',
    }}
      onMouseEnter={e => {
        Object.assign(e.currentTarget.style, {
          background: color, borderColor: color,
          boxShadow: `0 8px 24px ${color}44`, transform: 'translateY(-3px)',
        });
        e.currentTarget.querySelectorAll('[data-flip]').forEach(el => el.style.color = '#fff');
      }}
      onMouseLeave={e => {
        Object.assign(e.currentTarget.style, {
          background: '#fff', borderColor: '#e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,.04)', transform: 'translateY(0)',
        });
        e.currentTarget.querySelectorAll('[data-flip]').forEach(el => el.style.color = '');
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div data-flip style={{ fontSize: 14, fontWeight: 700, color: '#0d1117', marginBottom: 2, letterSpacing: '-.01em' }}>{title}</div>
        <div data-flip style={{ fontSize: 11, color: '#9ca3af' }}>{desc}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'space-between' }}>
        <span data-flip style={{ fontSize: 11, color, fontWeight: 700, background: bg, padding: '2px 8px', borderRadius: 99 }}>
          {loading ? '…' : `${fmt(cnt)} records`}
        </span>
        <span data-flip style={{ fontSize: 18, color: '#d1d5db', lineHeight: 1 }}>→</span>
      </div>
    </div>
  </NavLink>
);

const RecentRow = ({ r, formType }) => {
  const name = r.partName || r.item || '—';
  const date = r.dateOfInspection || r.inspectionDate || (r.date ? String(r.date) : null) || '—';
  const status = r.status || 'QC_ENTRY';
  const statusColors = {
    QC_ENTRY:     { bg: '#fff7ed', color: '#ea580c', label: 'Pending HOF' },
    HOF_APPROVED: { bg: '#ecfdf5', color: '#059669', label: 'HOF ✓' },
    HOD_APPROVED: { bg: '#eff6ff', color: '#2563eb', label: 'Fully Approved' },
  };
  const s = statusColors[status] || statusColors.QC_ENTRY;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0d1117', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 11, color: '#9ca3af' }}>{formType} · {date}</div>
      </div>
      <span style={{ background: s.bg, color: s.color, padding: '2px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
        {s.label}
      </span>
    </div>
  );
};

/* ── Main Dashboard ────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]     = useState({ qc: null, ms: null, mt: null, it: null });
  const [status, setStatus]   = useState({ pending: null, hofApp: null, hodApp: null, total: null });
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  const hasAccess = (formId) => {
    if (!user) return false;
    const role = user.role?.toUpperCase() || '';
    if (role.includes('ADMIN') || role.includes('HOD')) return true;
    return user.formPermissions?.includes(formId);
  };

  const isAdmin = user?.role?.toUpperCase()?.includes('ADMIN') || user?.role?.toUpperCase()?.includes('HOD');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const apis = [];
        if (hasAccess('QC_REGISTER'))     apis.push(axios.get('/api/qc-register?size=200').catch(() => ({ data: [] })));
        else                              apis.push(Promise.resolve({ data: [] }));
        if (hasAccess('MICRO_STRUCTURE')) apis.push(axios.get('/api/micro-structure?size=200').catch(() => ({ data: [] })));
        else                              apis.push(Promise.resolve({ data: [] }));
        if (hasAccess('TENSILE_TEST'))    apis.push(axios.get('/api/micro-tensile?size=200').catch(() => ({ data: [] })));
        else                              apis.push(Promise.resolve({ data: [] }));
        if (hasAccess('IMPACT_TEST'))     apis.push(axios.get('/api/impact-test?size=200').catch(() => ({ data: [] })));
        else                              apis.push(Promise.resolve({ data: [] }));

        const [qc, ms, mt, it] = await Promise.all(apis);

        const qcRecs = records(qc.data);
        const msRecs = records(ms.data);
        const mtRecs = records(mt.data);
        const itRecs = records(it.data);

        const qcCnt = count(qc.data) || qcRecs.length;
        const msCnt = count(ms.data) || msRecs.length;
        const mtCnt = count(mt.data) || mtRecs.length;
        const itCnt = count(it.data) || itRecs.length;

        setStats({ qc: qcCnt, ms: msCnt, mt: mtCnt, it: itCnt });

        // Approval status pipeline from all records
        const all = [...qcRecs, ...msRecs, ...mtRecs, ...itRecs];
        const totalAll  = all.length;
        const pending   = all.filter(r => r.status === 'QC_ENTRY').length;
        const hofApp    = all.filter(r => r.status === 'HOF_APPROVED').length;
        const hodApp    = all.filter(r => r.status === 'HOD_APPROVED').length;
        setStatus({ pending, hofApp, hodApp, total: totalAll });

        // Recent 8 records (latest by date across all)
        const allWithType = [
          ...qcRecs.map(r => ({ ...r, _form: 'QC Register' })),
          ...msRecs.map(r => ({ ...r, _form: 'Micro Structure' })),
          ...mtRecs.map(r => ({ ...r, _form: 'Tensile Test' })),
          ...itRecs.map(r => ({ ...r, _form: 'Impact Test' })),
        ];
        // sort by id desc (latest first)
        allWithType.sort((a, b) => (b.id || 0) - (a.id || 0));
        setRecent(allWithType.slice(0, 8));
      } catch (err) {
        console.warn('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalCount = (stats.qc || 0) + (stats.ms || 0) + (stats.mt || 0) + (stats.it || 0);

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Welcome Banner ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #041e4f 0%, #0a2d72 60%, #ff7b21 200%)',
        borderRadius: 16, padding: '1.5rem 2rem', marginBottom: '1.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(4,30,79,.25)', gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
            {greet()},
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-.02em', lineHeight: 1.2 }}>
            {user?.fullName || user?.username} 👋
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>
            {(user?.role || '').replace('ROLE_', '')} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>Total Records</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: '#ff7b21', lineHeight: 1, letterSpacing: '-.04em' }}>
            {loading ? '…' : fmt(totalCount)}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>across all modules</div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {hasAccess('QC_REGISTER') && (
          <StatCard label="QC Register Entries" value={stats.qc} icon="📋" color="#1e3a5f" bg="#dbeafe" loading={loading} to="/qc-register" sub="QF/08/FBQ-03 · Rev.01 dt 01.04.2022" />
        )}
        {hasAccess('MICRO_STRUCTURE') && (
          <StatCard label="Micro Structure Records" value={stats.ms} icon="🔬" color="#134e4a" bg="#ccfbf1" loading={loading} to="/micro-structure" sub="QF/08/FYQ-13 · Rev.01 dt 29.05.2024" />
        )}
        {hasAccess('TENSILE_TEST') && (
          <StatCard label="Tensile Test Reports" value={stats.mt} icon="📊" color="#78350f" bg="#fef3c7" loading={loading} to="/micro-tensile" sub="QF/08/FYQ-12 · Rev.01 dt 29.05.2024" />
        )}
        {hasAccess('IMPACT_TEST') && (
          <StatCard label="Impact Test Reports" value={stats.it} icon="⚡" color="#3b0764" bg="#f3e8ff" loading={loading} to="/impact-test" sub="QF/08/FYQ-19 · Rev.01 dt 29.05.2024" />
        )}
      </div>

      {/* ── Middle Row: Pipeline + Recent ────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>

        {/* Approval Pipeline */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span style={{ fontSize: 16 }}>🔄</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0d1117' }}>Approval Pipeline</span>
            {!loading && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>{status.total} total records</span>}
          </div>
          <div style={{ padding: '1.25rem' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}><Spinner /></div>
            ) : (
              <>
                <PipelineBar label="Pending HOF Review"  value={status.pending} total={status.total} color="#ea580c" bg="#fff7ed" />
                <PipelineBar label="Awaiting HOD Approval" value={status.hofApp}  total={status.total} color="#059669" bg="#ecfdf5" />
                <PipelineBar label="Fully Approved (HOD)" value={status.hodApp}  total={status.total} color="#2563eb" bg="#eff6ff" />
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '1rem' }}>
                  {[
                    { label: 'Pending', value: status.pending, color: '#ea580c', bg: '#fff7ed' },
                    { label: 'HOF ✓',   value: status.hofApp,  color: '#059669', bg: '#ecfdf5' },
                    { label: 'HOD ✓',   value: status.hodApp,  color: '#2563eb', bg: '#eff6ff' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} style={{ flex: 1, textAlign: 'center', background: bg, borderRadius: 10, padding: '8px 4px' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{fmt(value)}</div>
                      <div style={{ fontSize: 10, color, fontWeight: 600, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span style={{ fontSize: 16 }}>⏱️</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0d1117' }}>Recent Activity</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>Latest records</span>
          </div>
          <div style={{ padding: '0 1.25rem' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}><Spinner /></div>
            ) : recent.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No records yet</div>
            ) : (
              recent.map((r, i) => (
                <RecentRow key={`${r._form}-${r.id}-${i}`} r={r} formType={r._form} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Access Cards ─────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)', marginBottom: '1.75rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0d1117' }}>Quick Access</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>Click to open form</span>
        </div>
        <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
          {hasAccess('QC_REGISTER') && (
            <QuickCard to="/qc-register" icon="📋" title="QC Register" desc="QF/08/FBQ-03 · Rev.01 dt 01.04.2022"
              color="#1e3a5f" bg="#dbeafe" count={stats.qc} loading={loading} />
          )}
          {hasAccess('MICRO_STRUCTURE') && (
            <QuickCard to="/micro-structure" icon="🔬" title="Micro Structure" desc="QF/08/FYQ-13 · Rev.01 dt 29.05.2024"
              color="#134e4a" bg="#ccfbf1" count={stats.ms} loading={loading} />
          )}
          {hasAccess('TENSILE_TEST') && (
            <QuickCard to="/micro-tensile" icon="📊" title="Micro Tensile Test" desc="QF/08/FYQ-12 · Rev.01 dt 29.05.2024"
              color="#78350f" bg="#fef3c7" count={stats.mt} loading={loading} />
          )}
          {hasAccess('IMPACT_TEST') && (
            <QuickCard to="/impact-test" icon="⚡" title="Impact Test" desc="QF/08/FYQ-19 · Rev.01 dt 29.05.2024"
              color="#3b0764" bg="#f3e8ff" count={stats.it} loading={loading} />
          )}
          {isAdmin && (
            <QuickCard to="/reports" icon="📑" title="Logging & Reports" desc="Export quality data to Excel"
              color="#065f46" bg="#d1fae5" count={null} loading={false} />
          )}
        </div>
      </div>

      {/* ── System Info Bar ────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#f8f9fc,#fff)', border: '1px solid #e5e7eb',
        borderRadius: 12, padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'System', value: 'SACL Quality Management' },
            { label: 'Version', value: '2.0.0' },
            { label: 'Standard', value: 'IATF 16949:2016' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>All Systems Operational</span>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
