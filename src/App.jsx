import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import PublicLiturgy from '@/pages/PublicLiturgy'; 

// Lazy load pages
const Home = lazy(() => import('@/pages/Home'));
const Profile = lazy(() => import('@/pages/Profile'));
const Liturgy = lazy(() => import('@/pages/Liturgy'));
const Repertoire = lazy(() => import('@/pages/Repertoire'));
const Schedules = lazy(() => import('@/pages/Schedules'));
const Bible = lazy(() => import('@/pages/Bible'));
const EBD = lazy(() => import('@/pages/EBD'));
const StudyDetail = lazy(() => import('@/pages/StudyDetail')); 
const NoticeBoard = lazy(() => import('@/pages/NoticeBoard'));
const Offering = lazy(() => import('@/pages/Offering'));
const Admin = lazy(() => import('@/pages/Admin'));
const Organogram = lazy(() => import('@/pages/Organogram'));
const Messages = lazy(() => import('@/pages/Messages'));
const Downloads = lazy(() => import('@/pages/Downloads')); 

// Lazy load admin components
const AdminOverview = lazy(() => import('@/components/admin/AdminOverview'));
const ManageSchedules = lazy(() => import('@/components/admin/ManageSchedules'));
const ManageMembers = lazy(() => import('@/components/admin/ManageMembers'));
const ManageLiturgy = lazy(() => import('@/components/admin/ManageLiturgy'));
const ManageRepertoire = lazy(() => import('@/components/admin/ManageRepertoire'));
const ManageEBD = lazy(() => import('@/components/admin/ManageEBD'));
const ManageNotices = lazy(() => import('@/components/admin/ManageNotices'));
const ManageDownloads = lazy(() => import('@/components/admin/ManageDownloads')); 

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span className="ml-3 text-lg">Carregando...</span>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); 
  const location = useLocation();

  if (loading) {
    return <LoadingFallback />;
  }
  
  if (!user) {
    if (location.pathname !== '/login' && location.pathname !== '/register' && !location.pathname.startsWith('/liturgy/public/')) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children; 
  }

  return children;
};

const AdminLayout = () => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Admin />;
};


function AppRoutes() {
  const { user, loading } = useAuth(); 

  if (loading) { 
    return <LoadingFallback />;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
      <Route path="/liturgy/public/:liturgyId" element={<PublicLiturgy />} />
      
      <Route 
        path="/*" 
        element={
          <ProtectedRoute> 
            {user ? ( 
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  <Route path="/liturgy" element={<Liturgy />} />
                  <Route path="/repertoire" element={<Repertoire />} />
                  <Route path="/schedules" element={<Schedules />} />
                  <Route path="/bible" element={<Bible />} />
                  <Route path="/ebd" element={<EBD />} />
                  <Route path="/ebd/study/:studyId" element={<StudyDetail />} /> 
                  <Route path="/notice-board" element={<NoticeBoard />} />
                  <Route path="/offering" element={<Offering />} />
                  <Route path="/organogram" element={<Organogram />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/messages/:conversationId" element={<Messages />} />
                  <Route path="/downloads" element={<Downloads />} />
                  
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route path="overview" element={<AdminOverview />} />
                    <Route path="schedules" element={<ManageSchedules />} />
                    <Route path="members" element={<ManageMembers />} />
                    <Route path="liturgy" element={<ManageLiturgy />} />
                    <Route path="repertoire"
                    element={<ManageRepertoire />} />
                    <Route path="ebd" element={<ManageEBD />} />
                    <Route path="notices" element={<ManageNotices />} />
                    <Route path="downloads" element={<ManageDownloads />} />
                    <Route index element={<Navigate to="overview" replace />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Routes>
                 <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            )}
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}


function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <div className="min-h-screen bg-background flex flex-col">
              <AppRoutes />
            </div>
            <Toaster />
          </Suspense>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;