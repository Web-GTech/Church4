import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';

const GLOBAL_CHAT_ROOM_ID = '00000000-0000-0000-0000-000000000000';

const MessageBubble = ({ msg, isCurrentUser, onEdit }) => (
  <motion.div
    key={msg.id}
    layout
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className={`flex gap-2 items-end ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
  >
    {!isCurrentUser && msg.sender_id !== GLOBAL_CHAT_ROOM_ID && (
      <Avatar className="h-6 w-6 self-end mb-1">
        <AvatarImage src={msg.profiles?.avatar_url} />
        <AvatarFallback className="text-xs">{msg.profiles?.first_name?.[0]}{msg.profiles?.last_name?.[0]}</AvatarFallback>
      </Avatar>
    )}
    <div className={`max-w-[70%] p-2 sm:p-3 rounded-2xl text-sm relative group ${isCurrentUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
      {!isCurrentUser && msg.chat_room_id === GLOBAL_CHAT_ROOM_ID && <p className="text-xs font-semibold mb-0.5 text-primary">{msg.profiles?.first_name} {msg.profiles?.last_name?.charAt(0)}.</p>}
      <p>{msg.content}</p>
      <p className={`text-[10px] mt-0.5 ${isCurrentUser ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>
        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {msg.is_edited && "(editado)"}
      </p>
      {isCurrentUser && msg.sender_id !== GLOBAL_CHAT_ROOM_ID && (
        <Button variant="ghost" size="icon" onClick={() => onEdit(msg)} className="absolute -left-8 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      )}
    </div>
    {isCurrentUser && msg.sender_id !== GLOBAL_CHAT_ROOM_ID && (
      <Avatar className="h-6 w-6 self-end mb-1">
        <AvatarImage src={msg.profiles?.avatar_url} />
        <AvatarFallback className="text-xs bg-primary/80 text-primary-foreground">{msg.profiles?.first_name?.[0]}{msg.profiles?.last_name?.[0]}</AvatarFallback>
      </Avatar>
    )}
  </motion.div>
);

export default MessageBubble;