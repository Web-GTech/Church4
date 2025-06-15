import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle as GlobalChatIcon } from 'lucide-react';

const ConversationListItem = ({ conv, onSelect, isSelected }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -10 }}
    onClick={() => onSelect(conv)}
    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-muted/50 dark:hover:bg-muted/20'}`}
  >
    <Avatar className="h-10 w-10">
      {conv.isGlobal ? <GlobalChatIcon className="h-full w-full p-2 text-primary"/> : <AvatarImage src={conv.otherUser?.profileImage} alt={conv.otherUser?.firstName} />}
      {!conv.isGlobal && (
        <AvatarFallback className={`${conv.otherUser?.online ? 'border-2 border-green-500' : ''} bg-secondary text-secondary-foreground`}>
          {conv.otherUser?.firstName?.[0]}{conv.otherUser?.lastName?.[0]}
        </AvatarFallback>
      )}
    </Avatar>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm truncate text-foreground">{conv.otherUser?.firstName} {conv.otherUser?.lastName}</h3>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(conv.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
        {!conv.isGlobal && conv.unreadCount > 0 && <Badge variant="destructive" className="h-5 px-1.5 text-xs">{conv.unreadCount}</Badge>}
      </div>
    </div>
  </motion.div>
);

const ConversationList = ({ conversations, selectedConversation, onSelectConversation }) => {
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide chat-messages">
      <AnimatePresence>
        {conversations.length > 0 ? conversations.map(conv => (
          <ConversationListItem 
            key={conv.id} 
            conv={conv} 
            onSelect={onSelectConversation} 
            isSelected={selectedConversation?.id === conv.id} 
          />
        )) : (
          <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConversationList;