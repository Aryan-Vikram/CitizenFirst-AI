import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Sidebar from './components/Sidebar.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

import Landing from './pages/Landing.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import About from './pages/About.jsx';
import HelpCenter from './pages/HelpCenter.jsx';
import Login from './pages/Login.jsx';
import ReportRequest from './pages/ReportRequest.jsx';
import CaseDetails from './pages/CaseDetails.jsx';
import MyRequests from './pages/MyRequests.jsx';
import CitizenDashboard from './pages/CitizenDashboard.jsx';
import GovernmentDashboard from './pages/GovernmentDashboard.jsx';
import DepartmentDashboard from './pages/DepartmentDashboard.jsx';
import OfficerDashboard from './pages/OfficerDashboard.jsx';
import GISIntelligence from './pages/GISIntelligence.jsx';
import InteroperabilityHub from './pages/InteroperabilityHub.jsx';
import Analytics from './pages/Analytics.jsx';
import AIInsights from './pages/AIInsights.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AppLayout({ children }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role={user?.role || 'citizen'} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
        <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/help" element={<PublicLayout><HelpCenter /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/report" element={<PublicLayout><ReportRequest /></PublicLayout>} />
        <Route path="/case/:caseId" element={<PublicLayout><CaseDetails /></PublicLayout>} />
        <Route path="/interoperability" element={<PublicLayout><InteroperabilityHub /></PublicLayout>} />

        {/* Citizen */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['citizen']}><AppLayout><CitizenDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/my-requests" element={<ProtectedRoute roles={['citizen']}><AppLayout><MyRequests /></AppLayout></ProtectedRoute>} />

        {/* Field officer */}
        <Route path="/officer" element={<ProtectedRoute roles={['field_officer']}><AppLayout><OfficerDashboard /></AppLayout></ProtectedRoute>} />

        {/* Department admin */}
        <Route path="/department" element={<ProtectedRoute roles={['department_admin']}><AppLayout><DepartmentDashboard /></AppLayout></ProtectedRoute>} />

        {/* Government admin */}
        <Route path="/command-center" element={<ProtectedRoute roles={['government_admin']}><AppLayout><GovernmentDashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/ai-insights" element={<ProtectedRoute roles={['government_admin']}><AppLayout><AIInsights /></AppLayout></ProtectedRoute>} />

        {/* Shared authenticated */}
        <Route path="/gis" element={<ProtectedRoute><AppLayout><GISIntelligence /></AppLayout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />

        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
      <ToastContainer />
    </>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-content px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-ink-soft">The page you're looking for doesn't exist.</p>
    </div>
  );
}
