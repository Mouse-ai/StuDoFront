import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FloatingIsland } from './components/FloatingIsland';
import { LandingPage } from './components/LandingPage';
import { TasksPage } from './components/TasksPage';
import { TaskPage } from './components/TaskPage';
import { ProfilePage } from './components/ProfilePage';
import { ProtectedLayout } from './components/ProtectedLayout';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminUsers } from './components/AdminUsers';
import { PageTransition } from './components/PageTransition';
import type { UserRole } from './types';

function RoleGuard({ allowedRoles, children }: { allowedRoles: UserRole[]; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Загрузка...</div>;
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="relative min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 text-gray-900">
      <Routes location={location}>
        <Route path="/" element={<><FloatingIsland /><PageTransition><LandingPage /></PageTransition></>} />
        <Route element={<RoleGuard allowedRoles={['student']}><ProtectedLayout /></RoleGuard>}>
          <Route path="/student/tasks" element={<PageTransition><TasksPage /></PageTransition>} />
          <Route path="/student/tasks/:id" element={<PageTransition><TaskPage /></PageTransition>} />
          <Route path="/student/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
        </Route>
        <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><AdminLayout /></RoleGuard>}>
          <Route index element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="users" element={<PageTransition><AdminUsers /></PageTransition>} />
          <Route path="profile" element={<PageTransition><ProfilePage /></PageTransition>} />
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
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}