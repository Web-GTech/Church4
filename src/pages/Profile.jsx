import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Camera, Edit3, Save, X, MessageSquare, BookOpen, Music, CalendarDays, LogOut, Briefcase, Heart, Instagram, Mail, MessageCircle as WhatsAppIcon, Home, Users2, Image as ImageIcon, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormData = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    ministries: user?.ministries || [],
    churchName: user?.churchName || 'Comunidade da Graça',
    instagram: user?.instagram || '',
    whatsapp: user?.whatsapp || '',
    profileImage: user?.profileImage || null,
  };
  const [formData, setFormData] = useState(initialFormData);

  // Mock data for counters and feed
  const [stats, setStats] = useState({
    scalesParticipated: 0,
    studiesLiked: 0,
    commentsMade: 0,
  });
  const [recentNotices, setRecentNotices] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        ministries: user.ministries || [],
        churchName: user.churchName || 'Comunidade da Graça',
        instagram: user.instagram || '',
        whatsapp: user.whatsapp || '',
        profileImage: user.profileImage || null,
      });
    }
    // Simulate fetching stats and recent notices
    const mockSchedules = JSON.parse(localStorage.getItem('church-synch-schedules')) || [];
    const userSchedules = mockSchedules.filter(s => s.responsibleId === user?.id && s.status === 'confirmed');
    
    const likedStudiesCount = Math.floor(Math.random() * 20); 
    const commentsMadeCount = Math.floor(Math.random() * 30);

    setStats({
      scalesParticipated: userSchedules.length,
      studiesLiked: likedStudiesCount,
      commentsMade: commentsMadeCount,
    });

    const allNotices = JSON.parse(localStorage.getItem('church-synch-notices')) || [];
    const userComments = JSON.parse(localStorage.getItem('church-synch-comments')) || {};
    
    let activityFeed = [];
    allNotices.forEach(notice => {
        activityFeed.push({type: 'notice_posted', item: notice, date: notice.date, user: notice.author});
        if(userComments[notice.id]) {
            userComments[notice.id].forEach(comment => {
                if(comment.authorId === user?.id) {
                    activityFeed.push({type: 'comment_made', item: comment, noticeTitle: notice.title, date: comment.date, user: comment.author });
                }
            });
        }
    });
    activityFeed.sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecentNotices(activityFeed.slice(0, 3));

  }, [user]);


  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
      className: "bg-green-500 text-white"
    });
  };

  const handleCancelEdit = () => {
    setFormData(initialFormData); // Reset form to initial user data
    setIsEditing(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
        // In a real app, you'd upload to a server and get a URL
        updateProfile({ ...formData, profileImage: reader.result }); 
        toast({ title: "Foto de perfil atualizada!" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({title: "Logout realizado com sucesso."});
  };

  const quickAccessButtons = [
    { label: "Mural", icon: MessageSquare, path: "/notice-board", color: "text-blue-500" },
    { label: "EBD", icon: BookOpen, path: "/ebd", color: "text-green-500" },
    { label: "Repertório", icon: Music, path: "/repertoire", color: "text-purple-500" },
    { label: "Minhas Escalas", icon: CalendarDays, path: "/schedules", color: "text-orange-500" },
  ];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 space-y-6">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden shadow-xl border-0 bg-card">
          <div className="h-36 md:h-48 bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 relative">
            <div className="absolute inset-0 church-pattern opacity-20"></div>
          </div>
          <CardContent className="p-4 sm:p-6 -mt-20 sm:-mt-24 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <div className="relative group">
                <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-lg">
                  <AvatarImage src={formData.profileImage || user?.profileImage} alt={`${user?.firstName} ${user?.lastName}`} />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="profileImageUpload" className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center justify-center cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5" />
                  <input id="profileImageUpload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{user?.firstName} {user?.lastName}</h1>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <Briefcase className="h-4 w-4"/>
                  {user?.role === 'admin' ? 'Administrador' : 'Membro'}
                  {user?.ministries && user.ministries.length > 0 && ` • ${user.ministries.join(', ')}`}
                </p>
                {user?.churchName && (
                    <p className="text-sm text-primary flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                        <Home className="h-4 w-4"/> {user.churchName}
                    </p>
                )}
                <div className="mt-2 flex justify-center sm:justify-start gap-3">
                    {user?.instagram && (
                        <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-500 transition-colors">
                            <Instagram className="h-5 w-5" />
                        </a>
                    )}
                    {user?.whatsapp && (
                        <a href={`https://wa.me/${user.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-green-500 transition-colors">
                            <WhatsAppIcon className="h-5 w-5" />
                        </a>
                    )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 self-center sm:self-end">
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="gap-2">
                  {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  {isEditing ? 'Cancelar' : 'Editar Perfil'}
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="text-destructive-foreground bg-destructive hover:bg-destructive/90 gap-2">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>

            {/* Stats Counter */}
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4 text-center border-t pt-4">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-primary">{stats.scalesParticipated}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Escalas</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-primary">{stats.studiesLiked}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Curtidas</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-primary">{stats.commentsMade}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Comentários</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Editing Form (Conditional) */}
      <AnimatePresence>
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Edit3 className="h-5 w-5" />
                Editar Informações Pessoais
              </CardTitle>
              <CardDescription>Atualize seus dados. Campos com * são opcionais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1"><Label htmlFor="firstName">Nome</Label><Input id="firstName" value={formData.firstName} onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}/></div>
                <div className="space-y-1"><Label htmlFor="lastName">Sobrenome</Label><Input id="lastName" value={formData.lastName} onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}/></div>
              </div>
              <div className="space-y-1"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}/></div>
              <div className="space-y-1"><Label htmlFor="phone">Telefone *</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="(00) 00000-0000"/></div>
              <div className="space-y-1"><Label htmlFor="address">Endereço *</Label><Input id="address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Rua, número, bairro, cidade"/></div>
              <div className="space-y-1"><Label htmlFor="churchName">Nome da Igreja *</Label><Input id="churchName" value={formData.churchName} onChange={(e) => setFormData(prev => ({ ...prev, churchName: e.target.value }))} placeholder="Nome da sua congregação"/></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1"><Label htmlFor="instagram">Instagram *</Label><Input id="instagram" value={formData.instagram} onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))} placeholder="seu_usuario_insta (sem @)"/></div>
                <div className="space-y-1"><Label htmlFor="whatsapp">WhatsApp *</Label><Input id="whatsapp" value={formData.whatsapp} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))} placeholder="5511987654321 (com DDD)"/></div>
              </div>
              {/* TODO: Add ministry selection if needed */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={handleCancelEdit}><X className="h-4 w-4 mr-2" />Cancelar</Button>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90"><Save className="h-4 w-4 mr-2" />Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Quick Access Buttons */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: isEditing ? 0 : 0.2 }}>
        <Card className="shadow-md">
          <CardHeader><CardTitle className="text-lg">Acesso Rápido</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {quickAccessButtons.map(btn => {
              const Icon = btn.icon;
              return (
                <Button
                  key={btn.label}
                  variant="outline"
                  className="h-auto p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => navigate(btn.path)}
                >
                  <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${btn.color}`} />
                  <span className="text-xs sm:text-sm font-medium">{btn.label}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity Feed */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: isEditing ? 0 : 0.3 }}>
        <Card className="shadow-md">
          <CardHeader><CardTitle className="text-lg">Minha Atividade Recente</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentNotices.length > 0 ? recentNotices.map((activity, index) => (
              <Card key={index} className="p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow bg-muted/30 dark:bg-muted/10">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.item.avatar || user?.profileImage} />
                    <AvatarFallback className="bg-primary/20 text-primary">{activity.user?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{activity.user}</span>
                      <span className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}</span>
                    </div>
                    {activity.type === 'notice_posted' && <p className="text-sm mt-1">Publicou o aviso: <span className="font-medium">"{activity.item.title}"</span></p>}
                    {activity.type === 'comment_made' && <p className="text-sm mt-1">Comentou no aviso <span className="font-medium">"{activity.noticeTitle}"</span>: "{activity.item.content.substring(0,50)}..."</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {activity.type === 'notice_posted' && <><span className="flex items-center gap-1"><Heart className="h-3 w-3"/> {activity.item.likesCount || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3"/> {activity.item.commentsCount || 0}</span></>}
                    </div>
                  </div>
                </div>
              </Card>
            )) : <p className="text-muted-foreground text-center py-4">Nenhuma atividade recente para mostrar.</p>}
             {recentNotices.length > 0 && (
                <Button variant="link" size="sm" className="w-full mt-2 text-primary" onClick={() => navigate('/notice-board')}>Ver todo o mural</Button>
             )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;