import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '2px solid var(--color-primary-600)',
          borderTopColor: 'transparent',
          borderRadius: '9999px',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '2px solid var(--color-primary-600)',
          borderTopColor: 'transparent',
          borderRadius: '9999px',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="roles" element={<Roles />} />
              <Route path="profile" element={<Profile />} />
              <Route
                path="settings"
                element={
                  <div className="card">
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Paramètres
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Page en construction...</p>
                  </div>
                }
              />
            </Route>

            {/* 404 */}
            <Route
              path="*"
              element={
                <div style={{
                  minHeight: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <h1 style={{
                      fontSize: '4rem',
                      fontWeight: 'bold',
                      color: '#111827',
                      marginBottom: '1rem'
                    }}>
                      404
                    </h1>
                    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Page non trouvée</p>
                    <a href="/" className="btn-primary">
                      Retour à l'accueil
                    </a>
                  </div>
                </div>
              }
            />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;