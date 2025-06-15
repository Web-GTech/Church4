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
import { DownloadCloud, PlusCircle, Edit, Trash2, FileText, Link as LinkIcon, Tag, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const ManageDownloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDownload, setEditingDownload] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('PDFs');
  const [file, setFile] = useState(null); 
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileUrl, setFileUrl] = useState(''); 
  const [fileType, setFileType] = useState('pdf'); 
  const [uploadType, setUploadType] = useState('link'); // 'link' or 'upload'

  useEffect(() => {
    const storedDownloads = JSON.parse(localStorage.getItem('church-synch-downloads')) || [];
    setDownloads(storedDownloads);
  }, []);

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory('PDFs'); setFile(null);
    setFileName(''); setFileSize(''); setFileUrl(''); setFileType('pdf');
    setUploadType('link');
  };

  const openModalForNew = () => {
    setEditingDownload(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openModalForEdit = (download) => {
    setEditingDownload(download);
    setTitle(download.title);
    setDescription(download.description || '');
    setCategory(download.category || 'PDFs');
    setFileName(download.fileName || '');
    setFileSize(download.fileSize || '');
    setFileUrl(download.fileUrl || ''); 
    setFileType(download.type || 'pdf');
    setFile(null); 
    setUploadType(download.fileUrl && !download.fileName?.startsWith('mock-storage/') ? 'link' : 'upload'); // Infer based on existing data
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileSize((selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'); 
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      if (['pdf'].includes(ext)) setFileType('pdf');
      else if (['doc', 'docx'].includes(ext)) setFileType('document');
      else if (['ppt', 'pptx'].includes(ext)) setFileType('slides');
      else if (['mp3', 'wav', 'aac'].includes(ext)) setFileType('audio');
      else if (['mp4', 'mov', 'avi'].includes(ext)) setFileType('video');
      else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) setFileType('image');
      else setFileType('other');
      setFileUrl(''); // Clear URL if a file is selected
      toast({ title: "Arquivo Selecionado", description: selectedFile.name });
    }
  };

  const handleSaveDownload = (e) => {
    e.preventDefault();
    if (!title || (uploadType === 'upload' && !file && !editingDownload?.fileName) || (uploadType === 'link' && !fileUrl)) {
      toast({ title: "Erro", description: "Título e um Arquivo (ou URL) são obrigatórios.", variant: "destructive" });
      return;
    }

    let finalFileUrl = fileUrl;
    let finalFileName = fileName;
    let finalFileSize = fileSize;
    let finalFileType = fileType;

    if (uploadType === 'upload' && file) {
        finalFileUrl = `mock-storage/${file.name}`; // Placeholder for uploaded file
        finalFileName = file.name;
        finalFileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
        const ext = file.name.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) finalFileType = 'pdf';
        else if (['doc', 'docx'].includes(ext)) finalFileType = 'document';
        else if (['ppt', 'pptx'].includes(ext)) finalFileType = 'slides';
        else if (['mp3', 'wav', 'aac'].includes(ext)) finalFileType = 'audio';
        else if (['mp4', 'mov', 'avi'].includes(ext)) finalFileType = 'video';
        else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) finalFileType = 'image';
        else finalFileType = 'other';
    } else if (uploadType === 'link') {
        // fileName, fileSize, fileType might need to be manually set if not inferred from URL
        if (!finalFileName && finalFileUrl) {
            try {
                const urlParts = new URL(finalFileUrl);
                finalFileName = urlParts.pathname.split('/').pop() || 'arquivo_linkado';
            } catch (error) {
                finalFileName = 'arquivo_linkado';
            }
        }
    }


    const downloadData = {
      title, description, category, 
      fileName: finalFileName || editingDownload?.fileName, 
      fileSize: finalFileSize || editingDownload?.fileSize, 
      type: finalFileType || editingDownload?.type,
      fileUrl: finalFileUrl || editingDownload?.fileUrl, 
      date: editingDownload ? editingDownload.date : new Date().toISOString().split('T')[0],
      id: editingDownload ? editingDownload.id : Date.now().toString(),
    };

    let updatedDownloads;
    if (editingDownload) {
      updatedDownloads = downloads.map(d => d.id === editingDownload.id ? downloadData : d);
      toast({ title: "Download Atualizado!", description: `${title} foi atualizado.` });
    } else {
      updatedDownloads = [...downloads, downloadData];
      toast({ title: "Download Adicionado!", description: `${title} foi adicionado à lista.` });
    }
    
    setDownloads(updatedDownloads);
    localStorage.setItem('church-synch-downloads', JSON.stringify(updatedDownloads));
    setIsModalOpen(false);
    setEditingDownload(null);
  };

  const handleDeleteDownload = (downloadId) => {
    const updatedDownloads = downloads.filter(d => d.id !== downloadId);
    setDownloads(updatedDownloads);
    localStorage.setItem('church-synch-downloads', JSON.stringify(updatedDownloads));
    toast({ title: "Download Removido", description: "O item foi removido da lista de downloads." });
  };
  
  const categories = ['Bíblias', 'Estudos', 'Devocionais', 'PDFs', 'Slides', 'Arquivos Áudio/Vídeo', 'Imagens', 'Outros'];
  const fileTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'document', label: 'Documento (Word, etc)' },
    { value: 'slides', label: 'Apresentação (PPT, Keynote)' },
    { value: 'audio', label: 'Áudio (MP3, WAV)' },
    { value: 'video', label: 'Vídeo (MP4, MOV)' },
    { value: 'image', label: 'Imagem (JPG, PNG)' },
    { value: 'archive', label: 'Arquivo Comprimido (ZIP, RAR)'},
    { value: 'other', label: 'Outro' }
  ];


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div/>
        <Button onClick={openModalForNew} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="h-5 w-5 mr-2"/> Adicionar Novo Download
        </Button>
      </div>

      {downloads.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <DownloadCloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum item de download cadastrado. Clique em "Adicionar Novo Download".</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {downloads.map(item => (
          <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <Card className="h-full flex flex-col shadow-lg rounded-xl overflow-hidden border-0">
              <div className="h-2 bg-gradient-to-r from-sky-500 to-cyan-600"></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <Badge variant="secondary" className="whitespace-nowrap">{item.category}</Badge>
                </div>
                <CardDescription className="text-xs line-clamp-2">{item.description || "Sem descrição."}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm space-y-1">
                <p className="flex items-center gap-1.5 text-muted-foreground"><FileText className="h-4 w-4"/> Nome: {item.fileName || 'N/A'}</p>
                <p className="flex items-center gap-1.5 text-muted-foreground"><Tag className="h-4 w-4"/> Tipo: {item.type || 'N/A'}</p>
                <p className="flex items-center gap-1.5 text-muted-foreground"><DownloadCloud className="h-4 w-4"/> Tamanho: {item.fileSize || 'N/A'}</p>
                {item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline"><LinkIcon className="h-4 w-4"/> Acessar/Baixar</a>}
              </CardContent>
              <DialogFooter className="p-4 border-t bg-card">
                <Button variant="outline" size="sm" onClick={() => openModalForEdit(item)}><Edit className="h-4 w-4 mr-1.5"/>Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteDownload(item.id)}><Trash2 className="h-4 w-4 mr-1.5"/>Excluir</Button>
              </DialogFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingDownload ? 'Editar Item de Download' : 'Adicionar Novo Item de Download'}</DialogTitle>
            <DialogDescription>Preencha os detalhes do arquivo abaixo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveDownload} className="space-y-3 py-4 max-h-[70vh] overflow-y-auto pr-2 text-sm">
            <div><Label htmlFor="download-title">Título do Item</Label><Input id="download-title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            <div><Label htmlFor="download-description">Descrição Curta</Label><Textarea id="download-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2}/></div>
            <div><Label htmlFor="download-category">Categoria</Label>
                <select id="download-category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-md bg-background text-sm h-10">
                    {categories.filter(c=>c !== 'Todos').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <Label>Tipo de Fonte do Arquivo</Label>
                <div className="flex gap-4">
                    <Button type="button" variant={uploadType === 'link' ? 'default' : 'outline'} onClick={() => setUploadType('link')} className="flex-1 gap-2"><LinkIcon className="h-4 w-4"/> Link Direto</Button>
                    <Button type="button" variant={uploadType === 'upload' ? 'default' : 'outline'} onClick={() => setUploadType('upload')} className="flex-1 gap-2"><UploadCloud className="h-4 w-4"/> Upload de Arquivo</Button>
                </div>
            </div>

            {uploadType === 'upload' && (
                <div>
                    <Label htmlFor="download-file">Arquivo</Label>
                    <Input id="download-file" type="file" onChange={handleFileChange} className="text-xs"/>
                    {fileName && !fileUrl && <p className="text-xs text-muted-foreground mt-1">Selecionado: {fileName} ({fileSize}, Tipo: {fileType})</p>}
                    {editingDownload && editingDownload.fileName && !file && <p className="text-xs text-muted-foreground mt-1">Arquivo existente: {editingDownload.fileName}</p>}
                </div>
            )}

            {uploadType === 'link' && (
                <div>
                    <Label htmlFor="download-fileUrl">URL Externa do Arquivo</Label>
                    <Input id="download-fileUrl" value={fileUrl} onChange={(e) => { setFileUrl(e.target.value); setFile(null); setFileName(''); setFileSize(''); }} placeholder="https://exemplo.com/arquivo.pdf" required={uploadType === 'link'}/>
                </div>
            )}
            
            {(uploadType === 'link' && fileUrl) && ( 
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label htmlFor="edit-fileName">Nome do Arquivo (manual)</Label><Input id="edit-fileName" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Ex: manual.pdf"/></div>
                    <div><Label htmlFor="edit-fileType">Tipo do Arquivo (manual)</Label>
                        <select id="edit-fileType" value={fileType} onChange={(e) => setFileType(e.target.value)} className="w-full p-2 border rounded-md bg-background text-sm h-10">
                            {fileTypes.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                        </select>
                    </div>
                     <div><Label htmlFor="edit-fileSize">Tamanho (manual)</Label><Input id="edit-fileSize" value={fileSize} onChange={(e) => setFileSize(e.target.value)} placeholder="Ex: 2.5 MB"/></div>
                </div>
             )}
            
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90">{editingDownload ? 'Salvar Alterações' : 'Adicionar Item'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageDownloads;