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
import { FileText, PlusCircle, Edit, Trash2, Calendar, User, Music, Send, Eye, Copy, ListOrdered, GripVertical, XCircle, Link as LinkIcon, FileSymlink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const ManageLiturgy = () => {
  const [liturgies, setLiturgies] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allSongs, setAllSongs] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLiturgy, setEditingLiturgy] = useState(null); 
  
  const [liturgyDate, setLiturgyDate] = useState('');
  const [liturgyTheme, setLiturgyTheme] = useState('');
  const [liturgyVerse, setLiturgyVerse] = useState('');
  const [liturgySteps, setLiturgySteps] = useState([{ id: Date.now().toString(), title: '', type: 'prayer', responsibleId: '', songIds: [], description: '', duration: 10, status: 'pendente' }]);
  const [isPublicLinkEnabled, setIsPublicLinkEnabled] = useState(false);

  useEffect(() => {
    const storedLiturgies = JSON.parse(localStorage.getItem('church-synch-all-liturgies')) || [];
    setLiturgies(storedLiturgies);

    const mockUsers = JSON.parse(localStorage.getItem('church-synch-users')) || [];
    setAllUsers(mockUsers);
    
    const mockSongs = JSON.parse(localStorage.getItem('church-synch-repertoire')) || [];
    setAllSongs(mockSongs);
  }, []);

  const openModalForNew = () => {
    setEditingLiturgy(null);
    setLiturgyDate(new Date().toISOString().split('T')[0]);
    setLiturgyTheme('');
    setLiturgyVerse('');
    setLiturgySteps([{ id: Date.now().toString(), title: '', type: 'prayer', responsibleId: '', songIds: [], description: '', duration: 10, status: 'pendente' }]);
    setIsPublicLinkEnabled(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (liturgy) => {
    setEditingLiturgy(liturgy);
    setLiturgyDate(liturgy.date.split('/').reverse().join('-')); 
    setLiturgyTheme(liturgy.theme);
    setLiturgyVerse(liturgy.verse || '');
    setLiturgySteps(liturgy.etapas ? liturgy.etapas.map(item => ({
        ...item,
        responsibleId: allUsers.find(u => `${u.firstName} ${u.lastName}` === item.responsavel)?.id || '', 
        songIds: item.musicas ? item.musicas.map(song => allSongs.find(s => s.title === song.nome && s.artist === song.cantor)?.id).filter(Boolean) : [] 
    })) : []);
    setIsPublicLinkEnabled(liturgy.publicLinkEnabled || false);
    setIsModalOpen(true);
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...liturgySteps];
    if (field === 'songIds') { 
        const options = value; 
        const selectedValues = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        updatedSteps[index][field] = selectedValues;
    } else {
        updatedSteps[index][field] = value;
    }
    setLiturgySteps(updatedSteps);
  };

  const addLiturgyStep = () => {
    setLiturgySteps([...liturgySteps, { id: Date.now().toString(), title: '', type: 'prayer', responsibleId: '', songIds: [], description: '', duration: 10, status: 'pendente' }]);
  };

  const removeLiturgyStep = (index) => {
    const updatedSteps = liturgySteps.filter((_, i) => i !== index);
    setLiturgySteps(updatedSteps);
  };

  const handleSaveLiturgy = (e) => {
    e.preventDefault();
    if (!liturgyDate || !liturgyTheme || liturgySteps.some(s => !s.title || !s.type || !s.responsibleId)) {
      toast({ title: "Erro", description: "Preencha Data, Tema e todos os campos obrigatórios das etapas.", variant: "destructive" });
      return;
    }

    const formattedSteps = liturgySteps.map(step => {
        const responsibleUser = allUsers.find(u => u.id === step.responsibleId);
        const selectedSongsData = step.songIds.map(songId => {
            const songDetails = allSongs.find(s => s.id.toString() === songId);
            return songDetails ? { nome: songDetails.title, cantor: songDetails.artist, link_letra: songDetails.letraUrl, link_cifra: songDetails.cifraUrl } : null;
        }).filter(Boolean);
        
        return {
            id: step.id,
            nome: step.title,
            tipo: step.type,
            responsavel: responsibleUser ? `${responsibleUser.firstName} ${responsibleUser.lastName}` : 'N/A',
            musicas: selectedSongsData,
            descricao: step.description,
            duracao: parseInt(step.duration, 10) || 10,
            status: step.status || 'pendente' 
        };
    });

    const newLiturgyData = {
      id: editingLiturgy ? editingLiturgy.id : Date.now().toString(),
      data: new Date(liturgyDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      tema: liturgyTheme,
      verse: liturgyVerse,
      etapas: formattedSteps,
      ativa: editingLiturgy ? editingLiturgy.ativa : false,
      publicLinkEnabled: isPublicLinkEnabled,
      publicLink: isPublicLinkEnabled ? `/liturgy/public/${editingLiturgy ? editingLiturgy.id : Date.now().toString()}` : null
    };

    let updatedLiturgies;
    if (editingLiturgy) {
      updatedLiturgies = liturgies.map(l => l.id === editingLiturgy.id ? newLiturgyData : l);
      toast({ title: "Liturgia Atualizada!", description: `Liturgia para ${newLiturgyData.data} atualizada.` });
    } else {
      updatedLiturgies = [...liturgies, newLiturgyData];
      toast({ title: "Liturgia Criada!", description: `Nova liturgia para ${newLiturgyData.data} criada.` });
    }
    
    setLiturgies(updatedLiturgies);
    localStorage.setItem('church-synch-all-liturgies', JSON.stringify(updatedLiturgies));
    setIsModalOpen(false);
    setEditingLiturgy(null);
  };

  const handleDeleteLiturgy = (liturgyId) => {
    const updatedLiturgies = liturgies.filter(l => l.id !== liturgyId);
    setLiturgies(updatedLiturgies);
    localStorage.setItem('church-synch-all-liturgies', JSON.stringify(updatedLiturgies));
    const currentActiveLiturgy = JSON.parse(localStorage.getItem('church-synch-active-liturgy'));
    if (currentActiveLiturgy && currentActiveLiturgy.id === liturgyId) {
        localStorage.removeItem('church-synch-active-liturgy');
    }
    toast({ title: "Liturgia Removida", description: "A liturgia foi removida com sucesso." });
  };

  const handleActivateLiturgy = (liturgyToActivate) => {
    const updatedLiturgies = liturgies.map(l => ({
        ...l,
        ativa: l.id === liturgyToActivate.id
    }));
    setLiturgies(updatedLiturgies);
    localStorage.setItem('church-synch-all-liturgies', JSON.stringify(updatedLiturgies));
    localStorage.setItem('church-synch-active-liturgy', JSON.stringify({...liturgyToActivate, ativa: true}));
    toast({ title: "Liturgia Ativada!", description: `A liturgia de ${liturgyToActivate.data} está ativa.`});
  };
  
  const handleDeactivateLiturgy = (liturgyToDeactivate) => {
    const updatedLiturgies = liturgies.map(l => 
        l.id === liturgyToDeactivate.id ? { ...l, ativa: false } : l
    );
    setLiturgies(updatedLiturgies);
    localStorage.setItem('church-synch-all-liturgies', JSON.stringify(updatedLiturgies));
    localStorage.removeItem('church-synch-active-liturgy');
    toast({ title: "Liturgia Desativada!", description: `A liturgia de ${liturgyToDeactivate.data} não está mais ativa.`});
  };


  const handleDuplicateLiturgy = (liturgyToDuplicate) => {
    openModalForNew(); 
    setLiturgyTheme(`Cópia de ${liturgyToDuplicate.tema}`);
    setLiturgyVerse(liturgyToDuplicate.verse);
    setLiturgySteps(liturgyToDuplicate.etapas ? liturgyToDuplicate.etapas.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random().toString(16).slice(2), 
        responsibleId: allUsers.find(u => `${u.firstName} ${u.lastName}` === item.responsavel)?.id || '',
        songIds: item.musicas ? item.musicas.map(song => allSongs.find(s => s.title === song.nome && s.artist === song.cantor)?.id).filter(Boolean) : [],
        status: 'pendente' 
    })) : []);
    setIsPublicLinkEnabled(false); // Duplicated liturgies are not public by default
    toast({ title: "Liturgia Duplicada", description: "Ajuste a data e os detalhes da nova liturgia."});
  };

  const handleCopyPublicLink = (publicLink) => {
    const fullUrl = `${window.location.origin}${publicLink}`;
    navigator.clipboard.writeText(fullUrl);
    toast({ title: "Link Público Copiado!", description: "O link foi copiado para a área de transferência." });
  };
  
  const handleExportToPDF = (liturgy) => {
    toast({ title: "Exportar para PDF", description: "Esta funcionalidade será implementada em breve!" });
    // Future: Implement PDF generation logic
  };


  const stepTypes = [
    { value: 'reception', label: 'Recepção' },
    { value: 'prayer', label: 'Oração' },
    { value: 'worship', label: 'Louvor/Adoração' },
    { value: 'offering', label: 'Ofertório' },
    { value: 'sermon', label: 'Palavra/Mensagem' },
    { value: 'communion', label: 'Ceia' },
    { value: 'baptism', label: 'Batismo' },
    { value: 'announcements', label: 'Avisos' },
    { value: 'fellowship', label: 'Confraternização' },
    { value: 'special', label: 'Especial (Ex: Testemunho)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div/>
        <Button onClick={openModalForNew} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="h-5 w-5 mr-2"/> Criar Nova Liturgia
        </Button>
      </div>

      {liturgies.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma liturgia criada ainda. Clique em "Criar Nova Liturgia".</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liturgies.sort((a,b) => new Date(b.data.split('/').reverse().join('-')) - new Date(a.data.split('/').reverse().join('-'))).map(liturgy => (
          <motion.div key={liturgy.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <Card className={`h-full flex flex-col shadow-lg rounded-xl overflow-hidden border-0 ${liturgy.ativa ? 'ring-2 ring-green-500' : ''} ${liturgy.publicLinkEnabled ? 'border-blue-400' : ''}`}>
              <div className={`h-2 bg-gradient-to-r ${liturgy.ativa ? 'from-green-500 to-emerald-600' : liturgy.publicLinkEnabled ? 'from-blue-400 to-sky-500' : 'from-gray-500 to-slate-600'}`}></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{liturgy.tema}</CardTitle>
                    <Badge variant={liturgy.ativa ? "default" : "secondary"} className={liturgy.ativa ? "bg-green-600" : ""}>{liturgy.data} {liturgy.ativa && "(Ativa)"}</Badge>
                </div>
                <CardDescription className="text-xs italic truncate">{liturgy.verse || "Sem versículo tema"}</CardDescription>
                 {liturgy.publicLinkEnabled && liturgy.publicLink && (
                    <Button variant="link" size="sm" onClick={() => handleCopyPublicLink(liturgy.publicLink)} className="h-auto p-0 text-xs text-blue-500 hover:text-blue-600">
                        <LinkIcon className="h-3 w-3 mr-1"/> Copiar Link Público
                    </Button>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">
                    {liturgy.etapas && liturgy.etapas.length > 0 ? `${liturgy.etapas.length} etapa(s). Ex: ${liturgy.etapas[0]?.nome}, ${liturgy.etapas[1]?.nome}...` : "Nenhuma etapa definida."}
                </p>
              </CardContent>
              <DialogFooter className="p-4 border-t bg-card grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-end gap-2">
                {liturgy.ativa ? (
                    <Button variant="destructive" size="sm" onClick={() => handleDeactivateLiturgy(liturgy)} className="col-span-2 sm:col-auto"><XCircle className="h-3.5 w-3.5 mr-1.5"/>Desativar</Button>
                ) : (
                    <Button variant="outline" size="sm" onClick={() => handleActivateLiturgy(liturgy)} className="col-span-2 sm:col-auto"><Send className="h-3.5 w-3.5 mr-1.5"/>Ativar</Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleDuplicateLiturgy(liturgy)}><Copy className="h-3.5 w-3.5 mr-1.5"/>Duplicar</Button>
                <Button variant="outline" size="sm" onClick={() => openModalForEdit(liturgy)}><Edit className="h-3.5 w-3.5 mr-1.5"/>Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteLiturgy(liturgy.id)}><Trash2 className="h-3.5 w-3.5 mr-1.5"/>Excluir</Button>
                <Button variant="outline" size="sm" onClick={() => handleExportToPDF(liturgy)} className="col-span-2 sm:col-auto"><FileSymlink className="h-3.5 w-3.5 mr-1.5"/>Exportar PDF</Button>
              </DialogFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLiturgy ? 'Editar Liturgia' : 'Criar Nova Liturgia'}</DialogTitle>
            <DialogDescription>Preencha os detalhes da liturgia e suas etapas.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveLiturgy} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label htmlFor="liturgyDate">Data</Label><Input id="liturgyDate" type="date" value={liturgyDate} onChange={(e) => setLiturgyDate(e.target.value)} /></div>
                <div><Label htmlFor="liturgyTheme">Tema do Culto</Label><Input id="liturgyTheme" value={liturgyTheme} onChange={(e) => setLiturgyTheme(e.target.value)} placeholder="Ex: O Amor de Deus" /></div>
            </div>
            <div><Label htmlFor="liturgyVerse">Versículo Tema (Opcional)</Label><Input id="liturgyVerse" value={liturgyVerse} onChange={(e) => setLiturgyVerse(e.target.value)} placeholder="Ex: João 3:16" /></div>
            
            <div className="space-y-3 pt-3 border-t">
              <Label className="text-md font-semibold">Etapas da Liturgia</Label>
              {liturgySteps.map((step, index) => (
                <Card key={step.id || index} className="p-3 sm:p-4 bg-muted/30 relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label htmlFor={`step-title-${index}`} className="text-xs">Título da Etapa</Label><Input id={`step-title-${index}`} value={step.title} onChange={(e) => handleStepChange(index, 'title', e.target.value)} placeholder="Ex: Oração Inicial" /></div>
                    <div><Label htmlFor={`step-type-${index}`} className="text-xs">Tipo</Label>
                        <select id={`step-type-${index}`} value={step.type} onChange={(e) => handleStepChange(index, 'type', e.target.value)} className="w-full p-2 border rounded-md bg-background text-sm h-10">
                            {stepTypes.map(typeOpt => <option key={typeOpt.value} value={typeOpt.value}>{typeOpt.label}</option>)}
                        </select>
                    </div>
                    <div><Label htmlFor={`step-responsible-${index}`} className="text-xs">Responsável</Label>
                        <select id={`step-responsible-${index}`} value={step.responsibleId} onChange={(e) => handleStepChange(index, 'responsibleId', e.target.value)} className="w-full p-2 border rounded-md bg-background text-sm h-10">
                            <option value="">Selecione</option>
                            {allUsers.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                        </select>
                    </div>
                    <div><Label htmlFor={`step-duration-${index}`} className="text-xs">Duração (min)</Label><Input id={`step-duration-${index}`} type="number" value={step.duration} onChange={(e) => handleStepChange(index, 'duration', e.target.value)} placeholder="Ex: 15" /></div>
                    {step.type === 'worship' && (
                        <div className="sm:col-span-2">
                            <Label htmlFor={`step-songs-${index}`} className="text-xs">Músicas (selecione uma ou mais)</Label>
                            <select id={`step-songs-${index}`} multiple value={step.songIds} onChange={(e) => handleStepChange(index, 'songIds', e.target.options)} className="w-full p-2 border rounded-md bg-background text-sm h-24">
                                {allSongs.map(s => <option key={s.id} value={s.id.toString()}>{s.title} - {s.artist}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="sm:col-span-2"><Label htmlFor={`step-description-${index}`} className="text-xs">Descrição (Opcional)</Label><Textarea id={`step-description-${index}`} value={step.description} onChange={(e) => handleStepChange(index, 'description', e.target.value)} placeholder="Detalhes adicionais..." rows={2}/></div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeLiturgyStep(index)} className="absolute top-1 right-1 h-7 w-7 text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4"/>
                  </Button>
                </Card>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addLiturgyStep} className="w-full">
                <ListOrdered className="h-4 w-4 mr-2"/> Adicionar Etapa
              </Button>
            </div>
            <div className="flex items-center space-x-2 pt-3 border-t">
                <input type="checkbox" id="liturgy-public" checked={isPublicLinkEnabled} onChange={(e) => setIsPublicLinkEnabled(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                <Label htmlFor="liturgy-public" className="text-sm font-medium">Habilitar Link Público?</Label>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">{editingLiturgy ? 'Salvar Alterações' : 'Criar Liturgia'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageLiturgy;