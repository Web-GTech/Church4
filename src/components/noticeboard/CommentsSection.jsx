import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const CommentsSection = ({ isOpen, onClose, notice, currentUser, isAdmin, onCommentCountUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!notice?.id) return;
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('general_comments')
        .select('*, profiles (id, first_name, last_name, avatar_url)')
        .eq('target_id', notice.id)
        .eq('target_type', 'notice')
        .order('created_at', { ascending: true });
      if (error) throw error;
      
      setComments(data.map(c => ({
        id: c.id,
        author: `${c.profiles?.first_name || 'Usuário'} ${c.profiles?.last_name || ''}`.trim(),
        authorId: c.user_id,
        content: c.content,
        date: c.created_at,
        avatar: c.profiles?.avatar_url
      })));
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({ title: "Erro ao carregar comentários", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingComments(false);
    }
  }, [notice?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments]);

  const handlePostComment = async () => {
    if (!currentUser || !newCommentText.trim()) return;
    setIsPostingComment(true);
    try {
      const { data: newCommentData, error } = await supabase
        .from('general_comments')
        .insert({ target_id: notice.id, target_type: 'notice', user_id: currentUser.id, content: newCommentText.trim() })
        .select('*, profiles (id, first_name, last_name, avatar_url)')
        .single();
      
      if (error) throw error;

      const formattedComment = {
        id: newCommentData.id,
        author: `${newCommentData.profiles?.first_name || 'Usuário'} ${newCommentData.profiles?.last_name || ''}`.trim(),
        authorId: newCommentData.user_id,
        content: newCommentData.content,
        date: newCommentData.created_at,
        avatar: newCommentData.profiles?.avatar_url
      };
      setComments(prev => [...prev, formattedComment]);
      setNewCommentText('');
      onCommentCountUpdate(notice.id, (notice.commentsCount || 0) + 1);
      toast({ title: "Comentário adicionado!" });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({ title: "Erro ao comentar", description: error.message, variant: "destructive" });
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete || (commentToDelete.authorId !== currentUser.id && !isAdmin)) {
        toast({ title: "Não autorizado", description: "Você não pode excluir este comentário.", variant: "destructive"});
        return;
    }

    try {
      const { error } = await supabase
        .from('general_comments')
        .delete()
        .match({ id: commentId });
      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      onCommentCountUpdate(notice.id, Math.max(0, (notice.commentsCount || 1) - 1));
      toast({ title: "Comentário removido." });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({ title: "Erro ao remover comentário", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Comentários em "{notice?.title}"</DialogTitle>
          <DialogDescription>Veja e adicione comentários para este aviso.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {isLoadingComments && <p className="text-muted-foreground text-center">Carregando comentários...</p>}
          {!isLoadingComments && comments.length === 0 && (
            <div className="text-center py-6">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum comentário ainda. Seja o primeiro!</p>
            </div>
          )}
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div 
                key={comment.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.avatar} />
                  <AvatarFallback className="text-xs">{comment.author?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted/50 dark:bg-muted/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{comment.author}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{new Date(comment.date).toLocaleDateString('pt-BR')}</span>
                      {(comment.authorId === currentUser?.id || isAdmin) && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteComment(comment.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-line">{comment.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {currentUser && (
          <div className="pt-4 border-t">
            <div className="flex gap-3 items-start">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar_url}/>
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">{currentUser.first_name?.[0]}{currentUser.last_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea 
                  placeholder="Adicione um comentário..." 
                  value={newCommentText} 
                  onChange={(e) => setNewCommentText(e.target.value)} 
                  className="min-h-[60px] resize-none" 
                  disabled={isPostingComment}
                />
                <Button size="icon" onClick={handlePostComment} disabled={!newCommentText.trim() || isPostingComment}>
                  {isPostingComment ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsSection;