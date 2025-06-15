import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DownloadCloud, Search, BookOpen, FileText, Music, Film, SlidersHorizontal, CalendarDays, Info, Link as LinkIcon, Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock data, replace with API call in a real app
const mockDownloads = [
  { id: 1, title: 'Bíblia Sagrada NVI (PDF)', category: 'Bíblias', date: '2024-01-10', description: 'Nova Versão Internacional completa.', fileName: 'biblia_nvi.pdf', fileSize: '5 MB', type: 'pdf' },
  { id: 2, title: 'Estudo sobre Fé (Slides)', category: 'Estudos', date: '2024-01-15', description: 'Apresentação do estudo sobre a fé em Hebreus 11.', fileName: 'estudo_fe.pptx', fileSize: '2.3 MB', type: 'slides' },
  { id: 3, title: 'Devocional Semanal #12', category: 'Devocionais', date: '2024-01-18', description: 'Reflexão sobre Salmos 23.', fileName: 'devocional_s12.docx', fileSize: '300 KB', type: 'document' },
  { id: 4, title: 'Cântico "Grande És Tu" (Áudio)', category: 'Arquivos Áudio/Vídeo', date: '2024-01-05', description: 'Gravação do ensaio do coral.', fileName: 'grande_es_tu_ensaio.mp3', fileSize: '3.5 MB', type: 'audio' },
  { id: 5, title: 'Tutorial Sistema da Igreja (Vídeo)', category: 'Outros', date: '2024-01-20', description: 'Como usar as funcionalidades do app Church Synch.', fileName: 'tutorial_app.mp4', fileSize: '25 MB', type: 'video' },
  { id: 6, title: 'Bíblia Almeida Revista e Corrigida (PDF)', category: 'Bíblias', date: '2023-12-01', description: 'Versão clássica ARC.', fileName: 'biblia_arc.pdf', fileSize: '6 MB', type: 'pdf' },
  { id: 7, title: 'Material Discipulado Nível 1 (PDF)', category: 'Estudos', date: '2024-02-01', description: 'Primeiros passos na fé cristã.', fileName: 'discipulado_n1.pdf', fileSize: '1.2 MB', type: 'pdf' },
  { id: 8, title: 'Apostila Escola de Líderes', category: 'Estudos', date: '2024-02-10', description: 'Formação para liderança na igreja.', fileName: 'escola_lideres.pdf', fileSize: '4.5 MB', type: 'pdf' },
];

const getIconForCategory = (category) => {
  switch (category) {
    case 'Bíblias': return <BookOpen className="h-5 w-5" />;
    case 'Estudos': return <FileText className="h-5 w-5" />;
    case 'Devocionais': return <BookOpen className="h-5 w-5 opacity-80" />;
    case 'PDFs': return <FileText className="h-5 w-5" />;
    case 'Slides': return <FileText className="h-5 w-5 opacity-70" />;
    case 'Arquivos Áudio/Vídeo': return <Film className="h-5 w-5" />;
    default: return <DownloadCloud className="h-5 w-5" />;
  }
};

const getFileIcon = (type) => {
  if (type === 'pdf') return <FileText className="text-red-500 h-8 w-8" />;
  if (type === 'slides' || type.includes('ppt') || type.includes('key')) return <FileText className="text-orange-500 h-8 w-8" />;
  if (type.includes('doc') || type === 'document') return <FileText className="text-blue-500 h-8 w-8" />;
  if (type === 'audio' || type.includes('mp3') || type.includes('wav')) return <Music className="text-purple-500 h-8 w-8" />;
  if (type === 'video' || type.includes('mp4') || type.includes('mov')) return <Film className="text-teal-500 h-8 w-8" />;
  return <DownloadCloud className="text-gray-500 h-8 w-8" />;
}

