import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  User, 
  Music, 
  BookOpen, 
  Heart,
  Users,
  Mic,
  Coffee,
  CheckCircle,
  PlayCircle,
  SkipForward,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const Liturgy = () => {
  const [liturgyData, setLiturgyData] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState({});

  useEffect(() => {
    const storedLiturgy = JSON.parse(localStorage.getItem('church-synch-current-liturgy'));
    if (storedLiturgy) {
      setLiturgyData(storedLiturgy);
      const storedStepIndex = parseInt(localStorage.getItem('church-synch-liturgy-step') || '0', 10);
      setCurrentStepIndex(storedStepIndex);
    } else {
      // Simular carregamento da liturgia se não houver no localStorage
      const mockLiturgy = {
        date: new Date().toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long',
          year: 'numeric'
        }),
        theme: "O Amor de Deus em Nossas Vidas",
        verse: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito... - João 3:16",
        items: [
          { id: 1, time: '09:00', title: 'Recepção e Comunhão', responsible: 'Equipe de Recepção', type: 'reception', description: 'Acolhimento dos membros e visitantes', duration: 15 },
          { id: 2, time: '09:15', title: 'Abertura e Oração', responsible: 'Pastor João Silva', type: 'prayer', description: 'Oração de abertura e bênção', duration: 10 },
          { id: 3, time: '09:25', title: 'Louvor e Adoração', responsible: 'Ministério de Louvor', type: 'worship', description: 'Momento de adoração com cânticos', songs: ['Quão Grande é o Meu Deus', 'Reckless Love', 'Bondade de Deus', 'Tua Graça me Basta'], duration: 35 },
          { id: 4, time: '10:00', title: 'Ofertório', responsible: 'Diáconos', type: 'offering', description: 'Momento de gratidão e oferta', duration: 10 },
          { id: 5, time: '10:10', title: 'Palavra de Deus', responsible: 'Pastor João Silva', type: 'sermon', description: 'Mensagem: "O Amor Incondicional de Deus"', text: 'João 3:16-21', duration: 40 },
          { id: 6, time: '10:50', title: 'Apelo e Oração Final', responsible: 'Pastor João Silva', type: 'prayer', description: 'Momento de decisão e oração pelos necessitados', duration: 20 },
          { id: 7, time: '11:10', title: 'Avisos e Encerramento', responsible: 'Secretaria', type: 'announcements', description: 'Comunicados importantes da igreja', duration: 10 },
          { id: 8, time: '11:20', title: 'Confraternização', responsible: 'Todos', type: 'fellowship', description: 'Momento de comunhão com lanche', duration: 30 }
        ]
      };
      setLiturgyData(mockLiturgy);
      localStorage.setItem('church-synch-current-liturgy', JSON.stringify(mockLiturgy));
    }
  }, []);

  useEffect(() => {
    if (liturgyData) {
      localStorage.setItem('church-synch-liturgy-step', currentStepIndex.toString());
    }
  }, [currentStepIndex, liturgyData]);

  const handleNextStep = () => {
    if (liturgyData && currentStepIndex < liturgyData.items.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      toast({ title: "Culto Finalizado!", description: "Todas as etapas da liturgia foram concluídas." });
    }
  };

  const handleSetCurrentStep = (index) => {
    setCurrentStepIndex(index);
  };

  const toggleStepExpansion = (stepId) => {
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'worship': return <Music className="h-5 w-5" />;
      case 'sermon': return <BookOpen className="h-5 w-5" />;
      case 'prayer': return <Heart className="h-5 w-5" />;
      case 'offering': return <Heart className="h-5 w-5" />;
      case 'reception': return <Users className="h-5 w-5" />;
      case 'announcements': return <Mic className="h-5 w-5" />;
      case 'fellowship': return <Coffee className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'worship': return 'from-purple-500 to-pink-500';
      case 'sermon': return 'from-blue-500 to-cyan-500';
      case 'prayer': return 'from-red-500 to-orange-500';
      case 'offering': return 'from-green-500 to-emerald-500';
      case 'reception': return 'from-yellow-500 to-amber-500';
      case 'announcements': return 'from-indigo-500 to-purple-500';
      case 'fellowship': return 'from-teal-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const progressPercentage = liturgyData ? ((currentStepIndex + 1) / liturgyData.items.length) * 100 : 0;

  if (!liturgyData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-8 bg-muted rounded-lg w-1/2 mx-auto"></div>
          <div className="h-4 bg-muted rounded-lg w-3/4 mx-auto"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="gradient-bg text-white border-0 overflow-hidden relative shadow-xl">
          <div className="absolute inset-0 church-pattern opacity-20"></div>
          <CardContent className="p-6 relative z-10">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Liturgia do Culto</h1>
              <p className="text-white/80 capitalize">{liturgyData.date}</p>
              <div className="mt-4">
                <h2 className="text-xl font-semibold">{liturgyData.theme}</h2>
                <p className="text-white/90 italic mt-2">{liturgyData.verse}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Progresso do Culto</CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <Progress value={progressPercentage} className="w-full h-3" />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Etapa atual: {liturgyData.items[currentStepIndex]?.title || 'Concluído'}
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={handleNextStep} className="w-full" disabled={currentStepIndex >= liturgyData.items.length - 1}>
              <SkipForward className="h-4 w-4 mr-2" /> Próxima Etapa
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-3 sm:space-y-4">
        {liturgyData.items.map((item, index) => {
          const isCurrent = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isUpcoming = index > currentStepIndex;
          const isExpanded = !!expandedSteps[item.id];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0.5, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
            >
              <Card 
                className={`overflow-hidden transition-all duration-300 ease-in-out shadow-md hover:shadow-lg
                  ${isCurrent ? 'ring-2 ring-primary border-primary' : 'border-transparent'}
                  ${isCompleted ? 'opacity-60' : ''}
                `}
              >
                <div className={`h-1.5 bg-gradient-to-r ${getTypeColor(item.type)} ${isCompleted ? 'opacity-50' : ''}`}></div>
                <div 
                  className="p-4 sm:p-6 cursor-pointer" 
                  onClick={() => isCurrent || isUpcoming ? handleSetCurrentStep(index) : null}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex flex-col items-center pt-1">
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : isCurrent ? (
                        <PlayCircle className="h-6 w-6 text-primary animate-pulse" />
                      ) : (
                        <div className={`p-1.5 sm:p-2 rounded-full bg-gradient-to-br ${getTypeColor(item.type)} text-white shadow-sm`}>
                          {getIcon(item.type)}
                        </div>
                      )}
                      <Badge variant="secondary" className="mt-2 text-xs whitespace-nowrap">
                        {item.time}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-md sm:text-lg font-semibold ${isCurrent ? 'text-primary' : ''} truncate`}>{item.title}</h3>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={(e) => { e.stopPropagation(); toggleStepExpansion(item.id); }}>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="truncate">{item.responsible}</span>
                      </div>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="pt-2 space-y-2 text-xs sm:text-sm"
                          >
                            <p className="text-muted-foreground">{item.description}</p>
                            
                            {item.text && (
                              <div className="bg-muted/30 dark:bg-muted/50 p-2 sm:p-3 rounded-md">
                                <p className="font-medium text-primary">Texto Base: {item.text}</p>
                              </div>
                            )}
                            
                            {item.songs && item.songs.length > 0 && (
                              <div className="bg-muted/30 dark:bg-muted/50 p-2 sm:p-3 rounded-md">
                                <p className="font-medium mb-1.5">Músicas:</p>
                                <ul className="space-y-1">
                                  {item.songs.map((song, songIndex) => (
                                    <li key={songIndex} className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                      {song}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Liturgy;