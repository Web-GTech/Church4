import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, FileText, Music, Calendar, Megaphone, BookOpen, DownloadCloud, DownloadCloud as // Adicionado DownloadCloud
  Shield, Settings, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminOverview from '@/components/admin/AdminOverview';
import ManageSchedules from '@/components/admin/ManageSchedules';
import ManageMembers from '@/components/admin/ManageMembers';
import ManageLiturgy from '@/components/admin/ManageLiturgy';
import ManageRepertoire from '@/components/admin/ManageRepertoire';
import ManageEBD from '@/components/admin/ManageEBD';
import ManageNotices from '@/components/admin/ManageNotices';
import ManageDownloads from '@/components/admin/ManageDownloads'; // Adicionado ManageDownloads

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTabFromPath = () => {
    const pathSegments = location.pathname.split('/');
    return pathSegments[2] || 'overview'; 
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  const navigateToTab = (tabId) => {
    setActiveTab(tabId); // Atualiza o estado local primeiro para resposta visual imediata
    navigate(`/admin/${tabId}`);
  };

  const adminSections = {
    overview: { component: <AdminOverview setActiveTab={navigateToTab} />, title: "Visão Geral", icon: LayoutDashboard },
    schedules: { component: <ManageSchedules />, title: "Gerenciar Escalas", icon: Calendar },
    members: { component: <ManageMembers />, title: "Gerenciar Membros", icon: Users },
    liturgy: { component: <ManageLiturgy />, title: "Gerenciar Liturgia", icon: FileText },
    repertoire: { component: <ManageRepertoire />, title: "Gerenciar Repertório", icon: Music },
    ebd: { component: <ManageEBD />, title: "Gerenciar EBD", icon: BookOpen },
    notices: { component: <ManageNotices />, title: "Gerenciar Avisos", icon: Megaphone },
    downloads: { component: <ManageDownloads />, title: "Gerenciar Downloads", icon: DownloadCloud }, // Adicionado Downloads
  };

  const CurrentComponent = adminSections[activeTab]?.component || <AdminOverview setActiveTab={navigateToTab} />;
  const currentTitle = adminSections[activeTab]?.title || "Painel Administrativo";

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground border-0 overflow-hidden relative shadow-xl">
          <div className="absolute inset-0 church-pattern opacity-10"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Shield className="h-7 w-7 sm:h-8 sm:w-8" />
                  <h1 className="text-xl sm:text-2xl font-bold">{currentTitle}</h1>
                </div>
                <p className="text-sm sm:text-base text-primary-foreground/80">
                  Bem-vindo, {user?.firstName}! Gerencie todos os aspectos da igreja.
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-primary-foreground/80">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {activeTab !== 'overview' && (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Button variant="outline" onClick={() => navigateToTab('overview')} className="mb-4 text-sm">
                <ChevronLeft className="h-4 w-4 mr-1.5" />
                Voltar para Visão Geral
            </Button>
         </motion.div>
      )}

      <motion.div 
        key={activeTab} 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {CurrentComponent}
      </motion.div>
    </div>
  );
};

export default Admin;