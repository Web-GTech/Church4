import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, FileText, Music, Calendar, Megaphone, BookOpen, DownloadCloud, DownloadCloud as // Added DownloadCloud
  Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin/overview', icon: LayoutDashboard, label: 'Visão Geral' },
    { path: '/admin/schedules', icon: Calendar, label: 'Escalas' },
    { path: '/admin/members', icon: Users, label: 'Membros' },
    { path: '/admin/liturgy', icon: FileText, label: 'Liturgia' },
    { path: '/admin/repertoire', icon: Music, label: 'Repertório' },
    { path: '/admin/ebd', icon: BookOpen, label: 'EBD' },
    { path: '/admin/notices', icon: Megaphone, label: 'Avisos' },
    { path: '/admin/downloads', icon: DownloadCloud, label: 'Downloads' }, // Added Downloads
    // { path: '/admin/settings', icon: Settings, label: 'Configurações' },
  ];

  const sidebarVariants = {
    open: { width: '16rem', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { width: '4.5rem', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  const itemVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
    closed: { opacity: 0, x: -10, transition: { duration: 0.1 } },
  };
  
  const iconVariants = {
    open: { rotate: 0 },
    closed: { rotate: 180 }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      className="fixed left-0 top-16 bottom-0 z-40 bg-card border-r shadow-md hidden md:flex flex-col admin-sidebar"
    >
      <div className="flex-1 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/admin/overview' && location.pathname === '/admin');
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-start h-12 px-4 admin-sidebar-item ${isActive ? 'active' : ''} ${!isOpen ? 'justify-center' : ''}`}
              title={item.label}
            >
              <Icon className={`h-5 w-5 admin-sidebar-icon ${isOpen ? 'mr-3' : 'mr-0'}`} />
              <AnimatePresence>
                {isOpen && (
                  <motion.span variants={itemVariants} initial="closed" animate="open" exit="closed" className="text-sm whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          );
        })}
      </div>
      <div className="p-4 border-t">
        <Button variant="ghost" onClick={handleLogout} className={`w-full flex items-center justify-start h-12 px-4 admin-sidebar-item ${!isOpen ? 'justify-center' : ''}`} title="Sair">
            <LogOut className={`h-5 w-5 admin-sidebar-icon ${isOpen ? 'mr-3' : 'mr-0'}`} />
            <AnimatePresence>
            {isOpen && (
                <motion.span variants={itemVariants} initial="closed" animate="open" exit="closed" className="text-sm whitespace-nowrap">
                Sair
                </motion.span>
            )}
            </AnimatePresence>
        </Button>
        <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-card hover:bg-muted border rounded-full h-8 w-8 shadow"
            aria-label={isOpen ? "Fechar sidebar" : "Abrir sidebar"}
        >
            <motion.div variants={iconVariants} animate={isOpen ? "open" : "closed"}>
                <ChevronLeft className="h-4 w-4" />
            </motion.div>
        </Button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;