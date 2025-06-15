import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle as GlobalChatIcon } from 'lucide-react';

const ConversationListItem = ({ conv, onSelect, isSelected, currentUser }) => {
  const otherUser = conv.is_global ? null : conv.participants?.find(p => p.profiles.id !== currentUser.id)?.profiles;
  const title = conv.is_global ? "Chat Global" : (otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Carregando...");
  const avatarUrl = conv.is_global ? null : otherUser?.avatar_url;
  const fallback = conv.is_global ? <GlobalChatIcon className="h-full w-full p-2 text-primary"/> : (otherUser ? `${otherUser.first_name?.[0]}${otherUser.last_name?.[0]}` : "U");
  const lastMessageTimestamp = conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={() => onSelect(conv)}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-muted/50 dark:hover:bg-muted/20'}`}
    >
      <Avatar className="h-10 w-10">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={title} />}
        <AvatarFallback className={`bg-secondary text-secondary-foreground`}>
          {fallback}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm truncate text-foreground">{title}</h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{lastMessageTimestamp}</span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground truncate">{conv.last_message_content || "Nenhuma mensagem ainda."}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationListItem;