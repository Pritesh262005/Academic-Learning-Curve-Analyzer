import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useAuth } from './context/AuthContext';

import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { NotFoundPage } from './pages/common/NotFound';
import { NotificationsPage } from './pages/common/Notifications';
import { SettingsPage } from './pages/common/Settings';

import { StudentDashboard } from './pages/student/Dashboard';
import { StudentPerformancePage } from './pages/student/Performance';
import { StudentAttendancePage } from './pages/student/Attendance';
import { StudentAssignmentsPage } from './pages/student/Assignments';

import { FacultyDashboard } from './pages/faculty/Dashboard';
import { FacultyMarksPage } from './pages/faculty/Marks';
import { FacultyAttendancePage } from './pages/faculty/Attendance';
import { FacultyAnalyticsPage } from './pages/faculty/Analytics';
import { FacultyAssignmentsPage } from './pages/faculty/Assignments';
import { FacultyMessagesPage } from './pages/faculty/Messages';

import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUsersPage } from './pages/admin/Users';
import { AdminAnalyticsPage } from './pages/admin/Analytics';
import { AdminMessagesPage } from './pages/admin/Messages';

function RoleRedirect() {
  const { bootstrapping, isAuthenticated, user } = useAuth();
  if (bootstrapping) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedRoute roles={['student']} />}>
          <Route path="/student" element={<DashboardLayout role="student" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="performance" element={<StudentPerformancePage />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="assignments" element={<StudentAssignmentsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['faculty']} />}>
          <Route path="/faculty" element={<DashboardLayout role="faculty" />}>
            <Route index element={<FacultyDashboard />} />
            <Route path="marks" element={<FacultyMarksPage />} />
            <Route path="attendance" element={<FacultyAttendancePage />} />
            <Route path="analytics" element={<FacultyAnalyticsPage />} />
            <Route path="assignments" element={<FacultyAssignmentsPage />} />
            <Route path="messages" element={<FacultyMessagesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