const Downloads = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate(); 
  const [downloads, setDownloads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [categories, setCategories] = useState(['Todos']);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const loadedDownloads = JSON.parse(localStorage.getItem('church-synch-downloads')) || mockDownloads;
    setDownloads(loadedDownloads);
    const uniqueCategories = ['Todos', ...new Set(loadedDownloads.map(item => item.category))];
    setCategories(uniqueCategories);
  }, []);

  const handleDownload = (item) => {
    toast({
      title: `Baixando ${item.title}...`,
      description: "Esta é uma simulação. Em um app real, o download iniciaria aqui.",
    });
    // Simulate download:
    // const link = document.createElement('a');
    // link.href = `/path/to/your/files/${item.fileName}`; // Placeholder
    // link.download = item.fileName;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  };

  const filteredDownloads = downloads.filter(item =>
    (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (selectedCategory === 'Todos' || item.category === selectedCategory)
  );

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground border-0 overflow-hidden relative shadow-xl">
          <div className="absolute inset-0 church-pattern opacity-10"></div>
          <CardContent className="p-6 relative z-10">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3"><DownloadCloud className="h-8 w-8" /><h1 className="text-2xl font-bold">Recursos para Download</h1></div>
              <p className="text-primary-foreground/80">Materiais importantes para seu crescimento espiritual e ministerial.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card className="shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 items-center">
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-sm h-11"
              />
            </div>
            <div className="relative flex-grow w-full sm:w-auto">
              <SlidersHorizontal className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-md bg-background text-sm h-11 focus:ring-primary focus:border-primary appearance-none"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} title="Visualização em Grade">
                    <Grid className="h-5 w-5"/>
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} title="Visualização em Lista">
                    <List className="h-5 w-5"/>
                </Button>
            </div>
            {isAdmin && (
              <Button onClick={() => navigate('/admin/downloads')} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                <Info className="h-4 w-4 mr-2"/> Gerenciar Downloads
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      {filteredDownloads.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum recurso encontrado</h3>
          <p className="text-muted-foreground">Tente ajustar sua busca ou filtros.</p>
        </motion.div>
      )}

      <motion.div 
        className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
        variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } }
        }}
        initial="hidden"
        animate="show"
       >
        {filteredDownloads.map(item => (
          <motion.div key={item.id} variants={{hidden: { opacity:0, y:10 }, show: { opacity:1, y:0 } }} layout>
            <Card className={`h-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200 border-0 overflow-hidden group bg-card ${viewMode === 'list' ? 'sm:flex-row sm:items-center' : ''}`}>
              <div className={`${viewMode === 'list' ? 'sm:w-20 sm:h-full flex items-center justify-center p-4 bg-muted/30' : `h-2 bg-gradient-to-r from-${item.category === 'Bíblias' ? 'blue' : 'green'}-500 to-${item.category === 'Bíblias' ? 'sky' : 'emerald'}-600`}`}>
                  {viewMode === 'list' && getFileIcon(item.type)}
                  {viewMode === 'grid' && <div className={`h-2 bg-gradient-to-r from-${item.category === 'Bíblias' ? 'blue' : 'green'}-500 to-${item.category === 'Bíblias' ? 'sky' : 'emerald'}-600`}></div>}
              </div>
              
              <div className="flex flex-col flex-1 p-4">
                <CardHeader className={`p-0 pb-2 ${viewMode === 'list' ? 'sm:pb-0' : ''}`}>
                  <div className="flex justify-between items-start">
                    <CardTitle className={`text-md leading-tight text-card-foreground ${viewMode === 'grid' ? 'sm:text-lg' : 'sm:text-base'}`}>{item.title}</CardTitle>
                    {viewMode === 'grid' && (
                        <Badge variant="outline" className="text-xs whitespace-nowrap ml-2 hidden sm:inline-flex items-center gap-1">
                            {getIconForCategory(item.category)} {item.category}
                        </Badge>
                    )}
                  </div>
                  {viewMode === 'list' && (
                    <Badge variant="outline" className="text-xs whitespace-nowrap mt-1 inline-flex items-center gap-1">
                        {getIconForCategory(item.category)} {item.category}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className={`p-0 text-xs text-muted-foreground flex-grow ${viewMode === 'grid' ? 'sm:text-sm' : 'sm:text-xs'}`}>
                  <p className="line-clamp-2 sm:line-clamp-3">{item.description}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5"/> {item.date}</span>
                    <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5"/> {item.fileSize}</span>
                  </div>
                </CardContent>
                <div className="mt-3 pt-3 border-t border-border">
                    <Button onClick={() => handleDownload(item)} size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                        <DownloadCloud className="h-4 w-4 mr-2" /> Baixar Arquivo
                    </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Downloads;