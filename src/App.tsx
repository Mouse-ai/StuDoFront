import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FloatingIsland } from './components/FloatingIsland';
import { LandingPage } from './components/LandingPage';
import { TasksPage } from './components/TasksPage';
import { ProfilePage } from './components/ProfilePage';
import { ProtectedLayout } from './components/ProtectedLayout';
import { PageTransition } from './components/PageTransition';

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Загрузка...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="relative min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 text-gray-900">
      <Routes location={location}>
        <Route path="/" element={
          <>
            <FloatingIsland />
            <PageTransition><LandingPage /></PageTransition>
          </>
        } />

        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/tasks" element={<PageTransition><TasksPage /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}