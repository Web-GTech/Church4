import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Heart, Share2, Calendar, Pin, Trash2, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const NoticeCard = ({ notice, index, isAdmin, currentUser, onEdit, onDelete, onLikeUpdate, onCommentClick }) => {

  const handleLike = async () => {
    if (!currentUser) {
      toast({ title: "Ação requer login", description: "Faça login para curtir.", variant: "destructive" });
      return;
    }

    try {
      if (notice.userHasLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ target_id: notice.id, user_id: currentUser.id, target_type: 'notice' });
        if (error) throw error;
        onLikeUpdate(notice.id, Math.max(0, notice.likesCount - 1), false);
        toast({ title: "Curtida removida" });
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ target_id: notice.id, user_id: currentUser.id, target_type: 'notice' });
        if (error) throw error;
        onLikeUpdate(notice.id, notice.likesCount + 1, true);
        toast({ title: "Aviso curtido!" });
      }
    } catch (error) {
      console.error("Error liking notice:", error);
      toast({ title: "Erro ao curtir", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    try {
      await supabase.from('likes').delete().match({ target_id: notice.id, target_type: 'notice' });
      await supabase.from('general_comments').delete().match({ target_id: notice.id, target_type: 'notice' });
      const { error } = await supabase.from('notices').delete().match({ id: notice.id });
      if (error) throw error;
      toast({ title: "Aviso removido!" });
      onDelete();
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast({ title: "Erro ao remover aviso", description: error.message, variant: "destructive" });
    }
  };
  
  const handleShare = () => {
    toast({
      title: "🚧 Compartilhar em breve!",
      description: "Esta funcionalidade será implementada em breve."
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={`border-0 shadow-lg overflow-hidden ${notice.isPinned ? 'ring-2 ring-primary' : ''}`}>
        <div className={`h-2 bg-gradient-to-r ${notice.isPinned ? 'from-yellow-500 to-amber-500' : 'from-blue-500 to-cyan-500'}`}></div>
        <CardHeader className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={notice.authorAvatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {notice.author?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{notice.author}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />{new Date(notice.date).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {notice.isPinned && (
                <div className="flex items-center gap-1 text-yellow-600" title="Fixado">
                  <Pin className="h-4 w-4" />
                </div>
              )}
              {isAdmin && (
                <>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={onEdit}>
                    <Edit className="h-4 w-4"/>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </>
              )}
            </div>
          </div>
          <CardTitle className="text-xl">{notice.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
          {notice.image && (<img className="w-full h-auto max-h-96 object-cover rounded-lg" alt="Imagem do aviso" src={notice.image} />)}
          <div className="whitespace-pre-line text-foreground">{notice.content}</div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleLike} className={`gap-2 ${notice.userHasLiked ? 'text-red-500' : ''}`}>
                <Heart className={`h-4 w-4 ${notice.userHasLiked ? 'fill-current' : ''}`} />
                {notice.likesCount || 0}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={onCommentClick}>
                <MessageSquare className="h-4 w-4" />{notice.commentsCount || 0}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NoticeCard;