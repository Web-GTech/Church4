import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge'; // Importar Badge
import { 
  BookOpen, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar,
  User,
  Send,
  Download,
  ArrowLeft,
  Printer,
  ZoomIn,
  ZoomOut,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const StudyDetail = () => {
  const { studyId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [fontSize, setFontSize] = useState(16); // Base font size in px

  useEffect(() => {
    // Simular carregamento do estudo e comentários
    const allStudies = JSON.parse(localStorage.getItem('church-synch-ebd-studies')) || [];
    const currentStudy = allStudies.find(s => s.id.toString() === studyId);
    
    if (currentStudy) {
      setStudy(currentStudy);
      // Mock comments for this study
      const mockComments = [
        { id: 1, author: 'Ana B.', content: 'Muito esclarecedor, obrigada!', date: '2024-02-10', avatar: null, authorId: 'ana-id' },
        { id: 2, author: 'Carlos M.', content: 'Profundo e prático.', date: '2024-02-11', avatar: null, authorId: 'carlos-id' },
      ];
      setComments(mockComments);

      // Check if user liked this study (mock)
      const likedStudies = JSON.parse(localStorage.getItem('church-synch-liked-studies')) || [];
      setIsLiked(likedStudies.includes(studyId));

    } else {
      toast({ title: "Erro", description: "Estudo não encontrado.", variant: "destructive" });
      navigate('/ebd');
    }
  }, [studyId, navigate]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    let likedStudies = JSON.parse(localStorage.getItem('church-synch-liked-studies')) || [];
    if (!isLiked) {
      likedStudies.push(studyId);
    } else {
      likedStudies = likedStudies.filter(id => id !== studyId);
    }
    localStorage.setItem('church-synch-liked-studies', JSON.stringify(likedStudies));
    
    setStudy(prev => ({...prev, likesCount: isLiked ? (prev.likesCount || 1) - 1 : (prev.likesCount || 0) + 1}));

    toast({
      title: !isLiked ? "Estudo curtido!" : "Curtida removida",
    });
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      author: `${user.firstName} ${user.lastName.charAt(0)}.`,
      authorId: user.id,
      content: newComment,
      date: new Date().toISOString().split('T')[0],
      avatar: user.profileImage
    };
    setComments(prev => [comment, ...prev]); // Add to top for newest first
    setStudy(prev => ({...prev, commentsCount: (prev.commentsCount || 0) + 1}));
    setNewComment('');
    toast({ title: "Comentário adicionado!" });
  };
  
  const handleDeleteComment = (commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    setStudy(prev => ({...prev, commentsCount: Math.max(0, (prev.commentsCount || 1) - 1)}));
    toast({ title: "Comentário removido." });
  };

  const handleDownload = () => {
    if (study?.pdfUrl) {
       toast({ title: "Baixando PDF...", description: `Iniciando download de ${study.pdfUrl}` });
       // Simulate PDF download
       // window.open(study.pdfUrl, '_blank'); 
    } else if (study?.content) {
        toast({ title: "🚧 Exportar para PDF", description: "Funcionalidade de exportar texto para PDF em breve!" });
        // Placeholder for future PDF generation from content
    } else {
        toast({ title: "Nenhum arquivo para download", variant: "destructive"});
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  const adjustFontSize = (increment) => {
    setFontSize(prev => Math.max(12, Math.min(24, prev + increment))); // Min 12px, Max 24px
  };


  if (!study) {
    return (
        <div className="container mx-auto px-4 py-6 flex justify-center items-center min-h-[calc(100vh-10rem)]">
            <ArrowLeft className="h-10 w-10 text-primary animate-ping" />
            <span className="ml-3">Carregando estudo...</span>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Button variant="outline" onClick={() => navigate('/ebd')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para EBD
        </Button>
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
           {study.coverImage && (
            <img src={study.coverImage} alt={study.title} className="w-full h-48 sm:h-64 object-cover"/>
          )}
          <CardHeader className="pt-6 pb-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">{study.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><User className="h-4 w-4" /> Por: {study.author || 'Equipe Church Synch'}</div>
              <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(study.date).toLocaleDateString('pt-BR')}</div>
              {study.baseText && <div className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> Base: {study.baseText}</div>}
            </div>
            {study.category && <Badge variant="secondary" className="mt-3">{study.category}</Badge>}
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base max-w-none dark:prose-invert pb-6" style={{ fontSize: `${fontSize}px` }}>
            {study.description && <p className="lead italic text-muted-foreground mb-6">{study.description}</p>}
            <div className="whitespace-pre-line">{study.content}</div>
          </CardContent>
          
          <CardContent className="border-t pt-4 pb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button variant="ghost" size="sm" onClick={handleLike} className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}>
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} /> {study.likesCount || 0}
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="h-5 w-5" /> {comments.length}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2"><Download className="h-4 w-4" /> Baixar</Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2"><Printer className="h-4 w-4" /> Imprimir</Button>
                <Button variant="ghost" size="icon" onClick={() => adjustFontSize(2)} title="Aumentar Fonte"><ZoomIn className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" onClick={() => adjustFontSize(-2)} title="Diminuir Fonte"><ZoomOut className="h-5 w-5" /></Button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Comentários ({comments.length})</h3>
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback className="text-xs bg-muted">
                      {comment.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted/30 dark:bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{comment.author}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-xs text-muted-foreground">{new Date(comment.date).toLocaleDateString('pt-BR')}</span>
                         {comment.authorId === user.id && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteComment(comment.id)}>
                                <Settings className="h-3.5 w-3.5" />
                            </Button>
                         )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-muted-foreground">Seja o primeiro a comentar!</p>}

              {/* Add Comment */}
              <div className="flex gap-3 pt-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.profileImage} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Adicione um comentário público..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[40px] resize-none text-sm"
                  />
                  <Button
                    size="icon"
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudyDetail;