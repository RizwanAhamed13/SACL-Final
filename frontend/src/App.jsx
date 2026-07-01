import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import QcRegister from './pages/QcRegister';

import MicroStructure from './pages/MicroStructure';
import MicroTensile from './pages/MicroTensile';
import ImpactTest from './pages/ImpactTest';
import PartNames from './pages/PartNames';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import EmployeeEfficiency from './pages/EmployeeEfficiency';
import HofRemarks from './pages/HofRemarks';

import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              fontSize: '16px',
              padding: '16px',
              borderRadius: '12px',
              maxWidth: '500px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          }}
        />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="qc-register" element={<ProtectedRoute requiredPermission="QC_REGISTER"><QcRegister /></ProtectedRoute>} />
              <Route path="micro-structure" element={<ProtectedRoute requiredPermission="MICRO_STRUCTURE"><MicroStructure /></ProtectedRoute>} />
              <Route path="micro-tensile" element={<ProtectedRoute requiredPermission="TENSILE_TEST"><MicroTensile /></ProtectedRoute>} />
              <Route path="impact-test" element={<ProtectedRoute requiredPermission="IMPACT_TEST"><ImpactTest /></ProtectedRoute>} />

              <Route path="part-names" element={<ProtectedRoute requiredRole="ADMIN"><PartNames /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute requiredRole="ADMIN"><UserManagement /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute requiredRole="ADMIN"><Reports /></ProtectedRoute>} />
              <Route path="efficiency" element={<ProtectedRoute requiredRole="ADMIN"><EmployeeEfficiency /></ProtectedRoute>} />
              <Route path="inspector-feedback" element={<ProtectedRoute requiredRole="HOF"><HofRemarks /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
