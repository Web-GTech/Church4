import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Church, Users, Calendar, BookOpen, MessageSquare, Download, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { completeWelcomeProcess, user, loading: authLoading, isFirstTimeUser, welcomeCompleted } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Se authLoading terminou e welcomeCompleted já foi determinado
    if (!authLoading && welcomeCompleted !== null) {
      // Se o welcome JÁ FOI COMPLETADO (localStorage ou perfil)
      if (welcomeCompleted) {
        // E não há usuário logado, vai para login
        if (!user) {
          navigate('/login', { replace: true });
        // E há usuário logado, MAS não é o primeiro acesso dele (perfil já atualizado)
        // então vai para a home.
        } else if (user && !isFirstTimeUser) {
          navigate('/', { replace: true });
        }
        // Se user && isFirstTimeUser, permanece na Welcome page para completar o processo no DB.
      }
      // Se welcomeCompleted é false, permanece na welcome page.
    }
  }, [authLoading, user, isFirstTimeUser, welcomeCompleted, navigate]);


  const handleDiscover = async () => {
    setIsSubmitting(true);
    try {
      // Esta função agora define 'welcomeCompleted' no localStorage e
      // atualiza 'is_first_time_user' no DB se o usuário estiver logado.
      await completeWelcomeProcess(); 
      
      // Após completar o processo de welcome (slides vistos):
      // Se o usuário JÁ ESTIVER LOGADO (e era firstTimeUser), 
      // o AuthContext e App.jsx devem redirecioná-lo para a home ('/').
      // Se o usuário NÃO ESTIVER LOGADO, redireciona para registro.
      if (!user) {
        navigate('/register', { replace: true });
      } else {
        // Se o usuário estava logado, a mudança em isFirstTimeUser e welcomeCompleted
        // no AuthContext deve fazer o ProtectedRoute em App.jsx redirecionar para '/'
        // Não precisa de navigate explícito aqui, para evitar conflito de navegação.
      }

    } catch (error) {
      console.error("Failed to complete welcome:", error);
      // Potencialmente mostrar um toast error para o usuário
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { title: 'Bem-vindo(a) ao Church Synch!', description: `Olá! Estamos felizes em ter você explorando o Church Synch. Descubra um novo jeito de se conectar com sua comunidade de fé.`, icon: Church, color: 'text-purple-500' },
    { title: 'Escalas e Eventos na Palma da Mão', description: 'Nunca mais perca um compromisso! Visualize escalas de ministério e os próximos eventos da igreja com facilidade.', icon: Calendar, color: 'text-blue-500' },
    { title: 'Liturgia Dinâmica e Interativa', description: 'Acompanhe a ordem do culto em tempo real, com letras de músicas e passagens bíblicas diretamente no seu app.', icon: BookOpen, color: 'text-green-500' },
    { title: 'Estudos Bíblicos Enriquecedores', description: 'Aprofunde-se na Palavra de Deus com nossos estudos da EBD, disponíveis para leitura e download.', icon: BookOpen, color: 'text-yellow-500' },
    { title: 'Mural de Avisos e Notificações', description: 'Fique por dentro de todos os comunicados importantes da liderança e dos ministérios.', icon: MessageSquare, color: 'text-teal-500' },
    { title: 'Recursos para Download', description: 'Acesse materiais valiosos como Bíblias em PDF, estudos complementares, devocionais e muito mais.', icon: Download, color: 'text-indigo-500' },
    { title: 'Conecte-se e Interaja', description: 'Participe das discussões nos avisos, envie mensagens para outros membros e fortaleça os laços da comunidade.', icon: Users, color: 'text-pink-500' },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === features.length - 1 ? prev : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? prev : prev - 1));
  };
  
  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

  // Mostra loading se o estado de autenticação OU o estado de welcomeCompleted ainda não foram determinados.
  if (authLoading || welcomeCompleted === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-950 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Carregando boas-vindas...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-950 p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-lg relative"
      >
        <Card className="glass-effect border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center space-y-4 pt-8 pb-2">
            <motion.div
              className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Church className="w-10 h-10 text-white" />
              <Sparkles className="w-5 h-5 text-yellow-300 absolute top-1 right-1" />
            </motion.div>
            <CardTitle className="text-3xl font-bold gradient-text">
              {features[currentSlide].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 min-h-[200px] flex flex-col justify-center items-center text-center">
            <AnimatePresence initial={false} custom={currentSlide}>
              <motion.div
                key={currentSlide}
                custom={currentSlide}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) nextSlide();
                  else if (swipe > swipeConfidenceThreshold) prevSlide();
                }}
                className="w-full absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center px-6"
              >
                {(() => {
                  const feature = features[currentSlide];
                  if (!feature) return null;
                  const IconComponent = feature.icon;
                  return (
                    <>
                      <IconComponent className={`h-12 w-12 mb-4 ${feature.color}`} />
                      <CardDescription className="text-md text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <div className="p-6 sm:p-8 pt-2">
            <div className="flex justify-center items-center space-x-2 mb-6">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-primary scale-125' : 'bg-muted hover:bg-muted-foreground/50'}`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
            {currentSlide < features.length - 1 ? (
              <Button
                onClick={nextSlide}
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-semibold py-3 text-lg cursor-pointer"
              >
                Próximo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={handleDiscover}
                size="lg"
                disabled={isSubmitting || authLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 text-lg cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                {isSubmitting ? 'Aguarde...' : 'Descubra agora como gerenciar sua igreja'}
              </Button>
            )}
          </div>
        </Card>
        
        {currentSlide > 0 && (
          <Button onClick={prevSlide} variant="outline" size="icon" className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 rounded-full shadow-md bg-background/70 hover:bg-background cursor-pointer" disabled={isSubmitting}>
            <ChevronLeft className="h-5 w-5"/>
          </Button>
        )}
        {currentSlide < features.length - 1 && (
          <Button onClick={nextSlide} variant="outline" size="icon" className="absolute right-2 sm:-right-12 top-1/2 -translatey-1/2 rounded-full shadow-md bg-background/70 hover:bg-background cursor-pointer" disabled={isSubmitting}>
            <ChevronRight className="h-5 w-5"/>
          </Button>
        )}

      </motion.div>
    </div>
  );
};

export default Welcome;