import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Bookmark,
  Share
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const Bible = () => {
  const [selectedBook, setSelectedBook] = useState('João');
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');

  const books = [
    'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio',
    'Josué', 'Juízes', 'Rute', '1 Samuel', '2 Samuel',
    'Mateus', 'Marcos', 'Lucas', 'João', 'Atos',
    'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios'
  ];

  // Simulação de versículos (João 3)
  const verses = [
    {
      number: 1,
      text: "E havia entre os fariseus um homem, chamado Nicodemos, príncipe dos judeus."
    },
    {
      number: 2,
      text: "Este foi ter de noite com Jesus, e disse-lhe: Rabi, bem sabemos que és Mestre, vindo de Deus; porque ninguém pode fazer estes sinais que tu fazes, se Deus não for com ele."
    },
    {
      number: 3,
      text: "Jesus respondeu, e disse-lhe: Na verdade, na verdade te digo que aquele que não nascer de novo, não pode ver o reino de Deus."
    },
    {
      number: 16,
      text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
      highlighted: true
    },
    {
      number: 17,
      text: "Porque Deus enviou o seu Filho ao mundo, não para que condenasse o mundo, mas para que o mundo fosse salvo por ele."
    }
  ];

  const handleBookmark = (verse) => {
    toast({
      title: "Versículo salvo!",
      description: `${selectedBook} ${selectedChapter}:${verse} foi adicionado aos seus favoritos.`,
    });
  };

  const handleShare = (verse) => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      toast({
        title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
      });
    }
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
                <h1 className="text-2xl font-bold">Bíblia Sagrada</h1>
              </div>
              <p className="text-white/80">
                A Palavra de Deus sempre ao seu alcance
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar versículos, palavras ou referências..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Book and Chapter Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Navegação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Livro</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {books.map(book => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Capítulo</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedChapter(Math.max(1, selectedChapter - 1))}
                    disabled={selectedChapter <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(parseInt(e.target.value) || 1)}
                    className="text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedChapter(selectedChapter + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bible Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {selectedBook} {selectedChapter}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {verses.map((verse, index) => (
              <motion.div
                key={verse.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`group p-4 rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                  verse.highlighted ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-sm font-bold text-primary min-w-[2rem]">
                    {verse.number}
                  </span>
                  <p className="flex-1 leading-relaxed text-foreground">
                    {verse.text}
                  </p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleBookmark(verse.number)}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleShare(verse.number)}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { book: 'Salmos', chapter: 23 },
                { book: 'João', chapter: 3 },
                { book: 'Romanos', chapter: 8 },
                { book: '1 Coríntios', chapter: 13 }
              ].map((ref) => (
                <Button
                  key={`${ref.book}-${ref.chapter}`}
                  variant="outline"
                  className="h-auto p-3 flex flex-col gap-1"
                  onClick={() => {
                    setSelectedBook(ref.book);
                    setSelectedChapter(ref.chapter);
                  }}
                >
                  <span className="font-semibold">{ref.book}</span>
                  <span className="text-sm text-muted-foreground">Cap. {ref.chapter}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Bible;