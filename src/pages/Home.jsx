import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Importar Badge
import { MessageSquare, BookOpen, Heart, Calendar, Users, Music, Bell, ClipboardList, Cross, ShieldQuestion, Speaker, ArrowRight, DownloadCloud, Info, MapPin, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayVerse, setTodayVerse] = useState({ text: "Carregando versículo...", reference: "" });
  const [nextEvents, setNextEvents] = useState([]);
  const [leadershipMessage, setLeadershipMessage] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const verses = [
      { text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1" },
      { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", reference: "João 3:16" },
      { text: "Posso todas as coisas naquele que me fortalece.", reference: "Filipenses 4:13" },
    ];
    setTodayVerse(verses[Math.floor(Math.random() * verses.length)]);

    const mockEvents = [
      { id: 1, title: "Culto de Domingo", date: "Próximo Domingo às 10:00", type: "Culto", location: "Templo Principal", description: "Junte-se a nós para um tempo de louvor, adoração e uma mensagem poderosa da Palavra de Deus. Traga sua família e amigos!", attachments: [{name: "Boletim Semanal.pdf", url: "#"}] },
      { id: 2, title: "Reunião de Oração", date: "Quarta-feira às 19:30", type: "Reunião", location: "Capela Anexa", description: "Momento de intercessão e busca pela presença de Deus. Todos são bem-vindos para orar conosco.", attachments: [] },
      { id: 3, title: "Estudo Bíblico EBD", date: "Domingo às 09:00", type: "Estudo", location: "Salas da EBD", description: "Aprofunde seu conhecimento bíblico em nossas classes da Escola Bíblica Dominical. Temos turmas para todas as idades.", attachments: [{name: "Material de Apoio.docx", url: "#"}] },
    ];
    setNextEvents(mockEvents); 

    const mockMessages = [
        { title: "Palavra do Pastor", content: "Lembrem-se da importância da comunhão e do amor fraternal. Uma semana abençoada a todos!"},
        { title: "Aviso da Secretaria", content: "Não se esqueçam do nosso mutirão de limpeza no Sábado!"},
    ];
    setLeadershipMessage(mockMessages[Math.floor(Math.random() * mockMessages.length)]);

  }, []);
  
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleAddToGoogleCalendar = (event) => {
    const eventDate = new Date(); 
    const startTime = eventDate.toISOString().replace(/-|:|\.\d\d\d/g,"");
    const endTimeDate = new Date(eventDate.getTime() + (60 * 60 * 1000));
    const endTime = endTimeDate.toISOString().replace(/-|:|\.\d\d\d/g,"");

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    window.open(calendarUrl, '_blank');
    toast({ title: "Abrindo Google Agenda...", description: "Adicione o evento à sua agenda."});
  };
  
  const handleRSVP = (event) => {
      toast({ title: `RSVP para ${event.title}`, description: "Funcionalidade de RSVP em breve!" });
  };


  const quickAccessItems = [
    { title: 'Escalas', icon: ClipboardList, path: '/schedules', color: 'from-teal-500 to-cyan-600' },
    { title: 'Repertório', icon: Music, path: '/repertoire', color: 'from-purple-500 to-pink-500' },
    { title: 'Estudos EBD', icon: BookOpen, path: '/ebd', color: 'from-green-500 to-emerald-500' },
    { title: 'Downloads', icon: DownloadCloud, path: '/downloads', color: 'from-sky-500 to-blue-600' },
  ];

  const mainActions = [
    {
      title: 'Liturgia do Dia',
      description: 'Acompanhe o culto de hoje',
      icon: Calendar,
      action: () => navigate('/liturgy'),
      color: 'from-indigo-500 to-purple-600',
      featured: true,
    },
    {
      title: 'Mural de Avisos',
      description: 'Veja os últimos comunicados',
      icon: MessageSquare,
      action: () => navigate('/notice-board'),
      color: 'from-blue-500 to-sky-500'
    },
     {
      title: 'Faça sua Oferta',
      description: 'Contribua com a obra do Senhor',
      icon: Heart,
      action: () => navigate('/offering'),
      color: 'from-rose-500 to-red-600'
    },
  ];


  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground border-0 overflow-hidden relative shadow-xl">
          <div className="absolute inset-0 church-pattern opacity-10"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Bem-vindo(a), {user?.firstName}!</h1>
                <p className="text-primary-foreground/80 mt-1">Que seu dia seja abençoado em {user?.churchName || 'nossa comunidade'}.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-foreground/80">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="border-l-4 border-l-amber-500 shadow-lg bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-700 dark:text-amber-400"><Cross className="h-5 w-5" />Versículo do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-amber-800 dark:text-amber-300 italic mb-2 text-lg">"{todayVerse.text}"</blockquote>
            <cite className="text-sm font-medium text-amber-600 dark:text-amber-500">{todayVerse.reference}</cite>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {quickAccessItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Card 
                  className={`cursor-pointer hover:shadow-lg transition-shadow duration-200 rounded-2xl border-0 overflow-hidden bg-card h-full flex flex-col items-center justify-center p-4 text-center group bg-gradient-to-br ${item.color} text-white`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Próximos Eventos</CardTitle>
              <CardDescription>Fique por dentro do que vai acontecer na igreja.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextEvents.slice(0, 3).map(event => (
                <motion.div key={event.id} whileHover={{ backgroundColor: 'rgba(var(--muted))' }} className="p-3 rounded-lg cursor-pointer transition-colors" onClick={() => handleEventClick(event)}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-md">{event.title}</h3>
                    <Badge variant={event.type === 'Culto' ? 'default' : 'secondary'}>{event.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{event.description}</p>
                </motion.div>
              ))}
              {nextEvents.length > 3 && (
                <Button variant="link" className="w-full text-primary" onClick={() => toast({title: "🚧 Em breve", description: "Visualização de todos os eventos."})}>
                  Ver todos os eventos <ArrowRight className="h-4 w-4 ml-1"/>
                </Button>
              )}
               {nextEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento programado no momento.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          {leadershipMessage && (
            <Card className="shadow-lg bg-gradient-to-br from-blue-50 dark:from-blue-900/30 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md"><Speaker className="h-5 w-5 text-blue-600 dark:text-blue-400" />{leadershipMessage.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{leadershipMessage.content}</p>
              </CardContent>
            </Card>
          )}
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md"><ShieldQuestion className="h-5 w-5 text-green-600 dark:text-green-400"/>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {mainActions.map(action => (
                    <Button key={action.title} variant="outline" className="w-full justify-start gap-3 py-3 h-auto text-left" onClick={action.action}>
                        <div className={`p-2 rounded-md bg-gradient-to-br ${action.color} text-white`}>
                            <action.icon className="h-5 w-5"/>
                        </div>
                        <div>
                            <span className="font-semibold text-sm">{action.title}</span>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                    </Button>
                ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {isEventModalOpen && selectedEvent && (
          <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
            <DialogContent className="sm:max-w-lg">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 pt-1">
                    <Calendar className="h-4 w-4"/> {selectedEvent.date} 
                    <span className="text-muted-foreground/50">|</span> 
                    <MapPin className="h-4 w-4"/> {selectedEvent.location}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  <p className="text-sm text-foreground/90">{selectedEvent.description}</p>
                  {selectedEvent.attachments && selectedEvent.attachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1.5">Anexos:</h4>
                      <ul className="space-y-1">
                        {selectedEvent.attachments.map((att, idx) => (
                          <li key={idx}>
                            <Button variant="link" size="sm" asChild className="p-0 h-auto text-primary">
                              <a href={att.url} target="_blank" rel="noopener noreferrer">
                                <DownloadCloud className="h-4 w-4 mr-1.5"/>{att.name}
                              </a>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <DialogFooter className="gap-2 sm:justify-between">
                    <Button variant="outline" onClick={() => handleRSVP(selectedEvent)}>
                        <PlusCircle className="h-4 w-4 mr-2"/> Confirmar Presença (RSVP)
                    </Button>
                    <div className="flex gap-2">
                        <Button onClick={() => handleAddToGoogleCalendar(selectedEvent)}>
                            <Calendar className="h-4 w-4 mr-2"/> Add Google Agenda
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Fechar</Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;