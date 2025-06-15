import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import AdminSidebar from '@/components/admin/AdminSidebar'; 

const Layout = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'; 
    }
    return null;
  }

  const isAdminPage = location.pathname.startsWith('/admin');
  const isMessagesPage = location.pathname.startsWith('/messages');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      <div className={`flex flex-1 pt-16 ${isAdminPage ? 'md:pl-0' : ''} overflow-hidden`}>
        {isAdminPage && isAdmin && (
          <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        )}
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out 
            ${isAdminPage && isAdmin && isSidebarOpen ? 'md:ml-64' : 'md:ml-0'} 
            ${isMessagesPage ? 'pb-0 full-height-page' : 'pb-20 md:pb-0'} 
            overflow-y-auto overflow-x-hidden`}
        >
          {children}
        </main>
      </div>
      {(!isAdminPage && !isMessagesPage) && <BottomNavigation />}
      {/* Removed placeholder for BottomNav on messages for mobile, as chat will be full height */}
    </div>
  );
};

export default Layout;