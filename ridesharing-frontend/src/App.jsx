import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyRides from './pages/MyRides';
import CreateRide from './components/rides/CreateRide';
import SearchRides from './components/rides/SearchRides';
import RideDetails from './components/rides/RideDetails';
import { useAuth } from './hooks/useAuth';

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route element={<Layout />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/rides/search" element={<SearchRides />} />
        <Route path="/rides/:id" element={<RideDetails />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/rides/create" element={<ProtectedRoute><CreateRide /></ProtectedRoute>} />
        <Route path="/my-rides" element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-custom',
            duration: 3500,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
