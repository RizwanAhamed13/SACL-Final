import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/image.png';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem('sidebarCollapsed') === 'true' && window.innerWidth > 992
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 992) {
      setSidebarOpen(!sidebarOpen);
    } else {
      const newCollapsed = !sidebarCollapsed;
      setSidebarCollapsed(newCollapsed);
      localStorage.setItem('sidebarCollapsed', newCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        closeMobileSidebar();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasAccess = (formId) => {
    if (!user) return false;
    const role = user.role?.toUpperCase() || '';
    // Only Admin and HOD have global access. HOF and QC must have explicit permissions.
    if (role.includes('ADMIN') || role.includes('HOD')) return true;
    return user.formPermissions?.includes(formId);
  };

  return (
    <div className={`app-container`}>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <img src={logo} alt="SACL" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <div className="logo-text">
              <span className="logo-title">SACL</span>
              <span className="logo-subtitle">Quality System</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main</div>
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end onClick={closeMobileSidebar}>
              <svg className="nav-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </NavLink>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Quality Forms</div>
            {hasAccess('QC_REGISTER') && (
              <NavLink to="/qc-register" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <svg className="nav-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                QC Register
              </NavLink>
            )}
            {hasAccess('MICRO_STRUCTURE') && (
              <NavLink to="/micro-structure" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <svg className="nav-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Micro Structure
              </NavLink>
            )}
            {hasAccess('TENSILE_TEST') && (
              <NavLink to="/micro-tensile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <svg className="nav-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Tensile Test
              </NavLink>
            )}
            {hasAccess('IMPACT_TEST') && (
              <NavLink to="/impact-test" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <svg className="nav-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Impact Test
              </NavLink>
            )}
            {hasAccess('PROBLEM_LOG') && (
              <NavLink to="/problem-log" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <svg className="nav-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Problem Log
              </NavLink>
            )}
          </div>

          {(user?.role?.toUpperCase()?.includes('ADMIN') || user?.role?.toUpperCase()?.includes('HOD')) && (
            <div className="nav-section">
              <div className="nav-section-title">Administration</div>
              <NavLink to="/part-names" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <svg className="nav-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
                Part Names
              </NavLink>
              <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <svg className="nav-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                User Management
              </NavLink>
              <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <svg className="nav-link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Logging & Reports
              </NavLink>
            </div>
          )}
          

        </nav>
        
        {/* Sidebar footer — user info + logout */}
        <div style={{ padding: '1rem .75rem', borderTop: '1px solid rgba(255,255,255,.1)', marginTop: 'auto', flexShrink: 0 }}>
          {/* User info chip */}
          <div style={{ display:'flex', alignItems:'center', gap:'.625rem', padding:'.625rem .75rem', marginBottom:'.5rem', background:'rgba(255,255,255,.07)', borderRadius:'10px' }}>
            <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'linear-gradient(135deg,#ff7b21,#e86a14)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'12px', fontWeight:700, color:'#fff' }}>
              {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:'.75rem', fontWeight:600, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', lineHeight:1.2 }}>
                {user?.fullName || user?.username}
              </div>
              <div style={{ fontSize:'.65rem', color:'rgba(255,255,255,.45)', lineHeight:1.2, textTransform:'uppercase', letterSpacing:'.04em' }}>
                {(user?.role || '').replace('ROLE_', '')}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '.625rem',
              padding: '.5rem .75rem', background: 'rgba(239,68,68,.12)', border: 'none',
              cursor: 'pointer', color: '#fca5a5', borderRadius: '8px',
              fontWeight: 600, fontSize: '.8rem', transition: 'all .15s ease',
              letterSpacing:'-.01em',
            }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(239,68,68,.22)'; e.currentTarget.style.color='#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background='rgba(239,68,68,.12)'; e.currentTarget.style.color='#fca5a5'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <button className="sidebar-toggle" onClick={toggleSidebar} title="Toggle sidebar">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#ff7b21', display:'inline-block' }}></span>
              <span className="header-title">SACL Quality Management</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="header-user">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {(user?.role || '').replace('ROLE_', '')}
            </div>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
        
        <footer className="footer">SACL Quality Management System &copy; 2026</footer>
      </div>

      <div id="sidebarOverlay" className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={closeMobileSidebar}></div>
    </div>
  );
};
