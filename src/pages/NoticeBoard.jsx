
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, PlusCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import NoticeCard from '@/components/noticeboard/NoticeCard';
import AddNoticeModal from '@/components/noticeboard/AddNoticeModal';
import CommentsSection from '@/components/noticeboard/CommentsSection'; 

const NoticeBoard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddNoticeModalOpen, setIsAddNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [selectedNoticeForComments, setSelectedNoticeForComments] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const fetchNotices = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setFetchError("Usuário não autenticado. Não é possível carregar avisos.");
      return;
    }
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data: noticesData, error: noticesError } = await supabase
        .from('notices')
        .select(`
          id,
          title,
          content,
          image_url,
          user_id,
          created_at,
          is_pinned,
          likes_count,
          comments_count,
          profiles ( id, first_name, last_name, avatar_url )
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (noticesError) throw noticesError;
      
      const noticeIds = noticesData.map(n => n.id);
      let userLikes = [];
      if (noticeIds.length > 0 && user?.id) {
        const { data: likesData, error: likesError } = await supabase
          .from('likes')
          .select('target_id')
          .eq('user_id', user.id)
          .eq('target_type', 'notice')
          .in('target_id', noticeIds);
        if (likesError) console.warn("Error fetching user likes for notices:", likesError.message);
        else userLikes = likesData.map(l => l.target_id);
      }
      
      const formattedNotices = noticesData.map(notice => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        image: notice.image_url,
        author: `${notice.profiles?.first_name || 'Usuário'} ${notice.profiles?.last_name || ''}`.trim(),
        authorId: notice.user_id,
        authorAvatar: notice.profiles?.avatar_url,
        date: notice.created_at,
        isPinned: notice.is_pinned,
        likesCount: notice.likes_count || 0,
        commentsCount: notice.comments_count || 0,
        userHasLiked: userLikes.includes(notice.id),
      }));
      setNotices(formattedNotices);

    } catch (error) {
      console.error("Error fetching notices:", error);
      setFetchError(error.message);
      toast({ title: "Erro ao carregar avisos", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) { // Only fetch if auth state is resolved
        fetchNotices();
    }
  }, [fetchNotices, authLoading]);

  const handleOpenAddModal = (noticeToEdit = null) => {
    setEditingNotice(noticeToEdit);
    setIsAddNoticeModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddNoticeModalOpen(false);
    setEditingNotice(null);
  };

  const handleNoticeAddedOrUpdated = () => {
    fetchNotices(); 
    handleCloseAddModal();
  };

  const handleNoticeDeleted = () => {
    fetchNotices();
  };

  const handleLikeUpdate = (noticeId, newLikesCount, newUserHasLiked) => {
    setNotices(prevNotices => 
      prevNotices.map(n => 
        n.id === noticeId 
        ? { ...n, likesCount: newLikesCount, userHasLiked: newUserHasLiked } 
        : n
      )
    );
  };
  
  const handleCommentCountUpdate = (noticeId, newCommentsCount) => {
     setNotices(prevNotices => 
      prevNotices.map(n => 
        n.id === noticeId 
        ? { ...n, commentsCount: newCommentsCount } 
        : n
      )
    );
  };

  const openCommentsModal = (notice) => {
    setSelectedNoticeForComments(notice);
  };

  const closeCommentsModal = () => {
    setSelectedNoticeForComments(null);
  };

  if (authLoading || (isLoading && notices.length === 0 && !fetchError)) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">Carregando avisos...</h3>
        </motion.div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-destructive/10 p-6 rounded-lg">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-destructive">Erro ao Carregar Avisos</h3>
          <p className="text-muted-foreground">{fetchError}</p>
          <Button onClick={fetchNotices} className="mt-4">Tentar Novamente</Button>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="gradient-bg text-white border-0 overflow-hidden relative shadow-xl">
          <div className="absolute inset-0 church-pattern opacity-20"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3"><MessageSquare className="h-8 w-8" /><h1 className="text-2xl font-bold">Mural de Avisos</h1></div>
                {isAdmin && (
                    <Button onClick={() => handleOpenAddModal()} className="bg-white/20 hover:bg-white/30 text-white">
                        <PlusCircle className="h-4 w-4 mr-2"/> Adicionar Aviso
                    </Button>
                )}
            </div>
            <p className="text-white/80 mt-2 text-center sm:text-left">Fique por dentro de tudo que acontece na igreja</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-6">
        {notices.map((notice, index) => (
          <NoticeCard 
            key={notice.id} 
            notice={notice} 
            index={index}
            isAdmin={isAdmin}
            currentUser={user}
            onEdit={() => handleOpenAddModal(notice)}
            onDelete={handleNoticeDeleted}
            onLikeUpdate={handleLikeUpdate}
            onCommentClick={() => openCommentsModal(notice)}
          />
        ))}
      </div>
      
      {notices.length === 0 && !isLoading && !fetchError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum aviso disponível</h3>
          <p className="text-muted-foreground">Aguarde novos comunicados serem publicados ou adicione um se for administrador.</p>
        </motion.div>
      )}

      <AnimatePresence>
        {isAddNoticeModalOpen && (
          <AddNoticeModal
            isOpen={isAddNoticeModalOpen}
            onClose={handleCloseAddModal}
            noticeToEdit={editingNotice}
            onSuccess={handleNoticeAddedOrUpdated}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNoticeForComments && (
          <CommentsSection
            isOpen={!!selectedNoticeForComments}
            onClose={closeCommentsModal}
            notice={selectedNoticeForComments}
            currentUser={user}
            isAdmin={isAdmin}
            onCommentCountUpdate={handleCommentCountUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NoticeBoard;
