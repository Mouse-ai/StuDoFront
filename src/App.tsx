import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FloatingIsland } from './components/FloatingIsland';
import { LandingPage } from './components/LandingPage';
import { TasksPage } from './components/TasksPage';
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

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="relative min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 text-gray-900">
      <Routes location={location}>
        <Route path="/" element={<><FloatingIsland /><PageTransition><LandingPage /></PageTransition></>} />

        <Route element={<ProtectedLayout />}>
          <Route path="/student/tasks" element={<RoleGuard allowedRoles={['student']}><PageTransition><TasksPage /></PageTransition></RoleGuard>} />
          <Route path="/student/profile" element={<RoleGuard allowedRoles={['student']}><PageTransition><ProfilePage /></PageTransition></RoleGuard>} />
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
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}