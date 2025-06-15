import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Music, Calendar, Megaphone, BookOpen, DownloadCloud, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminOverview = ({ setActiveTab }) => {
  const adminActions = [
    { id: 'schedules', title: 'Gerenciar Escalas', description: 'Organizar escalas de serviço', icon: Calendar, color: 'from-green-500 to-emerald-600' },
    { id: 'members', title: 'Gerenciar Membros', description: 'Administrar usuários', icon: Users, color: 'from-indigo-500 to-purple-600' },
    { id: 'liturgy', title: 'Gerenciar Liturgia', description: 'Criar e editar liturgias', icon: FileText, color: 'from-blue-500 to-sky-600' },
    { id: 'repertoire', title: 'Gerenciar Repertório', description: 'Adicionar e organizar músicas', icon: Music, color: 'from-purple-500 to-pink-600' },
    { id: 'ebd', title: 'Gerenciar EBD', description: 'Publicar estudos bíblicos', icon: BookOpen, color: 'from-orange-500 to-amber-600' },
    { id: 'notices', title: 'Gerenciar Avisos', description: 'Publicar comunicados', icon: Megaphone, color: 'from-teal-500 to-cyan-600' },
    { id: 'downloads', title: 'Gerenciar Downloads', description: 'Adicionar e organizar arquivos', icon: DownloadCloud, color: 'from-rose-500 to-red-600' },
  ];

  // Helper for mockDownloads length if localStorage is empty
  const mockDownloads = [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

  // Mock stats - replace with real data fetching
  const stats = [
    { title: 'Membros Ativos', value: (JSON.parse(localStorage.getItem('church-synch-users')) || []).length || 53, icon: Users, color: 'text-blue-500' },
    { title: 'Escalas Criadas', value: (JSON.parse(localStorage.getItem('church-synch-schedules')) || []).length || 12, icon: Calendar, color: 'text-green-500' },
    { title: 'Músicas no Repertório', value: (JSON.parse(localStorage.getItem('church-synch-repertoire')) || []).length || 89, icon: Music, color: 'text-purple-500' },
    { title: 'Downloads Disponíveis', value: (JSON.parse(localStorage.getItem('church-synch-downloads')) || mockDownloads).length || 5, icon: DownloadCloud, color: 'text-red-500' }
  ];


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.title} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="shadow-md hover:shadow-lg transition-shadow rounded-2xl border-0">
                <CardContent className="p-5 sm:p-6 flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color.replace('text-', 'from-').replace('-500', '-400')} to-${stat.color.replace('text-', '')} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {adminActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div 
              key={action.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }} 
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <Card 
                className="cursor-pointer hover:shadow-xl transition-all duration-200 border-0 overflow-hidden group rounded-2xl shadow-md bg-card h-full flex flex-col" 
                onClick={() => setActiveTab(action.id)}
              >
                <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${action.color} text-white group-hover:scale-105 transition-transform`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-card-foreground">{action.title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                    <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary/80 px-1">
                        Acessar <ArrowRight className="h-4 w-4 ml-1.5"/>
                    </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOverview;