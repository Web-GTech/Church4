import React, { useState, useEffect } from 'react';
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
import { Music, PlusCircle, Edit, Trash2, Tag, Link as LinkIcon, Youtube, BookOpen as CifraIcon, Users } from 'lucide-react'; // Users adicionado
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const ManageRepertoire = () => {
  const [songs, setSongs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('');
  const [bpm, setBpm] = useState('');
  const [ministry, setMinistry] = useState('Louvor');
  const [videoUrl, setVideoUrl] = useState('');
  const [cifraUrl, setCifraUrl] = useState('');
  const [letraUrl, setLetraUrl] = useState('');
  const [tags, setTags] = useState(''); // Comma-separated

  useEffect(() => {
    const storedSongs = JSON.parse(localStorage.getItem('church-synch-repertoire')) || [];
    setSongs(storedSongs);
  }, []);

  const resetForm = () => {
    setTitle(''); setArtist(''); setKey(''); setBpm(''); setMinistry('Louvor');
    setVideoUrl(''); setCifraUrl(''); setLetraUrl(''); setTags('');
  };

  const openModalForNew = () => {
    setEditingSong(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openModalForEdit = (song) => {
    setEditingSong(song);
    setTitle(song.title);
    setArtist(song.artist);
    setKey(song.key || '');
    setBpm(song.bpm || '');
    setMinistry(song.ministry || 'Louvor');
    setVideoUrl(song.videoUrl || '');
    setCifraUrl(song.cifraUrl || '');
    setLetraUrl(song.letraUrl || '');
    setTags((song.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSaveSong = (e) => {
    e.preventDefault();
    if (!title || !artist) {
      toast({ title: "Erro", description: "Título e Artista são obrigatórios.", variant: "destructive" });
      return;
    }

    const songData = {
      title, artist, key, bpm, ministry, videoUrl, cifraUrl, letraUrl,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      dateAdded: editingSong ? editingSong.dateAdded : new Date().toISOString().split('T')[0],
      id: editingSong ? editingSong.id : Date.now()
    };

    let updatedSongs;
    if (editingSong) {
      updatedSongs = songs.map(s => s.id === editingSong.id ? songData : s);
      toast({ title: "Música Atualizada!", description: `${title} foi atualizada.` });
    } else {
      updatedSongs = [...songs, songData];
      toast({ title: "Música Adicionada!", description: `${title} foi adicionada ao repertório.` });
    }
    
    setSongs(updatedSongs);
    localStorage.setItem('church-synch-repertoire', JSON.stringify(updatedSongs));
    setIsModalOpen(false);
    setEditingSong(null);
  };

  const handleDeleteSong = (songId) => {
    const updatedSongs = songs.filter(s => s.id !== songId);
    setSongs(updatedSongs);
    localStorage.setItem('church-synch-repertoire', JSON.stringify(updatedSongs));
    toast({ title: "Música Removida", description: "A música foi removida do repertório." });
  };
  
  const ministriesOptions = ['Louvor', 'Adoração', 'Jovens', 'Crianças', 'Eventos Especiais', 'Outro'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div/>
        <Button onClick={openModalForNew} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="h-5 w-5 mr-2"/> Adicionar Nova Música
        </Button>
      </div>

      {songs.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma música cadastrada ainda. Clique em "Adicionar Nova Música".</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map(song => (
          <motion.div key={song.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <Card className="h-full flex flex-col shadow-lg rounded-xl overflow-hidden border-0">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600"></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{song.title}</CardTitle>
                    <Badge variant="secondary">{song.key || 'N/A'}</Badge>
                </div>
                <CardDescription className="text-xs">{song.artist}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm">
                <p className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary"/> Ministério: {song.ministry}</p>
                {song.bpm && <p className="flex items-center gap-1.5"><Tag className="h-4 w-4 text-primary"/> BPM: {song.bpm}</p>}
                {song.tags && song.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                        {song.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                    </div>
                )}
              </CardContent>
              <DialogFooter className="p-4 border-t bg-card">
                <Button variant="outline" size="sm" onClick={() => openModalForEdit(song)}><Edit className="h-4 w-4 mr-1.5"/>Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteSong(song.id)}><Trash2 className="h-4 w-4 mr-1.5"/>Excluir</Button>
              </DialogFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSong ? 'Editar Música' : 'Adicionar Nova Música'}</DialogTitle>
            <DialogDescription>Preencha os detalhes da música abaixo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSong} className="space-y-3 py-4 max-h-[70vh] overflow-y-auto pr-2 text-sm">
            <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="song-title">Título</Label><Input id="song-title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div><Label htmlFor="song-artist">Artista</Label><Input id="song-artist" value={artist} onChange={(e) => setArtist(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="song-key">Tom</Label><Input id="song-key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Ex: G, Am"/></div>
                <div><Label htmlFor="song-bpm">BPM</Label><Input id="song-bpm" type="number" value={bpm} onChange={(e) => setBpm(e.target.value)} /></div>
            </div>
            <div><Label htmlFor="song-ministry">Ministério</Label>
                <select id="song-ministry" value={ministry} onChange={(e) => setMinistry(e.target.value)} className="w-full p-2 border rounded-md bg-background text-sm h-10">
                    {ministriesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <div><Label htmlFor="song-video">Link YouTube</Label><Input id="song-video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." /></div>
            <div><Label htmlFor="song-cifra">Link Cifra</Label><Input id="song-cifra" value={cifraUrl} onChange={(e) => setCifraUrl(e.target.value)} placeholder="https://cifraclub.com.br/..." /></div>
            <div><Label htmlFor="song-letra">Link Letras</Label><Input id="song-letra" value={letraUrl} onChange={(e) => setLetraUrl(e.target.value)} placeholder="https://letras.mus.br/..." /></div>
            <div><Label htmlFor="song-tags">Tags (separadas por vírgula)</Label><Input id="song-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Ex: adoração, rápida, ceia" /></div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">{editingSong ? 'Salvar Alterações' : 'Adicionar Música'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageRepertoire;