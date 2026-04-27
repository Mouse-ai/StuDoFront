import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FloatingIsland } from './components/FloatingIsland';
import { LandingPage } from './components/LandingPage';
import { TasksPage } from './components/TasksPage';
import { TaskPage } from './components/TaskPage';
import { CoursesPage } from './components/CoursesPage';
import { ProfilePage } from './components/ProfilePage';
import { ProtectedLayout } from './components/ProtectedLayout';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminUsers } from './components/AdminUsers';
import type { UserRole } from './types';

// Компонент для защиты ролей
function RoleGuard({ allowedRoles, children }: { allowedRoles: UserRole[]; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Загрузка...</div>;
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  return (
    // Добавляем key для корректной работы с location если нужно, но без анимации переходов это опционально
    <div key={location.pathname} className="relative min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 text-gray-900">
      <Routes location={location}>
        <Route path="/" element={<><FloatingIsland /><LandingPage /></>} />

        <Route element={<RoleGuard allowedRoles={['student']}><ProtectedLayout /></RoleGuard>}>
          <Route path="/student/tasks" element={<TasksPage />} />
          <Route path="/student/tasks/:id" element={<TaskPage />} />
          <Route path="/student/courses" element={<CoursesPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><AdminLayout /></RoleGuard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="profile" element={<ProfilePage />} />
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