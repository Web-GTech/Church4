import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Music, CalendarDays, MessageSquare, DownloadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadMessagesCount, setUnreadMessagesCount] = React.useState(0);

  React.useEffect(() => {
    const updateUnreadCount = () => {
      const storedConversations = JSON.parse(localStorage.getItem('church-synch-conversations')) || [];
      const totalUnread = storedConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadMessagesCount(totalUnread);
    };

    updateUnreadCount(); // Initial count
    window.addEventListener('messageUpdate', updateUnreadCount);
    return () => window.removeEventListener('messageUpdate', updateUnreadCount);
  }, []);


  const navItemsBase = [
    { path: '/liturgy', icon: BookOpen, label: 'Liturgia' },
    { path: '/repertoire', icon: Music, label: 'Músicas' }, // Label alterado para Músicas
    { path: '/', icon: Home, label: 'Home', isCenter: true },
    { path: '/schedules', icon: CalendarDays, label: 'Escalas' },
    { path: '/downloads', icon: DownloadCloud, label: 'Downloads' },
  ];
  
  const messagesItem = { path: '/messages', icon: MessageSquare, label: 'Chat', notificationCount: unreadMessagesCount };

  // Insert messages item before Downloads, or at a specific position if Downloads doesn't exist
  const finalNavItems = [...navItemsBase];
  const downloadsIndex = finalNavItems.findIndex(item => item.path === '/downloads');
  if (downloadsIndex !== -1) {
      finalNavItems.splice(downloadsIndex, 0, messagesItem);
  } else {
      // If downloads is not present, insert messages before the last item or as the second to last if home is center
      const homeIndex = finalNavItems.findIndex(item => item.isCenter);
      if (homeIndex !== -1 && homeIndex < finalNavItems.length -1) {
        finalNavItems.splice(homeIndex + 1, 0, messagesItem);
      } else {
        finalNavItems.splice(finalNavItems.length -1, 0, messagesItem);
      }
  }
  // Ensure there are max 5 items, prioritizing core items if needed
  // This logic might need adjustment based on exact desired priority if more items are added
  if (finalNavItems.length > 5) {
    // Example: remove the one with least priority or least used if logic is complex
    // For now, let's assume the base 5 are most important if it exceeds
  }


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t md:hidden print:hidden">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around h-16">
          {finalNavItems.slice(0, 5).map((item) => { // Ensure only 5 items are rendered
            const isActive = location.pathname === item.path || 
                             (item.path === '/messages' && location.pathname.startsWith('/messages')) ||
                             (item.path === '/ebd' && location.pathname.startsWith('/ebd'));
            const Icon = item.icon;

            return (
              <Button
                key={item.path}
                variant="ghost"
                size={item.isCenter ? "lg" : "sm"}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center space-y-0.5 h-auto py-2 px-2 rounded-xl transition-all duration-200 
                  ${ item.isCenter 
                    ? 'bg-gradient-to-br from-primary to-blue-600 text-primary-foreground hover:opacity-90 scale-110 shadow-lg' 
                    : isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={`${item.isCenter ? 'h-6 w-6' : 'h-5 w-5'}`} />
                </motion.div>
                <span className={`text-[10px] font-medium ${item.isCenter ? 'text-xs' : ''}`}>
                  {item.label}
                </span>
                {item.notificationCount > 0 && (
                    <Badge variant="destructive" className="absolute top-0.5 right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] rounded-full">
                        {item.notificationCount > 9 ? '9+' : item.notificationCount}
                    </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;