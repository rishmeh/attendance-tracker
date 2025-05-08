import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import App from './App.jsx'
import AppState from '../context/AppState.jsx'
import Configure from './Configure.jsx'
import Login from './Login.jsx'
import Stats from './Stats.jsx'


// Auth guard component to protect routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/login" replace />;
  }
  return children;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppState>
      <BrowserRouter>
       
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          } />
          <Route path="/configure" element={
            <ProtectedRoute>
              <Configure />
            </ProtectedRoute>
          } />
          <Route path="/stats" element={
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          } />
          {/* Redirect all other routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppState>
  </StrictMode>,
)