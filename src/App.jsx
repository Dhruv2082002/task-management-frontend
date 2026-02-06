import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const Dashboard = () => {
  // This will be replaced by the actual Dashboard page component properly
  return <div>Dashboard Placeholder</div>;
};

// Start real Dashboard import
import RealDashboard from './pages/Dashboard';

import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-center" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <RealDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
