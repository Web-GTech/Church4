import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ListOrdered, 
  Music, 
  BookOpen, 
  Users, 
  Clock, 
  Mic,
  Heart,
  Copy,
  Printer,
  Share2,
  Church
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const PublicLiturgy = () => {
  const { liturgyId } = useParams();
  const [liturgy, setLiturgy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simular carregamento da liturgia pública
    const allLiturgies = JSON.parse(localStorage.getItem('church-synch-all-liturgies')) || [];
    const foundLiturgy = allLiturgies.find(l => l.id === liturgyId && l.publicLinkEnabled); // Check if public link is enabled
    
    if (foundLiturgy) {
      setLiturgy(foundLiturgy);
    } else {
        // Fallback if not found or not public, load the currently active liturgy if any
        // Or show a "not found" message
        const activeLiturgy = JSON.parse(localStorage.getItem('church-synch-active-liturgy'));
        if (activeLiturgy && activeLiturgy.id === liturgyId) { // Could be a direct link to an active but not "publicly shared" one
            setLiturgy(activeLiturgy);
        } else {
             setLiturgy(null); // Or some error state
             toast({ title: "Liturgia não encontrada", description: "O link pode estar incorreto ou a liturgia não está mais disponível publicamente.", variant: "destructive" });
        }
    }
    setLoading(false);
  }, [liturgyId]);

  const getIconForStepType = (type) => {
    switch (type?.toLowerCase()) {
      case 'worship':
      case 'louvor':
      case 'louvor/adoração':
        return <Music className="h-5 w-5" />;
      case 'sermon':
      case 'palavra':
      case 'palavra/mensagem':
        return <BookOpen className="h-5 w-5" />;
      case 'prayer':
      case 'oração':
        return <Heart className="h-5 w-5" />;
      case 'reception':
      case 'recepção':
        return <Users className="h-5 w-5" />;
      case 'announcements':
      case 'avisos':
        return <Mic className="h-5 w-5" />;
      default:
        return <ListOrdered className="h-5 w-5" />;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copiado!", description: "O link da liturgia foi copiado para sua área de transferência." });
  };
  
  const handlePrint = () => {
     window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Church className="h-16 w-16 text-primary animate-bounce mb-4" />
        <p className="text-lg text-muted-foreground">Carregando liturgia...</p>
      </div>
    );
  }

  if (!liturgy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
        <ListOrdered className="h-20 w-20 text-destructive mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-3">Liturgia Não Encontrada</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          O link que você acessou pode estar incorreto, expirado, ou a liturgia não foi compartilhada publicamente.
        </p>
        <Button asChild>
          <Link to="/">Voltar para a Página Inicial</Link>
        </Button>
      </div>
    );
  }
  
  const shareData = {
      title: `Liturgia: ${liturgy.tema}`,
      text: `Confira a liturgia do culto de ${liturgy.data} - Tema: ${liturgy.tema}`,
      url: window.location.href,
  };

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            toast({ title: "Conteúdo compartilhado!"});
        } catch (error) {
            toast({ title: "Erro ao compartilhar", description: error.message, variant: "destructive" });
        }
    } else {
        // Fallback for browsers that don't support Web Share API
        handleCopyLink();
        toast({ title: "Link Copiado!", description: "Compartilhe este link com seus contatos." });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950 p-4 sm:p-6 md:p-8 print:p-0 print:bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <header className="text-center mb-8 print:mb-4">
          <div className="inline-flex items-center gap-3 bg-primary/10 dark:bg-primary/20 text-primary px-4 py-2 rounded-full mb-4 print:hidden">
            <Church className="h-6 w-6"/>
            <span className="font-semibold">Church Synch Public Liturgy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">{liturgy.tema}</h1>
          <p className="text-lg text-muted-foreground">{liturgy.data}</p>
          {liturgy.verse && <p className="text-md italic text-primary mt-2">"{liturgy.verse}"</p>}
        </header>

        <div className="fixed बॉटम-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2 print:hidden">
            <Button onClick={handleCopyLink} variant="outline" size="icon" className="bg-card shadow-lg hover:bg-muted rounded-full h-12 w-12">
                <Copy className="h-5 w-5" />
                <span className="sr-only">Copiar Link</span>
            </Button>
             <Button onClick={handlePrint} variant="outline" size="icon" className="bg-card shadow-lg hover:bg-muted rounded-full h-12 w-12">
                <Printer className="h-5 w-5" />
                <span className="sr-only">Imprimir</span>
            </Button>
            {navigator.share && (
                 <Button onClick={handleShare} variant="outline" size="icon" className="bg-card shadow-lg hover:bg-muted rounded-full h-12 w-12">
                    <Share2 className="h-5 w-5" />
                    <span className="sr-only">Compartilhar</span>
                </Button>
            )}
        </div>

        <div className="space-y-4 print:space-y-2">
          {liturgy.etapas.map((etapa, index) => (
            <motion.div
              key={etapa.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card className="overflow-hidden shadow-md bg-card/80 dark:bg-card/50 backdrop-blur-sm border-border/50 print:shadow-none print:border-b print:rounded-none">
                <div className="flex items-start p-4 print:p-2">
                  <div className="mr-4 pt-1 text-primary">
                    {getIconForStepType(etapa.tipo)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">{etapa.nome}</h2>
                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      <span>{etapa.duracao} min</span>
                      <span className="mx-2">·</span>
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                      <span>{etapa.responsavel}</span>
                    </div>
                    {etapa.descricao && <p className="text-sm text-muted-foreground mt-2 italic print:text-xs">"{etapa.descricao}"</p>}
                    
                    {(etapa.tipo?.toLowerCase().includes('worship') || etapa.tipo?.toLowerCase().includes('louvor')) && etapa.musicas && etapa.musicas.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <h4 className="text-sm font-medium text-primary mb-1.5">Músicas:</h4>
                        <ul className="space-y-1 text-sm text-foreground/90 print:text-xs">
                          {etapa.musicas.map((musica, songIndex) => (
                            <li key={songIndex} className="flex items-center">
                              <Music className="h-3.5 w-3.5 mr-2 text-primary/70" />
                              {musica.nome} <span className="text-muted-foreground text-xs ml-1">- {musica.cantor}</span>
                              {(musica.link_letra || musica.link_cifra) && (
                                <span className="ml-2 print:hidden">
                                    {musica.link_letra && <a href={musica.link_letra} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs mr-1.5">Letra</a>}
                                    {musica.link_cifra && <a href={musica.link_cifra} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">Cifra</a>}
                                </span>
                                )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <footer className="text-center mt-12 text-sm text-muted-foreground print:hidden">
            <p>&copy; {new Date().getFullYear()} Church Synch. Todos os direitos reservados.</p>
            <p>Desenvolvido com <Heart className="inline h-4 w-4 text-red-500"/> por Hostinger Horizons.</p>
        </footer>
      </motion.div>
    </div>
  );
};

export default PublicLiturgy;