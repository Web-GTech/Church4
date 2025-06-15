import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  BookOpen, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar,
  User,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const EBD = () => {
  const [studies, setStudies] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [likes, setLikes] = useState({});

  useEffect(() => {
    // Simular carregamento dos estudos
    const mockStudies = [
      {
        id: 1,
        title: 'O Amor de Deus em Nossas Vidas',
        theme: 'Amor e Relacionamentos',
        baseText: 'João 3:16-21',
        coverImage: null,
        content: `Neste estudo, vamos explorar a profundidade do amor de Deus por nós e como isso deve transformar nossos relacionamentos.

**Introdução:**
O amor de Deus é incondicional e transformador. Ele nos ama não por quem somos, mas por quem Ele é.

**Desenvolvimento:**
1. O amor demonstrado na cruz
2. Como receber esse amor
3. Como compartilhar esse amor

**Aplicação:**
- Reflita sobre como você tem experimentado o amor de Deus
- Pense em maneiras práticas de demonstrar esse amor aos outros
- Ore pedindo que Deus encha seu coração com Seu amor`,
        author: 'Pastor João Silva',
        date: '2024-01-21',
        likesCount: 15,
        commentsCount: 8
      },
      {
        id: 2,
        title: 'Fé em Tempos Difíceis',
        theme: 'Fé e Perseverança',
        baseText: 'Hebreus 11:1-6',
        coverImage: null,
        content: `A fé é fundamental para nossa caminhada cristã, especialmente quando enfrentamos dificuldades.

**O que é fé?**
Fé é a certeza daquilo que esperamos e a convicção daquilo que não vemos.

**Exemplos bíblicos:**
- Abraão e sua jornada de fé
- Moisés e a libertação do Egito
- Daniel na cova dos leões

**Aplicação prática:**
Como manter a fé quando tudo parece dar errado? Vamos descobrir juntos.`,
        author: 'Pastora Maria Santos',
        date: '2024-01-14',
        likesCount: 23,
        commentsCount: 12
      },
      {
        id: 3,
        title: 'A Importância da Oração',
        theme: 'Vida Espiritual',
        baseText: 'Mateus 6:5-15',
        coverImage: null,
        content: `A oração é nossa comunicação direta com Deus. É através dela que fortalecemos nossa relação com o Pai.

**Elementos da oração:**
1. Adoração - Reconhecendo quem Deus é
2. Confissão - Admitindo nossos pecados
3. Gratidão - Agradecendo pelas bênçãos
4. Súplica - Apresentando nossos pedidos

**O Pai Nosso como modelo:**
Jesus nos ensinou como orar através desta oração modelo.`,
        author: 'Diácono Pedro Costa',
        date: '2024-01-07',
        likesCount: 18,
        commentsCount: 6
      }
    ];

    setStudies(mockStudies);

    // Simular comentários
    const mockComments = {
      1: [
        {
          id: 1,
          author: 'Ana Silva',
          content: 'Estudo muito edificante! Me ajudou a entender melhor o amor de Deus.',
          date: '2024-01-21',
          avatar: null
        },
        {
          id: 2,
          author: 'Carlos Santos',
          content: 'Excelente reflexão. Vou aplicar esses ensinamentos em minha vida.',
          date: '2024-01-21',
          avatar: null
        }
      ],
      2: [
        {
          id: 3,
          author: 'Maria Oliveira',
          content: 'Muito oportuno este estudo. Estou passando por um momento difícil.',
          date: '2024-01-14',
          avatar: null
        }
      ]
    };

    setComments(mockComments);
  }, []);

  const handleLike = (studyId) => {
    setLikes(prev => ({
      ...prev,
      [studyId]: !prev[studyId]
    }));

    setStudies(prev => prev.map(study => 
      study.id === studyId 
        ? { 
            ...study, 
            likesCount: likes[studyId] 
              ? study.likesCount - 1 
              : study.likesCount + 1 
          }
        : study
    ));

    toast({
      title: likes[studyId] ? "Curtida removida" : "Estudo curtido!",
      description: likes[studyId] ? "" : "Obrigado pelo seu feedback positivo.",
    });
  };

  const handleComment = (studyId) => {
    if (!newComment[studyId]?.trim()) return;

    const comment = {
      id: Date.now(),
      author: 'Você',
      content: newComment[studyId],
      date: new Date().toISOString().split('T')[0],
      avatar: null
    };

    setComments(prev => ({
      ...prev,
      [studyId]: [...(prev[studyId] || []), comment]
    }));

    setStudies(prev => prev.map(study => 
      study.id === studyId 
        ? { ...study, commentsCount: study.commentsCount + 1 }
        : study
    ));

    setNewComment(prev => ({
      ...prev,
      [studyId]: ''
    }));

    toast({
      title: "Comentário adicionado!",
      description: "Seu comentário foi publicado com sucesso.",
    });
  };

  const handleShare = (study) => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="gradient-bg text-white border-0 overflow-hidden relative">
          <div className="absolute inset-0 church-pattern opacity-20"></div>
          <CardContent className="p-6 relative z-10">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3">
                <BookOpen className="h-8 w-8" />
                <h1 className="text-2xl font-bold">EBD - Escola Bíblica Dominical</h1>
              </div>
              <p className="text-white/80">
                Estudos bíblicos para crescimento espiritual
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Studies Feed */}
      <div className="space-y-6">
        {studies.map((study, index) => (
          <motion.div
            key={study.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              
              {/* Study Header */}
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {study.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{study.author}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(study.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                
                <div>
                  <CardTitle className="text-xl mb-2">{study.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {study.theme}
                    </span>
                    <span className="px-3 py-1 bg-muted rounded-full text-sm">
                      {study.baseText}
                    </span>
                  </div>
                </div>
              </CardHeader>

              {/* Study Content */}
              <CardContent className="space-y-4">
                {study.coverImage && (
                  <img  
                    className="w-full h-48 object-cover rounded-lg"
                    alt="Imagem do estudo bíblico"
                   src="https://images.unsplash.com/photo-1695115813610-b6f8d2fadd34" />
                )}
                
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-foreground">
                    {study.content}
                  </div>
                </div>

                {/* Interaction Bar */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(study.id)}
                      className={`gap-2 ${likes[study.id] ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`h-4 w-4 ${likes[study.id] ? 'fill-current' : ''}`} />
                      {study.likesCount}
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      {study.commentsCount}
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(study)}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </Button>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 pt-4 border-t">
                  {comments[study.id]?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.avatar} />
                        <AvatarFallback className="text-xs">
                          {comment.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        EU
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Textarea
                        placeholder="Adicione um comentário..."
                        value={newComment[study.id] || ''}
                        onChange={(e) => setNewComment(prev => ({
                          ...prev,
                          [study.id]: e.target.value
                        }))}
                        className="min-h-[60px] resize-none"
                      />
                      <Button
                        size="icon"
                        onClick={() => handleComment(study.id)}
                        disabled={!newComment[study.id]?.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {studies.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum estudo disponível</h3>
          <p className="text-muted-foreground">
            Aguarde novos estudos serem publicados
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default EBD;