import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  User, 
  Check, 
  X, 
  AlertCircle,
  Users,
  Music,
  BookOpen,
  Coffee,
  Edit,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Schedules = () => {
  const { user, isAdmin } = useAuth();
  const [schedules, setSchedules] = useState([]);
  // const [userResponses, setUserResponses] = useState({}); // Kept for potential future non-admin interaction

  useEffect(() => {
    const storedSchedules = JSON.parse(localStorage.getItem('church-synch-schedules')) || [];
    
    const initialSchedules = [
      {
        id: "mock1",
        name: 'Culto Dominical (Exemplo)',
        dateTime: new Date(new Date().setDate(new Date().getDate() + (7 - new Date().getDay()))).toISOString().slice(0,16), // Proximo Domingo
        description: 'Culto de celebração semanal.',
        responsibleId: 'pastor-mock',
        responsibleName: 'Pastor João (Exemplo)',
        status: 'confirmed',
        type: 'culto',
        roles: [ // This part is from the old structure, might be integrated differently if needed
          { id: 1, name: 'Louvor', responsible: 'Maria Silva', avatar: null, status: 'confirmed', icon: Music },
          { id: 2, name: 'Palavra', responsible: 'Pastor João', avatar: null, status: 'confirmed', icon: BookOpen },
        ]
      },
      // ... more mock initial schedules if needed
    ];
    
    // Combine stored with initial mocks, ensuring no duplicates by ID
    const combinedSchedules = [...initialSchedules.filter(is => !storedSchedules.find(ss => ss.id === is.id)), ...storedSchedules];
    setSchedules(combinedSchedules);

  }, []);

  const handleResponse = (scheduleId, response) => {
    // This function is now primarily for the responsible user
    setSchedules(prevSchedules => {
      const updatedSchedules = prevSchedules.map(schedule =>
        schedule.id === scheduleId && schedule.responsibleId === user.id
          ? { ...schedule, status: response }
          : schedule
      );
      localStorage.setItem('church-synch-schedules', JSON.stringify(updatedSchedules));
      return updatedSchedules;
    });

    toast({
      title: response === 'confirmed' ? "Participação Confirmada!" : "Participação Recusada",
      description: `Sua resposta para o evento foi registrada.`,
    });
  };

  const handleDeleteSchedule = (scheduleId) => {
    if (!isAdmin) return;
    setSchedules(prevSchedules => {
      const updatedSchedules = prevSchedules.filter(s => s.id !== scheduleId);
      localStorage.setItem('church-synch-schedules', JSON.stringify(updatedSchedules));
      return updatedSchedules;
    });
    toast({ title: "Escala Removida", description: "A escala foi removida com sucesso." });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'declined': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <Check className="h-4 w-4" />;
      case 'declined': return <X className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type) => {
    // Simplified, as 'type' isn't in the new schedule structure directly
    // Could infer from name or add type to new schedule structure
    if (type?.toLowerCase().includes('culto')) return 'from-purple-500 to-pink-500';
    if (type?.toLowerCase().includes('oração')) return 'from-blue-500 to-cyan-500';
    if (type?.toLowerCase().includes('ebd')) return 'from-green-500 to-emerald-500';
    return 'from-gray-500 to-slate-500';
  };


  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="gradient-bg text-white border-0 overflow-hidden relative">
          <div className="absolute inset-0 church-pattern opacity-20"></div>
          <CardContent className="p-6 relative z-10">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3">
                <Calendar className="h-8 w-8" />
                <h1 className="text-2xl font-bold">Escalas de Serviço</h1>
              </div>
              <p className="text-white/80">
                Confirme sua participação nos eventos da igreja
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-6">
        {schedules.map((schedule, index) => (
          <motion.div
            key={schedule.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-0 overflow-hidden shadow-lg">
              <div className={`h-2 bg-gradient-to-r ${getEventTypeColor(schedule.name)}`}></div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{schedule.name}</CardTitle>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(schedule.dateTime).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-4 w-4" />
                      {new Date(schedule.dateTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm">Responsável: {schedule.responsibleName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {schedule.description && <p className="text-sm italic text-muted-foreground">{schedule.description}</p>}
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <Badge className={`${getStatusColor(schedule.status)} capitalize`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(schedule.status)}
                      <span>{schedule.status === 'pending' ? 'Aguardando' : schedule.status}</span>
                    </div>
                  </Badge>

                  {user?.id === schedule.responsibleId && schedule.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleResponse(schedule.id, 'confirmed')}>
                        <Check className="h-4 w-4 mr-1" /> Aceitar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleResponse(schedule.id, 'declined')}>
                        <X className="h-4 w-4 mr-1" /> Recusar
                      </Button>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex gap-2">
                       <Button variant="outline" size="icon" onClick={() => toast({ title: "🚧 Em breve!", description: "Edição de escalas será implementada."})}>
                          <Edit className="h-4 w-4"/>
                       </Button>
                       <Button variant="destructive" size="icon" onClick={() => handleDeleteSchedule(schedule.id)}>
                          <Trash2 className="h-4 w-4"/>
                       </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {schedules.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma escala disponível</h3>
          <p className="text-muted-foreground">
            {isAdmin ? "Crie uma nova escala no painel de administração." : "Aguarde novas escalas serem publicadas."}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Schedules;