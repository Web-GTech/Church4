import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, MessageSquare as ChatIconPlaceholder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import NewConversationModal from '@/components/messages/NewConversationModal';
import ChatArea from '@/components/messages/ChatArea';
import ConversationListItem from '@/components/messages/ConversationListItem';

const GLOBAL_CHAT_ROOM_ID = '00000000-0000-0000-0000-000000000000';

const Messages = () => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingConversations(true);
    try {
      const { data, error } = await supabase
        .rpc('get_user_chat_rooms_with_details', { p_user_id: user.id });

      if (error) throw error;
      
      let globalChat = data.find(c => c.id === GLOBAL_CHAT_ROOM_ID);
      if (!globalChat) {
        const { data: gcData, error: gcError } = await supabase
            .from('chat_rooms')
            .select('*, participants:chat_room_participants!inner(profiles!inner(*)), last_message_content, last_message_at')
            .eq('id', GLOBAL_CHAT_ROOM_ID)
            .maybeSingle();
        if (gcError) console.error("Error fetching global chat specifically:", gcError);
        
        if (gcData) {
            globalChat = {
                ...gcData,
                name: gcData.name || "Chat Global",
                is_global: true, // Ensure this flag is set
                participants: gcData.participants.map(p => ({ profiles: p.profiles })) // Standardize structure
            };
            if (!data.find(c => c.id === GLOBAL_CHAT_ROOM_ID)) data.unshift(globalChat);
        } else {
            console.warn("Global chat room not found. Attempting to create.");
            const { data: createdGlobalChat, error: createError } = await supabase
              .from('chat_rooms')
              .insert({ id: GLOBAL_CHAT_ROOM_ID, name: 'Chat Global', is_group_chat: true, created_by: user.id })
              .select('*, participants:chat_room_participants!inner(profiles!inner(*)), last_message_content, last_message_at')
              .single();
            if (createError) throw createError;
            
            const { error: participantError } = await supabase
              .from('chat_room_participants')
              .insert({ room_id: GLOBAL_CHAT_ROOM_ID, user_id: user.id }); // Add current user
            if(participantError) console.error("Error adding self to global chat", participantError);

            globalChat = {
                ...createdGlobalChat,
                name: createdGlobalChat.name || "Chat Global",
                is_global: true,
                participants: createdGlobalChat.participants?.map(p => ({ profiles: p.profiles })) || [{profiles: user}]
            };
            data.unshift(globalChat);
        }
      } else {
         // Ensure existing global chat has the is_global flag for UI consistency
         globalChat.is_global = true;
      }
      
      const sortedConversations = data
        .map(c => ({...c, is_global: c.id === GLOBAL_CHAT_ROOM_ID})) // Ensure is_global flag
        .sort((a,b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
      
      setConversations(sortedConversations);

      if (globalChat && !selectedConversation) {
        setSelectedConversation(sortedConversations.find(c => c.id === GLOBAL_CHAT_ROOM_ID) || null);
      }

    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({ title: "Erro ao carregar conversas", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user?.id, selectedConversation]); // Added selectedConversation to dependencies to re-evaluate if it changes

  useEffect(() => {
    fetchConversations();
    
    const fetchAllUsers = async () => {
        if (!user?.id) return;
        const { data, error } = await supabase.from('profiles').select('*').neq('id', user.id);
        if (error) console.error("Error fetching all users:", error);
        else setAllUsers(data || []);
    };
    fetchAllUsers();

  }, [user?.id]); // Removed fetchConversations from here to avoid potential loop with selectedConversation

   useEffect(() => {
    const messageSubscription = supabase
      .channel('public:chat_messages:insert')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, 
        (payload) => {
            // Check if the new message belongs to any of the current user's conversations
            const affectedRoomId = payload.new.chat_room_id;
            const isUserInRoom = conversations.some(conv => conv.id === affectedRoomId);

            if (isUserInRoom) {
                fetchConversations(); // Re-fetch to update last message and order
            }
        }
      )
      .subscribe();

    const roomSubscription = supabase
      .channel('public:chat_rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, () => fetchConversations())
      .subscribe();
      
    const participantSubscription = supabase
      .channel('public:chat_room_participants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_room_participants' }, () => fetchConversations())
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(participantSubscription);
    };
  }, [fetchConversations, conversations]); // Added conversations to re-subscribe if it changes


  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleMessageSentOrEdited = (roomId, messageContent) => {
    setConversations(prevConvs => 
      prevConvs.map(c => 
        c.id === roomId 
        ? { ...c, last_message_content: messageContent, last_message_at: new Date().toISOString() } 
        : c
      ).sort((a,b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0))
    );
  };
  
  const handleStartNewPrivateConversation = async (targetUser) => {
    if (!user || !targetUser) return;
    try {
        const { data: existingRoomId, error: existingRoomError } = await supabase.rpc('get_existing_private_chat_room', {
            user1_id: user.id,
            user2_id: targetUser.id
        });

        if (existingRoomError) throw existingRoomError;

        if (existingRoomId) {
            const fullExistingRoomData = conversations.find(c => c.id === existingRoomId);
            if (fullExistingRoomData) setSelectedConversation(fullExistingRoomData);
            else {
                await fetchConversations(); // refetch if not in current list
                // After refetch, try to find and set it again
                const updatedConversations = await supabase.rpc('get_user_chat_rooms_with_details', { p_user_id: user.id });
                const foundRoom = updatedConversations.data.find(c => c.id === existingRoomId);
                if (foundRoom) setSelectedConversation(foundRoom);
            }
        } else {
            const { data: newRoom, error: newRoomError } = await supabase
                .from('chat_rooms')
                .insert({ is_group_chat: false, name: `Chat Privado ${user.id}-${targetUser.id}`, created_by: user.id })
                .select('id')
                .single();
            if (newRoomError) throw newRoomError;

            const { error: participantsError } = await supabase
                .from('chat_room_participants')
                .insert([
                    { room_id: newRoom.id, user_id: user.id },
                    { room_id: newRoom.id, user_id: targetUser.id }
                ]);
            if (participantsError) throw participantsError;
            
            await fetchConversations(); // Re-fetch to get the new room with all details
            // Attempt to select the newly created conversation
            const updatedConversations = await supabase.rpc('get_user_chat_rooms_with_details', { p_user_id: user.id });
            const createdRoom = updatedConversations.data.find(c => c.participants.some(p => p.profiles.id === targetUser.id) && !c.is_global);
            if (createdRoom) setSelectedConversation(createdRoom);
        }
        setIsNewConversationModalOpen(false);
    } catch (error) {
        console.error("Error starting new private conversation:", error);
        toast({ title: "Erro ao iniciar conversa", description: error.message, variant: "destructive" });
    }
  };

  const filteredConversationsForDisplay = conversations.filter(conv => {
    if (!userSearchTerm.trim()) return true;
    if (conv.is_global && "chat global".includes(userSearchTerm.toLowerCase())) return true;
    if (conv.is_global) return false; // Don't match global chat unless explicitly searched

    const otherUser = conv.participants?.find(p => p.profiles.id !== user.id)?.profiles;
    if (!otherUser) return false;
    
    const nameMatch = `${otherUser.first_name} ${otherUser.last_name}`.toLowerCase().includes(userSearchTerm.toLowerCase());
    return nameMatch;
  });


  return (
    <div className="flex flex-col h-full chat-container">
      <div className="flex flex-1 overflow-hidden">
        <motion.div
          layout
          className={`bg-card border-r flex flex-col overflow-hidden h-full transition-all duration-300 ease-in-out
            ${selectedConversation ? 'hidden md:flex w-full md:w-1/3 lg:w-1/4' : 'flex w-full md:w-1/3 lg:w-1/4'}
            chat-sidebar`}
        >
          <div className="p-3 sm:p-4 border-b">
            <div className="relative">
              <Input placeholder="Buscar conversas..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} className="pl-10 h-10 text-sm"/>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          {isLoadingConversations ? (
            <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Carregando conversas...</p></div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide chat-messages-list">
              <AnimatePresence>
                {filteredConversationsForDisplay.length > 0 ? filteredConversationsForDisplay.map(conv => (
                  <ConversationListItem 
                    key={conv.id} 
                    conv={conv} 
                    onSelect={handleSelectConversation} 
                    isSelected={selectedConversation?.id === conv.id}
                    currentUser={user}
                  />
                )) : (
                  <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>
                )}
              </AnimatePresence>
            </div>
          )}
          <div className="p-2 border-t">
            <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => setIsNewConversationModalOpen(true)}>
              <PlusCircle className="h-4 w-4"/> Nova Conversa Privada
            </Button>
          </div>
        </motion.div>

        <motion.div
          layout
          className={`bg-background flex flex-col overflow-hidden h-full transition-all duration-300 ease-in-out
            ${selectedConversation ? 'flex w-full md:w-2/3 lg:w-3/4' : 'hidden md:flex w-full md:w-2/3 lg:w-3/4'}
            chat-main`}
        >
          {selectedConversation && user ? ( // Ensure user is also available
            <ChatArea
              key={selectedConversation.id} 
              conversation={selectedConversation}
              currentUser={user}
              onBack={() => setSelectedConversation(null)}
              onMessageSent={handleMessageSentOrEdited}
              onMessageEdited={handleMessageSentOrEdited}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <ChatIconPlaceholder className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold text-foreground">Selecione uma conversa</h2>
              <p className="text-muted-foreground">Ou inicie uma nova para começar a conversar.</p>
            </div>
          )}
        </motion.div>
      </div>

      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onOpenChange={setIsNewConversationModalOpen}
        allUsers={allUsers}
        conversations={conversations}
        onStartConversation={handleStartNewPrivateConversation}
      />
    </div>
  );
};

export default Messages;