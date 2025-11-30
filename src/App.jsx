import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import PublicHome from './pages/PublicHome';
import PublicEventDetails from './pages/PublicEventDetails';
import RegistrationSuccess from './pages/RegistrationSuccess';

// Admin Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import RegisteredParticipants from './pages/RegisteredParticipants';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes - No Authentication Required */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/events/:id" element={<PublicEventDetails />} />
          <Route path="/registration/success" element={<RegistrationSuccess />} />

          {/* Admin Routes - Authentication Required */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<Register />} />
          
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <PrivateRoute>
                <Events />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events/create"
            element={
              <PrivateRoute>
                <CreateEvent />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events/:id"
            element={
              <PrivateRoute>
                <EventDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events/:id/edit"
            element={
              <PrivateRoute>
                <CreateEvent />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/events/:id/participants"
            element={
              <PrivateRoute>
                <RegisteredParticipants />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Redirect old routes to new structure */}
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/register" element={<Navigate to="/admin/register" replace />} />
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
