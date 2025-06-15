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
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { BookOpen, PlusCircle, Edit, Trash2, Tag, FileText as FileIcon, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const ManageEBD = () => {
  const [studies, setStudies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(''); 
  const [category, setCategory] = useState('Adultos');
  const [baseText, setBaseText] = useState('');
  
  const [attachmentType, setAttachmentType] = useState('none'); // 'none', 'upload', 'link'
  const [pdfFile, setPdfFile] = useState(null); 
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfLink, setPdfLink] = useState('');
  
  const [coverImage, setCoverImage] = useState(null); 
  const [coverImageName, setCoverImageName] = useState('');


  useEffect(() => {
    const storedStudies = JSON.parse(localStorage.getItem('church-synch-ebd-studies')) || [];
    setStudies(storedStudies);
  }, []);

  const resetForm = () => {
    setTitle(''); setDescription(''); setContent(''); setCategory('Adultos');
    setBaseText(''); 
    setAttachmentType('none');
    setPdfFile(null); setPdfFileName(''); setPdfLink('');
    setCoverImage(null); setCoverImageName('');
  };

  const openModalForNew = () => {
    setEditingStudy(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openModalForEdit = (study) => {
    setEditingStudy(study);
    setTitle(study.title);
    setDescription(study.description || '');
    setContent(study.content || '');
    setCategory(study.category || 'Adultos');
    setBaseText(study.baseText || '');
    
    if (study.pdfUrl && study.pdfUrl.startsWith('mock-storage/')) {
        setAttachmentType('upload');
        setPdfFileName(study.pdfUrl.replace('mock-storage/', ''));
        setPdfLink('');
    } else if (study.pdfUrl) {
        setAttachmentType('link');
        setPdfLink(study.pdfUrl);
        setPdfFileName('');
    } else {
        setAttachmentType('none');
        setPdfLink('');
        setPdfFileName('');
    }
    setPdfFile(null); // Reset file input

    setCoverImage(null); // Reset file input
    setCoverImageName(study.coverImageUrl ? study.coverImageUrl.replace('mock-storage/', '') : '');
    
    setIsModalOpen(true);
  };

  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setPdfFileName(file.name);
      setPdfLink(''); // Clear link if file is chosen
      toast({ title: "Arquivo PDF Selecionado", description: file.name });
    }
  };
  
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverImageName(file.name);
      toast({ title: "Imagem de Capa Selecionada", description: file.name });
    }
  };


  const handleSaveStudy = (e) => {
    e.preventDefault();
    if (!title || (!content && attachmentType === 'none')) {
      toast({ title: "Erro", description: "Título e Conteúdo (texto ou anexo) são obrigatórios.", variant: "destructive" });
      return;
    }

    let finalPdfUrl = null;
    if (attachmentType === 'upload' && pdfFile) {
        finalPdfUrl = `mock-storage/${pdfFile.name}`; // Placeholder
    } else if (attachmentType === 'upload' && editingStudy?.pdfUrl?.startsWith('mock-storage/') && !pdfFile) {
        finalPdfUrl = editingStudy.pdfUrl; // Keep existing uploaded file if not changed
    } else if (attachmentType === 'link' && pdfLink) {
        finalPdfUrl = pdfLink;
    }

    let finalCoverImageUrl = null;
    if (coverImage) {
        finalCoverImageUrl = `mock-storage/${coverImage.name}`; // Placeholder
    } else if (editingStudy?.coverImageUrl && !coverImage) {
        finalCoverImageUrl = editingStudy.coverImageUrl; // Keep existing if not changed
    }


    const studyData = {
      title, description, content, category, baseText, 
      pdfUrl: finalPdfUrl, 
      coverImageUrl: finalCoverImageUrl, 
      date: editingStudy ? editingStudy.date : new Date().toISOString().split('T')[0],
      id: editingStudy ? editingStudy.id : Date.now().toString(),
      author: editingStudy?.author || 'Admin Church Synch', 
      likesCount: editingStudy?.likesCount || 0,
      commentsCount: editingStudy?.commentsCount || 0,
    };

    let updatedStudies;
    if (editingStudy) {
      updatedStudies = studies.map(s => s.id === editingStudy.id ? studyData : s);
      toast({ title: "Estudo Atualizado!", description: `${title} foi atualizado.` });
    } else {
      updatedStudies = [...studies, studyData];
      toast({ title: "Estudo Criado!", description: `${title} foi adicionado à EBD.` });
    }
    
    setStudies(updatedStudies);
    localStorage.setItem('church-synch-ebd-studies', JSON.stringify(updatedStudies));
    setIsModalOpen(false);
    setEditingStudy(null);
  };

  const handleDeleteStudy = (studyId) => {
    const updatedStudies = studies.filter(s => s.id !== studyId);
    setStudies(updatedStudies);
    localStorage.setItem('church-synch-ebd-studies', JSON.stringify(updatedStudies));
    toast({ title: "Estudo Removido", description: "O estudo foi removido da EBD." });
  };
  
  const categories = ['Crianças', 'Adolescentes', 'Jovens', 'Adultos', 'Novos Convertidos', 'Liderança', 'Outro'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div/>
        <Button onClick={openModalForNew} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="h-5 w-5 mr-2"/> Criar Novo Estudo
        </Button>
      </div>

      {studies.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum estudo da EBD cadastrado. Clique em "Criar Novo Estudo".</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studies.map(study => (
          <motion.div key={study.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <Card className="h-full flex flex-col shadow-lg rounded-xl overflow-hidden border-0">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              {study.coverImageUrl && <img src={study.coverImageUrl} alt={study.title} className="w-full h-32 object-cover"/>}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{study.title}</CardTitle>
                    <Badge variant="secondary">{study.category}</Badge>
                </div>
                <CardDescription className="text-xs line-clamp-2">{study.description || "Sem descrição."}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm">
                {study.baseText && <p className="flex items-center gap-1.5 text-primary mb-2"><Tag className="h-4 w-4"/> {study.baseText}</p>}
                {study.pdfUrl && <a href={study.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline"><FileIcon className="h-4 w-4"/> {study.pdfUrl.startsWith('mock-storage/') ? study.pdfUrl.replace('mock-storage/','') : 'Link Externo'}</a>}
                {!study.pdfUrl && study.content && <p className="text-muted-foreground line-clamp-3">{study.content}</p>}
              </CardContent>
              <DialogFooter className="p-4 border-t bg-card">
                <Button variant="outline" size="sm" onClick={() => openModalForEdit(study)}><Edit className="h-4 w-4 mr-1.5"/>Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteStudy(study.id)}><Trash2 className="h-4 w-4 mr-1.5"/>Excluir</Button>
              </DialogFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStudy ? 'Editar Estudo da EBD' : 'Criar Novo Estudo da EBD'}</DialogTitle>
            <DialogDescription>Preencha os detalhes do estudo abaixo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveStudy} className="space-y-4 py-4 max-h-[75vh] overflow-y-auto pr-2 text-sm">
            <div><Label htmlFor="study-title">Título do Estudo</Label><Input id="study-title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            <div><Label htmlFor="study-description">Descrição Curta</Label><Input id="study-description" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div><Label htmlFor="study-baseText">Texto Base (Ex: João 3:16)</Label><Input id="study-baseText" value={baseText} onChange={(e) => setBaseText(e.target.value)} /></div>
            <div><Label htmlFor="study-category">Categoria</Label>
                <select id="study-category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-md bg-background text-sm h-10">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div><Label htmlFor="study-content">Conteúdo do Estudo (Texto)</Label><Textarea id="study-content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Digite o conteúdo aqui ou anexe um arquivo abaixo."/></div>
            
            <Card className="p-4 bg-muted/30">
                <Label className="text-base font-medium">Anexo do Estudo (Opcional)</Label>
                <div className="flex gap-4 mt-2 mb-3">
                    <Button type="button" variant={attachmentType === 'none' ? 'default' : 'outline'} onClick={() => setAttachmentType('none')} size="sm">Sem Anexo</Button>
                    <Button type="button" variant={attachmentType === 'upload' ? 'default' : 'outline'} onClick={() => setAttachmentType('upload')} size="sm" className="gap-1.5"><UploadCloud className="h-4 w-4"/> Upload PDF</Button>
                    <Button type="button" variant={attachmentType === 'link' ? 'default' : 'outline'} onClick={() => setAttachmentType('link')} size="sm" className="gap-1.5"><LinkIcon className="h-4 w-4"/> Link PDF</Button>
                </div>

                {attachmentType === 'upload' && (
                    <div>
                        <Label htmlFor="study-pdfFile">Selecionar Arquivo PDF</Label>
                        <Input id="study-pdfFile" type="file" accept=".pdf" onChange={handlePdfFileChange} className="text-xs mt-1"/>
                        {pdfFileName && <p className="text-xs text-muted-foreground mt-1">Selecionado: {pdfFileName}</p>}
                        {editingStudy && editingStudy.pdfUrl?.startsWith('mock-storage/') && !pdfFile && <p className="text-xs text-muted-foreground mt-1">Arquivo existente: {editingStudy.pdfUrl.replace('mock-storage/','')}</p>}
                    </div>
                )}
                {attachmentType === 'link' && (
                    <div>
                        <Label htmlFor="study-pdfLink">Link Direto para o PDF</Label>
                        <Input id="study-pdfLink" type="url" value={pdfLink} onChange={(e) => setPdfLink(e.target.value)} placeholder="https://exemplo.com/estudo.pdf" className="mt-1"/>
                    </div>
                )}
            </Card>
            
            <div>
                <Label htmlFor="study-coverImage">Imagem de Capa (Opcional)</Label>
                 <div className="flex items-center gap-2 mt-1">
                    <Input id="study-coverImage" type="file" accept="image/*" onChange={handleCoverImageChange} className="text-xs"/>
                    {coverImageName && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{coverImageName}</span>}
                    {editingStudy && editingStudy.coverImageUrl && !coverImage && <span className="text-xs text-muted-foreground truncate max-w-[150px]">Capa existente: {editingStudy.coverImageUrl.replace('mock-storage/','')}</span>}
                </div>
            </div>
            
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90">{editingStudy ? 'Salvar Alterações' : 'Criar Estudo'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageEBD;