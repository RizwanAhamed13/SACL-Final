import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/image.png';

const Login = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { employeeId, password });
      login(response.data.user, response.data.token);
      // User is redirected in context or via protected routes automatically when auth state updates
      window.location.href = '/'; 
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', margin: '1rem', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <img src={logo} alt="SACL Logo" style={{ width: '80px', height: 'auto' }} />
          </div>
          <h1 className="page-title" style={{ margin: 0, textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>SACL Quality</h1>
          <p className="page-subtitle" style={{ margin: '0.5rem 0 0', textAlign: 'center' }}>Enterprise Quality Management System</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--color-error-light)', color: 'var(--color-error)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label required">Employee ID</label>
            <input
              type="text"
              className="form-control"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              placeholder="Enter your Employee ID"
            />
          </div>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label required">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', justifyContent: 'center', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
