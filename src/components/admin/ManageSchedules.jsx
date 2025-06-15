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
import { Calendar, Clock, User, Check, X, AlertCircle, Edit, Trash2, PlusCircle, UserPlus, Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ManageSchedules = () => {
  const { user, isAdmin } = useAuth(); // isAdmin check might be redundant if this component is only for admins
  
  const [schedules, setSchedules] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // For assigning responsibles

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null); // null for new, object for editing
  
  const [eventName, setEventName] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventParticipants, setEventParticipants] = useState([{ userId: '', role: '' }]); // For multiple participants

  useEffect(() => {
    const storedSchedules = JSON.parse(localStorage.getItem('church-synch-schedules')) || [];
    setSchedules(storedSchedules);

    const mockUsers = JSON.parse(localStorage.getItem('church-synch-users')) || [ // Load from LS or use mock
      { id: '1', firstName: 'João', lastName: 'Silva', email: 'joao.silva@example.com', role: 'admin' },
      { id: '2', firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@example.com', role: 'member' },
    ];
    setAllUsers(mockUsers);
  }, []);

  const openModalForNew = () => {
    setEditingSchedule(null);
    setEventName('');
    setEventDateTime('');
    setEventDescription('');
    setEventParticipants([{ userId: '', role: '' }]);
    setIsModalOpen(true);
  };

  const openModalForEdit = (schedule) => {
    setEditingSchedule(schedule);
    setEventName(schedule.name);
    setEventDateTime(schedule.dateTime);
    setEventDescription(schedule.description || '');
    setEventParticipants(schedule.participants || [{ userId: schedule.responsibleId || '', role: 'Responsável Principal' }]); // Adapt old structure
    setIsModalOpen(true);
  };

  const handleParticipantChange = (index, field, value) => {
    const updatedParticipants = [...eventParticipants];
    updatedParticipants[index][field] = value;
    setEventParticipants(updatedParticipants);
  };

  const addParticipantField = () => {
    setEventParticipants([...eventParticipants, { userId: '', role: '' }]);
  };

  const removeParticipantField = (index) => {
    const updatedParticipants = eventParticipants.filter((_, i) => i !== index);
    setEventParticipants(updatedParticipants);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!eventName || !eventDateTime || eventParticipants.some(p => !p.userId || !p.role)) {
      toast({ title: "Erro", description: "Preencha Nome, Data/Hora e todos os campos dos participantes.", variant: "destructive" });
      return;
    }

    const participantsWithNames = eventParticipants.map(p => {
        const participantUser = allUsers.find(u => u.id === p.userId);
        return {
            ...p,
            userName: participantUser ? `${participantUser.firstName} ${participantUser.lastName}` : 'Desconhecido'
        };
    });

    let updatedSchedules;
    if (editingSchedule) { // Editing existing schedule
      updatedSchedules = schedules.map(s => 
        s.id === editingSchedule.id 
        ? { ...s, name: eventName, dateTime: eventDateTime, description: eventDescription, participants: participantsWithNames, status: 'pending' } // Reset status on edit?
        : s
      );
      toast({ title: "Escala Atualizada!", description: `${eventName} foi atualizada.` });
    } else { // Creating new schedule
      const newSchedule = {
        id: Date.now().toString(),
        name: eventName,
        dateTime: eventDateTime,
        description: eventDescription,
        participants: participantsWithNames,
        status: 'pending' // Default status for new schedules
      };
      updatedSchedules = [...schedules, newSchedule];
      toast({ title: "Escala Criada!", description: `${eventName} foi criada.` });
    }
    
    setSchedules(updatedSchedules);
    localStorage.setItem('church-synch-schedules', JSON.stringify(updatedSchedules));
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = (scheduleId) => {
    const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
    setSchedules(updatedSchedules);
    localStorage.setItem('church-synch-schedules', JSON.stringify(updatedSchedules));
    toast({ title: "Escala Removida", description: "A escala foi removida com sucesso." });
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-green-500 text-white">Confirmado</Badge>;
      case 'declined': return <Badge variant="destructive">Recusado</Badge>;
      case 'pending': return <Badge variant="secondary">Pendente</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div/>
        <Button onClick={openModalForNew} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="h-5 w-5 mr-2"/> Criar Nova Escala
        </Button>
      </div>

      {schedules.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma escala criada ainda. Clique em "Criar Nova Escala".</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map(schedule => (
          <motion.div key={schedule.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <Card className="h-full flex flex-col shadow-lg rounded-xl overflow-hidden border-0">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{schedule.name}</CardTitle>
                    {getStatusBadge(schedule.status)}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                    <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5"/> {new Date(schedule.dateTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5"/> {new Date(schedule.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {schedule.description && <p className="text-sm text-muted-foreground italic">"{schedule.description}"</p>}
                <div>
                    <h4 className="text-sm font-semibold mb-1.5 text-foreground">Participantes:</h4>
                    <ul className="space-y-1.5 text-xs">
                        {(schedule.participants || [{userId: schedule.responsibleId, userName: schedule.responsibleName, role: 'Responsável'}]).map((p, idx) => (
                            <li key={idx} className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-md">
                                <User className="h-3.5 w-3.5 text-primary"/>
                                <div>
                                    <span className="font-medium">{p.userName || 'N/A'}</span> - <span className="text-muted-foreground">{p.role}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
              </CardContent>
              <DialogFooter className="p-4 border-t bg-card">
                <Button variant="outline" size="sm" onClick={() => openModalForEdit(schedule)}><Edit className="h-4 w-4 mr-1.5"/>Editar</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteSchedule(schedule.id)}><Trash2 className="h-4 w-4 mr-1.5"/>Excluir</Button>
              </DialogFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? 'Editar Escala' : 'Criar Nova Escala'}</DialogTitle>
            <DialogDescription>Preencha os detalhes do evento e atribua participantes.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSchedule} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div><Label htmlFor="eventName">Nome do Evento</Label><Input id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Ex: Culto de Domingo" /></div>
            <div><Label htmlFor="eventDateTime">Data e Hora</Label><Input id="eventDateTime" type="datetime-local" value={eventDateTime} onChange={(e) => setEventDateTime(e.target.value)} /></div>
            <div><Label htmlFor="eventDescription">Descrição</Label><Textarea id="eventDescription" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Detalhes sobre o evento..." /></div>
            
            <div className="space-y-3">
              <Label>Participantes</Label>
              {eventParticipants.map((participant, index) => (
                <Card key={index} className="p-3 bg-muted/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`participant-user-${index}`} className="text-xs">Membro</Label>
                      <select id={`participant-user-${index}`} value={participant.userId} onChange={(e) => handleParticipantChange(index, 'userId', e.target.value)} className="w-full p-2 border rounded-md bg-background text-sm h-10">
                        <option value="">Selecione</option>
                        {allUsers.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor={`participant-role-${index}`} className="text-xs">Função</Label>
                      <Input id={`participant-role-${index}`} value={participant.role} onChange={(e) => handleParticipantChange(index, 'role', e.target.value)} placeholder="Ex: Louvor, Palavra" />
                    </div>
                  </div>
                  {eventParticipants.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeParticipantField(index)} className="mt-2 text-destructive hover:text-destructive/80 text-xs p-1 h-auto">
                      <Trash2 className="h-3 w-3 mr-1"/> Remover Participante
                    </Button>
                  )}
                </Card>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addParticipantField} className="w-full">
                <UserPlus className="h-4 w-4 mr-2"/> Adicionar Participante
              </Button>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">{editingSchedule ? 'Salvar Alterações' : 'Criar Escala'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageSchedules;