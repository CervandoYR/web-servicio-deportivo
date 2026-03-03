import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { useEffect } from 'react';
import { useAcademyTheme } from './hooks/useAcademyTheme';

import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import StudentsPage from './pages/students/StudentsPage';
import StudentDetailPage from './pages/students/StudentDetailPage';
import TrainersPage from './pages/trainers/TrainersPage';
import GroupsPage from './pages/groups/GroupsPage';
import GroupDetailPage from './pages/groups/GroupDetailPage';
import AttendancePage from './pages/attendance/AttendancePage';
import PaymentsPage from './pages/payments/PaymentsPage';
import LeadsPage from './pages/leads/LeadsPage';
import CampaignsPage from './pages/campaigns/CampaignsPage';
import LandingEditorPage from './pages/landing/LandingEditorPage';
import SettingsPage from './pages/settings/SettingsPage';
import AppLayout from './components/layout/AppLayout';
import PublicLanding from './pages/public/PublicLanding';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppThemeProvider({ children }: { children: React.ReactNode }) {
  useAcademyTheme();
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppThemeProvider>
        <Routes>
          <Route path="/" element={<Navigate to={`/${import.meta.env.VITE_ACADEMY_SLUG || 'academia-elite'}`} replace />} />
          <Route path="/:slug" element={<PublicLanding />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/:id" element={<StudentDetailPage />} />
            <Route path="trainers" element={<TrainersPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="groups/:id" element={<GroupDetailPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="landing" element={<LandingEditorPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppThemeProvider>
    </BrowserRouter>
  );
}
