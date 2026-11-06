import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ExploreEvents } from './pages/public/ExploreEvents';
import { EventDetails } from './pages/public/EventDetails';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AboutPage } from './pages/public/AboutPage';

// Common Authenticated Pages
import { NotificationsPage } from './pages/common/NotificationsPage';
import { ProfilePage } from './pages/common/ProfilePage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyRegistrations } from './pages/student/MyRegistrations';
import { MyTickets } from './pages/student/MyTickets';
import { CertificatesPage } from './pages/student/CertificatesPage';

// Organizer Pages
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { CreateEvent } from './pages/organizer/CreateEvent';
import { ManageEvents } from './pages/organizer/ManageEvents';
import { EditEvent } from './pages/organizer/EditEvent';
import { ParticipantManagement } from './pages/organizer/ParticipantManagement';
import { QRScannerPage } from './pages/organizer/QRScannerPage';
import { OrganizerAnalytics } from './pages/organizer/OrganizerAnalytics';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { EventApproval } from './pages/admin/EventApproval';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#111827',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '500',
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<ExploreEvents />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Common Protected Routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student', 'organizer', 'admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-registrations"
          element={
            <ProtectedRoute allowedRoles={['student', 'organizer', 'admin']}>
              <MyRegistrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute allowedRoles={['student', 'organizer', 'admin']}>
              <MyTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-certificates"
          element={
            <ProtectedRoute allowedRoles={['student', 'organizer', 'admin']}>
              <CertificatesPage />
            </ProtectedRoute>
          }
        />

        {/* Organizer Routes */}
        <Route
          path="/organizer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <ManageEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/new"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <EditEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:id/participants"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <ParticipantManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/scanner"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <QRScannerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/analytics"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <OrganizerAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EventApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

