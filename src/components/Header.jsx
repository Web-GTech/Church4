import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, User, Bell, Home, BookOpen as IconBookOpen, Music, CalendarDays, Settings, LogOut, Church, Menu, X, Users, DownloadCloud, MessageSquare as MessageIcon } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = React.useState(0);


  useEffect(() => {
    const updateCounts = () => {
      const unreadNotices = JSON.parse(localStorage.getItem('church-synch-notifications-unread')) || [];
      setNotificationCount(unreadNotices.length);

      const storedConversations = JSON.parse(localStorage.getItem('church-synch-conversations')) || [];
      const totalUnreadMessages = storedConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadMessagesCount(totalUnreadMessages);
    };
    
    updateCounts(); // Initial count

    window.addEventListener('newNotification', updateCounts);
    window.addEventListener('messageUpdate', updateCounts); // Listen for message updates
    
    return () => {
      window.removeEventListener('newNotification', updateCounts);
      window.removeEventListener('messageUpdate', updateCounts);
    };
  }, []);

  const handleBellClick = () => {
    localStorage.setItem('church-synch-notifications-unread', JSON.stringify([]));
    setNotificationCount(0);
    navigate('/notice-board');
    if(isMobileMenuOpen) setIsMobileMenuOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    if(isMobileMenuOpen) setIsMobileMenuOpen(false);
  }

  const mainNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/liturgy', label: 'Liturgia', icon: IconBookOpen },
    { path: '/repertoire', label: 'Repertório', icon: Music },
    { path: '/schedules', label: 'Escalas', icon: CalendarDays },
    { path: '/downloads', label: 'Downloads', icon: DownloadCloud },
    { path: '/messages', label: 'Mensagens', icon: MessageIcon, notificationCount: unreadMessagesCount },
  ];

  const mobileSheetNavItems = [
    ...mainNavItems,
    { path: '/bible', label: 'Bíblia', icon: IconBookOpen },
    { path: '/ebd', label: 'EBD', icon: IconBookOpen },
    { path: '/notice-board', label: 'Avisos', icon: Bell, isNotificationBell: true, notificationCount: notificationCount },
    { path: '/offering', label: 'Ofertar', icon: Church },
    { path: '/organogram', label: 'Organograma', icon: Users },
  ];

  if (isAdmin) {
    mobileSheetNavItems.push({ path: '/admin', label: 'Admin', icon: Settings });
  }
  
  const NavLink = ({ path, label, icon: Icon, isSheet = false, notificationCount: itemNotificationCount, isNotificationBell = false }) => {
    const isActive = location.pathname === path || 
                     (path === '/ebd' && location.pathname.startsWith('/ebd/study/')) ||
                     (path === '/messages' && location.pathname.startsWith('/messages'));
    
    const effectiveNotificationCount = isNotificationBell ? notificationCount : itemNotificationCount;

    return (
      <Button
        variant={isActive && !isSheet ? "secondary" : "ghost"}
        className={`relative flex items-center gap-2 ${isSheet ? 'justify-start w-full text-base py-3 h-auto' : 'text-sm px-3 py-1.5 h-auto'}`}
        onClick={() => {
          if (isNotificationBell) {
            handleBellClick();
          } else {
            navigate(path);
          }
          if (isSheet) setIsMobileMenuOpen(false);
        }}
      >
        <Icon className={`h-5 w-5 ${isActive && !isSheet ? 'text-primary' : ''}`} />
        {label}
        {effectiveNotificationCount > 0 && (
            <Badge 
                variant="destructive" 
                className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full"
            >
                {effectiveNotificationCount > 9 ? '9+' : effectiveNotificationCount}
            </Badge>
        )}
      </Button>
    );
  };


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b shadow-sm print:hidden">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl hover:opacity-80 transition-opacity">
            <Church className="h-7 w-7" />
            <span className="hidden sm:inline">Church Synch</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {mainNavItems.filter(item => item.path !== '/messages').map(item => <NavLink key={item.path} {...item} />)}
          </nav>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/messages')}
            aria-label="Mensagens"
            className="rounded-full relative hidden md:inline-flex"
          >
            <MessageIcon className="h-5 w-5" />
            {unreadMessagesCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full"
              >
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleBellClick}
            aria-label="Notificações"
            className="rounded-full relative"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            aria-label="Perfil do usuário"
            className="rounded-full"
          >
            <User className="h-5 w-5" />
          </Button>

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  <motion.div
                    animate={isMobileMenuOpen ? "open" : "closed"}
                    variants={{ open: { rotate: 90 }, closed: { rotate: 0 }}}
                    transition={{ duration: 0.2 }}
                  >
                   {isMobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6" />}
                  </motion.div>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <Church /> Church Synch
                  </SheetTitle>
                  {user && <SheetDescription className="text-sm">Olá, {user.firstName}!</SheetDescription>}
                </SheetHeader>
                <nav className="flex-1 flex flex-col space-y-1 p-4 overflow-y-auto">
                  {mobileSheetNavItems.map(item => <NavLink key={item.path} {...item} isSheet={true} />)}
                </nav>
                <div className="p-4 border-t">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                        <LogOut className="h-5 w-5"/> Sair
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;