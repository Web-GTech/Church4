import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Megaphone, PlusCircle, Edit, Trash2, Pin, Users, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ManageNotices = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('todos');
  const [isPinned, setIsPinned] = useState(false);
  const [image, setImage] = useState(null); // For image upload

  useEffect(() => {
    const storedNotices = JSON.parse(localStorage.getItem('church-synch-notices')) || [];
    setNotices(storedNotices);
  }, []);

  const resetForm = () => {
    setTitle(''); setContent(''); setTargetAudience('todos'); setIsPinned(false); setImage(null);
  };

  const openModalForNew = () => {
    setEditingNotice(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openModalForEdit = (notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setTargetAudience(notice.targetAudience || 'todos');
    setIsPinned(notice.isPinned || false);
    setImage(notice.image || null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For simplicity, storing file name. In real app, upload and get URL.
      setImage(file.name); 
      toast({ title: "Imagem Selecionada", description: file.name });
    }
  };

  const handleSaveNotice = (e) => {
    e.preventDefault();
    if (!title || !content) {
      toast({ title: "Erro", description: "Título e Conteúdo são obrigatórios.", variant: "destructive" });
      return;
    }

    const noticeData = {
      title, content, targetAudience, isPinned, image,
      author: `${user.firstName} ${user.lastName}`,
      authorId: user.id,
      date: editingNotice ? editingNotice.date : new Date().toISOString().split('T')[0],
      id: editingNotice ? editingNotice.id : Date.now().toString(),
      likesCount: editingNotice?.likesCount || 0,
      commentsCount: editingNotice?.commentsCount || 0,
    };

    let updatedNotices;
    if (editingNotice) {
      updatedNotices = notices.map(n => n.id === editingNotice.id ? noticeData : n);
      toast({ title: "Aviso Atualizado!", description: `"${title}" foi atualizado.` });
    } else {
      updatedNotices = [...notices, noticeData];
      toast({ title: "Aviso Criado!", description: `"${title}" foi publicado.` });
    }
    
    setNotices(updatedNotices);
    localStorage.setItem('church-synch-notices', JSON.stringify(updatedNotices));
    
    // Simulate notification for new/updated notice
    const unreadNotifications = JSON.parse(localStorage.getItem('church-synch-notifications-unread')) || [];
    localStorage.setItem('church-synch-notifications-unread', JSON.stringify([...unreadNotifications, { id: noticeData.id, title: noticeData.title }]));
    window.dispatchEvent(new CustomEvent('newNotification'));

    setIsModalOpen(false);
    setEditingNotice(null);
  };

  const handleDeleteNotice = (noticeId) => {
    const updatedNotices = notices.filter(n => n.id !== noticeId);
    setNotices(updatedNotices);
    localStorage.setItem('church-synch-notices', JSON.stringify(updatedNotices));
    toast({ title: "Aviso Removido", description: "O aviso foi removido com sucesso." });
  };
  
  const audienceOptions = [
    { value: 'todos', label: 'Todos os Membros' },
    { value: 'jovens', label: 'Jovens' },
    { value: 'lideranca', label: 'Liderança' },
    { value: 'ministerio-louvor', label: 'Ministério de Louvor' },
    { value: 'ministerio-infantil', label: 'Ministério Infantil' },
    { value: 'outro', label: 'Outro (específico)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div/>
        <Button onClick={openModalForNew} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="h-5 w-5 mr-2"/> Criar Novo Aviso
        </Button>
      </div>

      {notices.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum aviso publicado ainda. Clique em "Criar Novo Aviso".</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notices.sort((a,b) => b.isPinned - a.isPinned || new Date(b.date) - new Date(a.date)).map(notice => (
          <motion.div key={notice.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <Card className={`h-full flex flex-col shadow-lg rounded-xl overflow-hidden border-0 ${notice.isPinned ? 'ring-2 ring-yellow-500' : ''}`}>
              <div className={`h-2 bg-gradient-to-r ${notice.isPinned ? 'from-yellow-400 to-amber-500' : 'from-teal-500 to-cyan-600'}`}></div>
              {notice.image && <img src={notice.image} alt={notice.title} className="w-full h-32 object-cover"/>}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    {notice.isPinned && <Pin className="h-5 w-5 text-yellow-500"/>}
                </div>
                <CardDescription className="text-xs">
                    Por {notice.author} em {new Date(notice.date).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm">
                <p className="text-muted-foreground line-clamp-3">{notice.content}</p>
                <Badge variant="outline" className="mt-2 text-xs">Público: {audienceOptions.find(opt => opt.value === notice.targetAudience)?.label || notice.targetAudience}</Badge>
              </CardContent>
              <DialogFooter className="p-4 border-t bg-card">
                <Button variant="outline" size="sm" onClick={() => openModalForEdit(notice)}><Edit className="h-4 w-4 mr-1.5"/>Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteNotice(notice.id)}><Trash2 className="h-4 w-4 mr-1.5"/>Excluir</Button>
              </DialogFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingNotice ? 'Editar Aviso' : 'Criar Novo Aviso'}</DialogTitle>
            <DialogDescription>Preencha os detalhes do aviso abaixo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNotice} className="space-y-3 py-4 max-h-[70vh] overflow-y-auto pr-2 text-sm">
            <div><Label htmlFor="notice-title">Título do Aviso</Label><Input id="notice-title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label htmlFor="notice-content">Conteúdo do Aviso</Label><Textarea id="notice-content" value={content} onChange={(e) => setContent(e.target.value)} rows={5}/></div>
            <div><Label htmlFor="notice-audience">Público-Alvo</Label>
                <select id="notice-audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="w-full p-2 border rounded-md bg-background text-sm h-10">
                    {audienceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
            <div>
                <Label htmlFor="notice-image">Imagem (Opcional)</Label>
                <div className="flex items-center gap-2 mt-1">
                    <Input id="notice-image" type="file" accept="image/*" onChange={handleImageChange} className="text-xs"/>
                    {image && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{typeof image === 'string' ? image : image.name}</span>}
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="notice-pinned" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                <Label htmlFor="notice-pinned" className="text-sm font-medium">Fixar este aviso no topo?</Label>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">{editingNotice ? 'Salvar Alterações' : 'Publicar Aviso'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageNotices;