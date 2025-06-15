import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, SmilePlus, Paperclip, ArrowLeft, CheckCircle, MessageSquare as ChatIconPlaceholder, MessageCircle as GlobalChatIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import MessageBubble from '@/components/messages/MessageBubble';

const ChatArea = ({ conversation, currentUser, onBack, onMessageSent, onMessageEdited }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isEditingMessage, setIsEditingMessage] = useState(null);
  const [editingText, setEditingText] = useState('');
  const messagesEndRef = useRef(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversation?.id) return;
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, profiles (id, first_name, last_name, avatar_url)')
        .eq('chat_room_id', conversation.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({ title: "Erro ao carregar mensagens", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversation?.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversation?.id) return;

    const channel = supabase
      .channel(`chat_room:${conversation.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_room_id=eq.${conversation.id}` },
        async (payload) => {
          const { data: profile, error } = await supabase.from('profiles').select('id, first_name, last_name, avatar_url').eq('id', payload.new.sender_id).single();
          if (error) console.error("Error fetching profile for new message:", error);
          
          setMessages((prevMessages) => [...prevMessages, {...payload.new, profiles: profile || {}}]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `chat_room_id=eq.${conversation.id}` },
        (payload) => {
          setMessages((prevMessages) => 
            prevMessages.map(msg => msg.id === payload.new.id ? {...msg, ...payload.new, profiles: msg.profiles} : msg)
          );
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') console.log(`Subscribed to chat room: ${conversation.id}`);
        if (err) console.error(`Error subscribing to chat room ${conversation.id}:`, err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id, currentUser.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation?.id || !currentUser?.id) return;
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: conversation.id,
          sender_id: currentUser.id,
          content: newMessage,
        });
      
      if (error) throw error;
      setNewMessage('');
      onMessageSent(conversation.id, newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Erro ao enviar mensagem", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingText.trim() || !isEditingMessage?.id) return;
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ content: editingText, is_edited: true, updated_at: new Date().toISOString() })
        .eq('id', isEditingMessage.id);

      if (error) throw error;
      setIsEditingMessage(null);
      setEditingText('');
      onMessageEdited(conversation.id, isEditingMessage.id, editingText);
      toast({ title: "Mensagem editada!" });
    } catch (error) {
      console.error("Error editing message:", error);
      toast({ title: "Erro ao editar mensagem", description: error.message, variant: "destructive" });
    }
  };
  
  const otherUser = conversation?.participants?.find(p => p.profiles.id !== currentUser.id)?.profiles;
  const chatTitle = conversation?.is_global ? "Chat Global" : (otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Carregando...");
  const chatAvatar = conversation?.is_global ? null : otherUser?.avatar_url;
  const chatFallback = conversation?.is_global ? <GlobalChatIcon className="h-full w-full p-1 text-primary"/> : (otherUser ? `${otherUser.first_name?.[0]}${otherUser.last_name?.[0]}` : "U");

  if (!conversation) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ChatIconPlaceholder className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground">Selecione uma conversa</h2>
            <p className="text-muted-foreground">Ou inicie uma nova para começar a conversar.</p>
        </div>
    );
  }

  return (
    <>
      <CardHeader className="p-3 sm:p-4 border-b flex-row items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" className="md:hidden mr-1" onClick={onBack}>
            <ArrowLeft className="h-5 w-5"/>
          </Button>
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            {chatAvatar ? <AvatarImage src={chatAvatar} /> : null}
            <AvatarFallback className={`bg-secondary text-secondary-foreground`}>
              {chatFallback}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm sm:text-lg leading-tight">{chatTitle}</CardTitle>
            {conversation?.is_global && <CardDescription className="text-xs">Canal de comunicação da igreja</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 scrollbar-hide chat-messages">
        {isLoadingMessages && <p className="text-center text-muted-foreground">Carregando mensagens...</p>}
        <AnimatePresence>
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} isCurrentUser={msg.sender_id === currentUser.id} onEdit={() => { setIsEditingMessage(msg); setEditingText(msg.content);}} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </CardContent>
      
      {isEditingMessage && (
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} className="p-2 sm:p-4 border-t bg-muted/50 chat-input-area">
          <p className="text-xs text-muted-foreground mb-1">Editando mensagem:</p>
          <div className="flex items-center gap-2">
            <Input value={editingText} onChange={(e) => setEditingText(e.target.value)} className="flex-1 h-10 text-sm" autoFocus onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}/>
            <Button onClick={handleSaveEdit} size="sm" className="bg-green-500 hover:bg-green-600 h-10"><CheckCircle className="h-4 w-4 mr-1.5"/>Salvar</Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditingMessage(null)} className="h-10">Cancelar</Button>
          </div>
        </motion.div>
      )}

      {!isEditingMessage && (
        <div className="p-2 sm:p-4 border-t bg-background chat-input-area">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:inline-flex"><SmilePlus className="h-5 w-5"/></Button>
            <Input 
              placeholder="Digite sua mensagem..." 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 h-10 text-sm"
            />
            <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:inline-flex"><Paperclip className="h-5 w-5"/></Button>
            <Button onClick={handleSendMessage} size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10">
              <Send className="h-5 w-5"/>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatArea;