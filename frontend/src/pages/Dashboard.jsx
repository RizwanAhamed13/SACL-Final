import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ qc: null, ms: null, mt: null, it: null });
  const [loading, setLoading] = useState(true);
  
  const hasAccess = (formId) => {
    if (!user) return false;
    const role = user.role?.toUpperCase() || '';
    // Only Admin and HOD have global access. HOF and QC must have explicit permissions.
    if (role.includes('ADMIN') || role.includes('HOD')) return true;
    return user.formPermissions?.includes(formId);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Temporary artificial delay to see skeletons
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const [qc, ms, mt, it] = await Promise.all([
          axios.get('/api/qc-register').catch(() => ({ data: [] })),
          axios.get('/api/micro-structure').catch(() => ({ data: [] })),
          axios.get('/api/micro-tensile').catch(() => ({ data: [] })),
          axios.get('/api/impact-test').catch(() => ({ data: [] }))
        ]);
        setStats({
          qc: qc.data.length,
          ms: ms.data.length,
          mt: mt.data.length,
          it: it.data.length
        });
      } catch (err) {
        console.warn("Could not load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quality Management</h1>
          <p className="page-subtitle">Overview of all quality inspection records</p>
        </div>
      </div>

      <div className="stats-grid">
        {hasAccess('QC_REGISTER') && (
          <div className="stat-card">
            <div className="stat-label">QC Register Entries</div>
            <div className="stat-value">
              {loading ? <Skeleton width="60px" height="32px" /> : stats.qc}
            </div>
          </div>
        )}
        {hasAccess('MICRO_STRUCTURE') && (
          <div className="stat-card">
            <div className="stat-label">Micro Structure Records</div>
            <div className="stat-value">
              {loading ? <Skeleton width="60px" height="32px" /> : stats.ms}
            </div>
          </div>
        )}
        {hasAccess('TENSILE_TEST') && (
          <div className="stat-card">
            <div className="stat-label">Tensile Test Reports</div>
            <div className="stat-value">
              {loading ? <Skeleton width="60px" height="32px" /> : stats.mt}
            </div>
          </div>
        )}
        {hasAccess('IMPACT_TEST') && (
          <div className="stat-card">
            <div className="stat-label">Impact Test Reports</div>
            <div className="stat-value">
              {loading ? <Skeleton width="60px" height="32px" /> : stats.it}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quality Forms</h2>
        </div>
        <div className="card-body">
          <div className="quick-links">
            {hasAccess('QC_REGISTER') && (
              <NavLink to="/qc-register" className="quick-link">
                <svg className="quick-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <div className="quick-link-title">QC Register</div>
                <div className="quick-link-desc">QF/08/FBQ-03 · Rev.02</div>
              </NavLink>
            )}
            {hasAccess('MICRO_STRUCTURE') && (
              <NavLink to="/micro-structure" className="quick-link">
                <svg className="quick-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <div className="quick-link-title">Micro Structure</div>
                <div className="quick-link-desc">QF/08/FYQ-13 · Rev.01</div>
              </NavLink>
            )}
            {hasAccess('TENSILE_TEST') && (
              <NavLink to="/micro-tensile" className="quick-link">
                <svg className="quick-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <div className="quick-link-title">Micro Tensile Test</div>
                <div className="quick-link-desc">QF/08/FYQ-12 · Rev.01</div>
              </NavLink>
            )}
            {hasAccess('IMPACT_TEST') && (
              <NavLink to="/impact-test" className="quick-link">
                <svg className="quick-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <div className="quick-link-title">Impact Test</div>
                <div className="quick-link-desc">QF/08/FYQ-19 · Rev.01</div>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
