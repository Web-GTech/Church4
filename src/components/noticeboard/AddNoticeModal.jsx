import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const AddNoticeModal = ({ isOpen, onClose, noticeToEdit, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Image upload state can be added here if needed

  useEffect(() => {
    if (noticeToEdit) {
      setTitle(noticeToEdit.title);
      setContent(noticeToEdit.content);
      setIsPinned(noticeToEdit.isPinned || false);
    } else {
      setTitle('');
      setContent('');
      setIsPinned(false);
    }
  }, [noticeToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) {
      toast({ title: "Erro", description: "Título e conteúdo são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    const noticeData = {
      title: title.trim(),
      content: content.trim(),
      is_pinned: isPinned,
      user_id: user.id, // Ensure user_id is set
      author_id: user.id, // Ensure author_id is set for consistency if used elsewhere
    };

    try {
      let error;
      if (noticeToEdit) {
        const { error: updateError } = await supabase
          .from('notices')
          .update(noticeData)
          .eq('id', noticeToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('notices')
          .insert(noticeData);
        error = insertError;
      }

      if (error) throw error;
      
      toast({ title: noticeToEdit ? "Aviso atualizado!" : "Aviso adicionado!" });
      onSuccess(); // This will trigger fetchNotices in parent and close modal
    } catch (error) {
      console.error("Error saving notice:", error);
      toast({ title: "Erro ao salvar aviso", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{noticeToEdit ? 'Editar Aviso' : 'Adicionar Novo Aviso'}</DialogTitle>
          <DialogDescription>Preencha os detalhes do aviso abaixo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="noticeTitle">Título</Label>
              <Input id="noticeTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do aviso" disabled={isLoading}/>
            </div>
            <div>
              <Label htmlFor="noticeContent">Conteúdo</Label>
              <Textarea id="noticeContent" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Detalhes do aviso..." rows={5} disabled={isLoading}/>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isPinned" checked={isPinned} onCheckedChange={setIsPinned} disabled={isLoading}/>
              <Label htmlFor="isPinned">Fixar este aviso no topo?</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? (noticeToEdit ? 'Salvando...' : 'Adicionando...') : (noticeToEdit ? 'Salvar Alterações' : 'Adicionar Aviso')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoticeModal;