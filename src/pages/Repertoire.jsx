import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Music, Search, Users, Hash, Youtube, Headphones, PlusCircle, Send, BookOpen, Music2 as GuitarIcon, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const Repertoire = () => {
  const { user, isAdmin } = useAuth();
  const [songs, setSongs] = useState([]);
  
  const [searchArtist, setSearchArtist] = useState('');
  const [searchSongTitle, setSearchSongTitle] = useState('');
  const [searchType, setSearchType] = useState('cifra'); // 'cifra' or 'letra'

  const [filterArtist, setFilterArtist] = useState('');
  const [filterTitle, setFilterTitle] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('all');
  
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [newSongData, setNewSongData] = useState({
    title: '', artist: '', key: '', bpm: '', ministry: 'Louvor',
    videoUrl: '', cifraUrl: '', letraUrl: '', tags: ''
  });
  const [isSendToLiturgyModalOpen, setIsSendToLiturgyModalOpen] = useState(false);
  const [songToSendToLiturgy, setSongToSendToLiturgy] = useState(null);
  const [liturgyDate, setLiturgyDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  useEffect(() => {
    const storedSongs = JSON.parse(localStorage.getItem('church-synch-repertoire')) || [];
    const mockSongs = [
      { id: 1, title: 'Quão Grande é o Meu Deus', artist: 'Chris Tomlin', key: 'G', ministry: 'Louvor', videoUrl: 'https://www.youtube.com/watch?v=SimY_o_0kXk', cifraUrl: '', letraUrl: '', bpm: 76, tags: ['adoração', 'clássico'], dateAdded: '2024-01-10' },
      { id: 2, title: 'Uma Nova História', artist: 'Fernandinho', key: 'C', ministry: 'Louvor', videoUrl: 'https://www.youtube.com/watch?v=uS0E02N_4hI', cifraUrl: '', letraUrl: '', bpm: 130, tags: ['avivamento', 'contemporâneo'], dateAdded: '2024-01-15' },
      { id: 3, title: 'Casa do Pai', artist: 'Aline Barros', key: 'D', ministry: 'Louvor', videoUrl: 'https://www.youtube.com/watch?v=O6Z3VlG6oJs', cifraUrl: '', letraUrl: '', bpm: 72, tags: ['comunhão', 'popular'], dateAdded: '2024-01-20' },
    ];
    const combined = [...mockSongs.filter(ms => !storedSongs.find(ss => ss.id === ms.id)), ...storedSongs];
    setSongs(combined);
  }, []);
  
  const ministries = ['all', 'Louvor', 'Adoração', 'Jovens', 'Crianças', ...new Set(songs.map(song => song.ministry).filter(Boolean))].filter((v, i, a) => a.indexOf(v) === i);


  const filteredSongs = songs.filter(song => {
    const matchesArtist = !filterArtist || song.artist?.toLowerCase().includes(filterArtist.toLowerCase());
    const matchesSongTitle = !filterTitle || song.title?.toLowerCase().includes(filterTitle.toLowerCase());
    const matchesMinistry = selectedMinistry === 'all' || song.ministry === selectedMinistry;
    return matchesArtist && matchesSongTitle && matchesMinistry;
  });

  const handleDynamicSearch = () => {
    if (!searchArtist) {
      toast({ title: "Artista não informado", description: "Por favor, informe o nome do artista.", variant: "destructive" });
      return;
    }
    let url = '';
    const artistSlug = slugify(searchArtist);
    const songSlug = slugify(searchSongTitle);

    if (searchSongTitle) { 
      if (searchType === 'cifra') {
        url = `https://www.cifraclub.com.br/${artistSlug}/${songSlug}/`;
      } else { 
        url = `https://www.letras.mus.br/${artistSlug}/${songSlug}/`;
      }
    } else { 
       if (searchType === 'cifra') {
        url = `https://www.cifraclub.com.br/${artistSlug}/`;
      } else { 
        url = `https://www.letras.mus.br/${artistSlug}/`;
      }
    }
    window.open(url, '_blank');
  };


  const getKeyColor = (key) => {
    const keyUpper = key?.toUpperCase().replace('#', 's').replace('b', 'f'); // Handle sharp/flat simple way
    const colors = {
      'C': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Cs': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', // C#
      'D': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Ds': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', // D#
      'E': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'F': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
      'Fs': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', // F#
      'G': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'Gs': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200', // G#
      'A': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'As': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200', // A#
      'B': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'AM': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', // Example for minor
      'GM': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[keyUpper] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const handleAddSong = () => {
    if (!newSongData.title || !newSongData.artist) {
      toast({ title: "Erro", description: "Título e Artista são obrigatórios.", variant: "destructive" });
      return;
    }
    const songToAdd = {
      id: Date.now(), ...newSongData,
      tags: newSongData.tags.split(',').map(t => t.trim()).filter(t => t),
      dateAdded: new Date().toISOString().split('T')[0],
    };
    const updatedSongs = [...songs, songToAdd];
    setSongs(updatedSongs);
    localStorage.setItem('church-synch-repertoire', JSON.stringify(updatedSongs));
    toast({ title: "Música Adicionada!", description: `${songToAdd.title} foi adicionada ao repertório.` });
    setIsAddSongModalOpen(false);
    setNewSongData({ title: '', artist: '', key: '', bpm: '', ministry: 'Louvor', videoUrl: '', cifraUrl: '', letraUrl: '', tags: '' });
  };

  const openSendToLiturgyModal = (song) => {
    setSongToSendToLiturgy(song);
    setIsSendToLiturgyModalOpen(true);
  };

  const confirmSendToLiturgy = () => {
    if (!songToSendToLiturgy || !liturgyDate) {
      toast({ title: "Erro", description: "Selecione uma música e data do culto.", variant: "destructive" });
      return;
    }
    // Logic to add song to liturgy (e.g., save to localStorage or send to backend)
    let currentLiturgy = JSON.parse(localStorage.getItem('church-synch-current-liturgy')) || { items: [] };
    
    // Find the 'Louvor e Adoração' step or create if not exists for the selected date
    // This is a simplified example. A real app would handle liturgies for specific dates better.
    let worshipStep = currentLiturgy.items.find(item => item.type === 'worship');
    if (worshipStep) {
        if (!worshipStep.songs) worshipStep.songs = [];
        worshipStep.songs.push(songToSendToLiturgy.title);
    } else {
        // Add a new worship step if none exists (basic example)
        currentLiturgy.items.push({
            id: Date.now(),
            time: 'A definir',
            title: 'Louvor e Adoração',
            responsible: 'Ministério de Louvor',
            type: 'worship',
            description: `Culto de ${new Date(liturgyDate).toLocaleDateString('pt-BR')}`,
            songs: [songToSendToLiturgy.title],
            duration: 30
        });
    }
    currentLiturgy.date = new Date(liturgyDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    localStorage.setItem('church-synch-current-liturgy', JSON.stringify(currentLiturgy));

    toast({ title: "Música Enviada!", description: `${songToSendToLiturgy.title} adicionada à liturgia de ${new Date(liturgyDate).toLocaleDateString('pt-BR')}.` });
    setIsSendToLiturgyModalOpen(false);
    setSongToSendToLiturgy(null);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground border-0 overflow-hidden relative shadow-xl">
          <div className="absolute inset-0 church-pattern opacity-10"></div>
          <CardContent className="p-6 relative z-10">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3"><Music className="h-8 w-8" /><h1 className="text-2xl font-bold">Repertório Musical</h1></div>
              <p className="text-primary-foreground/80">Busque, explore e prepare os cânticos para os cultos.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dynamic Search Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ExternalLink className="text-primary h-5 w-5"/> Busca Rápida Externa</CardTitle>
            <CardDescription>Encontre letras ou cifras em sites externos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search-artist-external">Nome do Artista</Label>
                <Input id="search-artist-external" placeholder="Ex: Aline Barros" value={searchArtist} onChange={(e) => setSearchArtist(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="search-song-external">Nome da Música (Opcional)</Label>
                <Input id="search-song-external" placeholder="Ex: Casa do Pai" value={searchSongTitle} onChange={(e) => setSearchSongTitle(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="flex gap-2">
                <Button variant={searchType === 'cifra' ? 'default' : 'outline'} onClick={() => setSearchType('cifra')} className="flex-1 sm:flex-none">CifraClub</Button>
                <Button variant={searchType === 'letra' ? 'default' : 'outline'} onClick={() => setSearchType('letra')} className="flex-1 sm:flex-none">Letras.mus.br</Button>
              </div>
              <Button onClick={handleDynamicSearch} className="w-full sm:w-auto flex-grow sm:flex-grow-0 bg-primary hover:bg-primary/90">
                <Search className="h-4 w-4 mr-2"/> Buscar {searchType === 'cifra' ? 'Cifra' : 'Letra'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Internal Repertoire List & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Music className="text-primary h-5 w-5"/> Repertório da Igreja</CardTitle>
            <CardDescription>Filtre e visualize as músicas cadastradas.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                    <Label htmlFor="filter-title" className="text-xs text-muted-foreground">Buscar por Título</Label>
                    <Input id="filter-title" placeholder="Ex: Grande é o Senhor" value={filterTitle} onChange={(e) => setFilterTitle(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="filter-artist" className="text-xs text-muted-foreground">Buscar por Artista</Label>
                    <Input id="filter-artist" placeholder="Ex: Fernandinho" value={filterArtist} onChange={(e) => setFilterArtist(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="filter-ministry" className="text-xs text-muted-foreground">Filtrar por Ministério</Label>
                    <select id="filter-ministry" value={selectedMinistry} onChange={(e) => setSelectedMinistry(e.target.value)} className="w-full p-2.5 border rounded-md bg-background text-sm h-10 focus:ring-primary focus:border-primary">
                    {ministries.map(m => <option key={m} value={m}>{m === 'all' ? 'Todos Ministérios' : m}</option>)}
                    </select>
                </div>
            </div>
            {isAdmin && (
              <div className="flex justify-end">
                <Button onClick={() => setIsAddSongModalOpen(true)} className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="h-5 w-5 mr-2"/> Adicionar Música
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredSongs.map((song, index) => (
          <motion.div 
            key={song.id} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.3, delay: index * 0.05 }} 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="h-full hover:shadow-xl transition-shadow duration-200 border-0 overflow-hidden group flex flex-col shadow-md bg-card">
              <div className={`h-2 ${getKeyColor(song.key).split(' ')[0]}`}></div>
              <CardHeader className="pb-3 flex-grow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl leading-tight text-card-foreground">{song.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{song.artist}</p>
                  </div>
                  <Badge className={`${getKeyColor(song.key)} border-0`}>{song.key || 'N/A'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1"><Users className="h-3 w-3 sm:h-4 sm:w-4" /><span>{song.ministry || 'N/A'}</span></div>
                  <div className="flex items-center gap-1"><Hash className="h-3 w-3 sm:h-4 sm:w-4" /><span>{song.bpm ? `${song.bpm} BPM` : 'N/A'}</span></div>
                </div>
                {song.tags && song.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {song.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" asChild className="justify-start gap-2 text-xs sm:text-sm hover:bg-accent"><a href={song.letraUrl || `https://www.letras.mus.br/${slugify(song.artist)}/${slugify(song.title)}`} target="_blank" rel="noopener noreferrer"><BookOpen className="h-4 w-4"/> Letras</a></Button>
                  <Button variant="outline" size="sm" asChild className="justify-start gap-2 text-xs sm:text-sm hover:bg-accent"><a href={song.cifraUrl || `https://www.cifraclub.com.br/${slugify(song.artist)}/${slugify(song.title)}/`} target="_blank" rel="noopener noreferrer"><GuitarIcon className="h-4 w-4"/> CifraClub</a></Button>
                  <Button variant="outline" size="sm" asChild className="justify-start gap-2 text-xs sm:text-sm hover:bg-accent"><a href={song.videoUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(song.artist + ' ' + song.title)}`} target="_blank" rel="noopener noreferrer"><Youtube className="h-4 w-4"/> YouTube</a></Button>
                  <Button variant="outline" size="sm" asChild className="justify-start gap-2 text-xs sm:text-sm hover:bg-accent"><a href={`https://www.deezer.com/br/search/${encodeURIComponent(song.artist + ' ' + song.title)}`} target="_blank" rel="noopener noreferrer"><Headphones className="h-4 w-4"/> Deezer</a></Button>
                </div>
                {isAdmin && (
                   <Button size="sm" className="w-full mt-2 bg-primary hover:bg-primary/90" onClick={() => openSendToLiturgyModal(song)}>
                     <Send className="h-4 w-4 mr-2" /> Enviar para Liturgia
                   </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredSongs.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">Nenhuma música encontrada</h3>
          <p className="text-muted-foreground">Tente ajustar os filtros ou adicione novas músicas.</p>
        </motion.div>
      )}

      <Dialog open={isAddSongModalOpen} onOpenChange={setIsAddSongModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Adicionar Nova Música</DialogTitle><DialogDescription>Preencha os detalhes da música abaixo.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="song-title" className="text-right">Título</Label><Input id="song-title" value={newSongData.title} onChange={(e) => setNewSongData({...newSongData, title: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="song-artist" className="text-right">Artista</Label><Input id="song-artist" value={newSongData.artist} onChange={(e) => setNewSongData({...newSongData, artist: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="song-key" className="text-right">Tom</Label><Input id="song-key" value={newSongData.key} onChange={(e) => setNewSongData({...newSongData, key: e.target.value})} className="col-span-3" placeholder="Ex: G, Am, C#"/></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="song-bpm" className="text-right">BPM</Label><Input id="song-bpm" type="number" value={newSongData.bpm} onChange={(e) => setNewSongData({...newSongData, bpm: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="song-ministry" className="text-right">Ministério</Label>
              <select id="song-ministry" value={newSongData.ministry} onChange={(e) => setNewSongData({...newSongData, ministry: e.target.value})} className="col-span-3 p-2 border rounded-md bg-background text-sm h-10 focus:ring-primary focus:border-primary">
                {ministries.filter(m => m !== 'all').map(m => <option key={m} value={m}>{m}</option>)}
                <option value="Outro">Outro (especifique nas tags)</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="song-video" className="text-right">Link YouTube</Label><Input id="song-video" value={newSongData.videoUrl} onChange={(e) => setNewSongData({...newSongData, videoUrl: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="song-cifra" className="text-right">Link Cifra</Label><Input id="song-cifra" value={newSongData.cifraUrl} onChange={(e) => setNewSongData({...newSongData, cifraUrl: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="song-letra" className="text-right">Link Letras</Label><Input id="song-letra" value={newSongData.letraUrl} onChange={(e) => setNewSongData({...newSongData, letraUrl: e.target.value})} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="song-tags" className="text-right">Tags</Label><Input id="song-tags" value={newSongData.tags} onChange={(e) => setNewSongData({...newSongData, tags: e.target.value})} className="col-span-3" placeholder="Ex: adoração,rápida,pascoa" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAddSongModalOpen(false)}>Cancelar</Button><Button onClick={handleAddSong} className="bg-primary hover:bg-primary/90">Adicionar Música</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {songToSendToLiturgy && (
        <Dialog open={isSendToLiturgyModalOpen} onOpenChange={setIsSendToLiturgyModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Enviar para Liturgia</DialogTitle><DialogDescription>Selecione a data do culto para adicionar "{songToSendToLiturgy.title}".</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="liturgy-date">Data do Culto</Label>
                <Input id="liturgy-date" type="date" value={liturgyDate} onChange={(e) => setLiturgyDate(e.target.value)} className="focus:ring-primary focus:border-primary"/>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsSendToLiturgyModalOpen(false)}>Cancelar</Button><Button onClick={confirmSendToLiturgy} className="bg-primary hover:bg-primary/90">Confirmar Envio</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Repertoire;