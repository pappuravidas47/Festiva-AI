import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Toaster } from 'react-hot-toast';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { AIPlanDetailsPage } from './pages/AIPlanDetailsPage';
import { BudgetManagerPage } from './pages/BudgetManagerPage';
import { TimelinePage } from './pages/TimelinePage';
import { VendorManagerPage } from './pages/VendorManagerPage';
import { GuestManagerPage } from './pages/GuestManagerPage';
import { InspirationStudioPage } from './pages/InspirationStudioPage';
import { ExportPrintPage } from './pages/ExportPrintPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-festiva-warm">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '16px',
                background: '#1E293B',
                color: '#fff',
                fontSize: '13px',
              },
            }}
          />

          <div className="no-print">
            <Navbar />
          </div>

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/inspiration" element={<InspirationStudioPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <MyEventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-event/:id"
                element={
                  <ProtectedRoute>
                    <EditEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/plan"
                element={
                  <ProtectedRoute>
                    <AIPlanDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/budget"
                element={
                  <ProtectedRoute>
                    <BudgetManagerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/timeline"
                element={
                  <ProtectedRoute>
                    <TimelinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/vendors"
                element={
                  <ProtectedRoute>
                    <VendorManagerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/guests"
                element={
                  <ProtectedRoute>
                    <GuestManagerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/export"
                element={
                  <ProtectedRoute>
                    <ExportPrintPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <div className="no-print">
            <Footer />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
