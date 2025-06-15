import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Heart, FolderHeart as HandHeart, Music, BookOpen, User as UserIcon, Home, Instagram, MessageCircle as WhatsAppIcon, Briefcase, Mail } from 'lucide-react'; // Mail adicionado
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button'; // Button importado


// Mock function to get user details by name (replace with actual data fetching)
const MOCK_USERS_DB = [
    { id: 'pastor-joao-id', name: 'Pastor João Silva', role: 'Pastor Presidente', avatar: null, churchName: "Igreja Central", instagram: "pastorjoao", whatsapp: "5511999990001", ministries: ["Liderança Principal"], email: "pastor.joao@example.com" },
    { id: 'pastora-maria-id', name: 'Pastora Maria Silva', role: 'Pastora', avatar: null, churchName: "Igreja Central", instagram: "pastoramaria", whatsapp: "5511999990002", ministries: ["Aconselhamento"], email: "pastora.maria@example.com"  },
    { id: 'diacono-pedro-id', name: 'Diácono Pedro Costa', role: 'Diácono', avatar: null, ministry: 'Administração', churchName: "Igreja Central", instagram: "pedrocosta", whatsapp: "5511999990003", ministries: ["Administração", "Finanças"], email: "pedro.costa@example.com"  },
    { id: 'lider-maria-id', name: 'Maria Oliveira', role: 'Líder de Louvor', avatar: null, ministry: 'Ministério de Louvor', churchName: "Igreja Central", instagram: "maria_louvor", whatsapp: "5511999990004", ministries: ["Louvor"], email: "maria.oliveira@example.com"  },
    { id: 'membro-geovane-id', name: 'Geovane Santos', role: 'Membro', avatar: null, ministry: 'Mídia', churchName: "Igreja Central", instagram: "geovanesantos", whatsapp: "5511999990005", ministries: ["Mídia", "Jovens"], email: "geovane.santos@example.com"  },
];

const getUserByFullName = (name) => {
    return MOCK_USERS_DB.find(u => u.name.toLowerCase() === name.toLowerCase());
};


const OrganogramMemberCard = ({ member, delay, onMemberClick }) => {
    const IconComponent = member.icon || UserIcon;
    const bgColor = member.color || 'from-gray-500 to-slate-500';
  
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: delay }}
        className="animate-cascade cursor-pointer"
        onClick={() => onMemberClick(member.name)}
        whileHover={{ y: -5, transition: {duration: 0.2}}}
      >
        <Card className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
          <div className={`h-2 bg-gradient-to-r ${bgColor}`}></div>
          <CardContent className="p-4 sm:p-6 text-center flex-1 flex flex-col justify-center items-center">
            <div className={`mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center text-white mb-3 sm:mb-4 shadow-md`}>
              <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="font-bold text-base sm:text-lg mb-1">{member.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">{member.role}</p>
            {member.ministry && <Badge variant="secondary" className="text-xs">{member.ministry}</Badge>}
          </CardContent>
        </Card>
      </motion.div>
    );
  };


const Organogram = () => {
  const [orgData, setOrgData] = useState(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // to get current logged in user for comparison or other logic

  const [selectedMemberProfile, setSelectedMemberProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);


  useEffect(() => {
    const mockOrgData = {
      pastor: {
        id: 'pastor-joao-id', name: 'Pastor João Silva', role: 'Pastor Presidente', avatar: null, icon: Crown, color: 'from-yellow-400 to-amber-500'
      },
      pastora: {
        id: 'pastora-maria-id', name: 'Pastora Maria Silva', role: 'Pastora', avatar: null, icon: Heart, color: 'from-pink-400 to-rose-500'
      },
      diaconos: [
        { id: 'diacono-pedro-id', name: 'Diácono Pedro Costa', role: 'Diácono', avatar: null, ministry: 'Administração', icon: HandHeart, color: 'from-sky-400 to-blue-500' },
        { id: 'diacono-carlos-id', name: 'Diácono Carlos Lima', role: 'Diácono', avatar: null, ministry: 'Patrimônio', icon: HandHeart, color: 'from-cyan-400 to-teal-500' },
        { id: 'diacono-jose-id', name: 'Diácono José Santos', role: 'Diácono', avatar: null, ministry: 'Ação Social', icon: HandHeart, color: 'from-emerald-400 to-green-500' }
      ],
      lideres: [
        { id: 'lider-maria-id', name: 'Maria Oliveira', role: 'Líder de Louvor', avatar: null, ministry: 'Ministério de Louvor', icon: Music, color: 'from-purple-400 to-violet-500' },
        { id: 'lider-ana-id', name: 'Ana Santos', role: 'Líder de Recepção', avatar: null, ministry: 'Ministério de Recepção', icon: Users, color: 'from-indigo-400 to-blue-500' },
        { id: 'lider-pedro-m-id', name: 'Dr. Pedro Mendes', role: 'Superintendente EBD', avatar: null, ministry: 'Escola Bíblica Dominical', icon: BookOpen, color: 'from-lime-400 to-green-500' },
      ],
      membros: [ // Added a few example members
        { id: 'membro-geovane-id', name: 'Geovane Santos', role: 'Membro', ministry: 'Mídia', icon: UserIcon, color: 'from-slate-400 to-gray-500' },
        { id: 'membro-carla-id', name: 'Carla Dias', role: 'Membro', ministry: 'Infantil', icon: UserIcon, color: 'from-slate-400 to-gray-500' },
      ]
    };
    setOrgData(mockOrgData);
  }, []);

  const handleMemberClick = (memberName) => {
    const memberDetails = getUserByFullName(memberName);
    if (memberDetails) {
      setSelectedMemberProfile(memberDetails);
      setIsProfileModalOpen(true);
    } else {
      toast({ title: "Perfil não encontrado", description: `Detalhes para ${memberName} não disponíveis.`, variant: "destructive" });
    }
  };


  if (!orgData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4"><div className="h-32 bg-muted rounded-lg"></div><div className="h-64 bg-muted rounded-lg"></div></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground border-0 overflow-hidden relative shadow-xl">
          <div className="absolute inset-0 church-pattern opacity-10"></div>
          <CardContent className="p-6 relative z-10">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3"><Users className="h-8 w-8" /><h1 className="text-2xl font-bold">Organograma da Igreja</h1></div>
              <p className="text-primary-foreground/80">Conheça nossa estrutura de liderança e membros.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pastores */}
      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
        <OrganogramMemberCard member={orgData.pastor} delay={0.1} onMemberClick={handleMemberClick} />
        <OrganogramMemberCard member={orgData.pastora} delay={0.2} onMemberClick={handleMemberClick} />
      </div>
      
      <div className="flex justify-center my-4"><div className="w-px h-10 bg-gradient-to-b from-primary/50 to-transparent"></div></div>
      
      {/* Diáconos */}
      <div>
        <h2 className="text-xl font-semibold text-center mb-4 text-foreground">Diáconos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {orgData.diaconos.map((diacono, index) => (
            <OrganogramMemberCard key={diacono.id} member={diacono} delay={0.3 + index * 0.1} onMemberClick={handleMemberClick} />
          ))}
        </div>
      </div>

      <div className="flex justify-center my-4"><div className="w-px h-10 bg-gradient-to-b from-primary/50 to-transparent"></div></div>

      {/* Líderes de Ministérios */}
      <div>
        <h2 className="text-xl font-semibold text-center mb-4 text-foreground">Líderes de Ministérios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {orgData.lideres.map((lider, index) => (
            <OrganogramMemberCard key={lider.id} member={lider} delay={0.6 + index * 0.1} onMemberClick={handleMemberClick}/>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center my-4"><div className="w-px h-10 bg-gradient-to-b from-primary/50 to-transparent"></div></div>

      {/* Membros (simplified section for example) */}
      <div>
        <h2 className="text-xl font-semibold text-center mb-4 text-foreground">Membros Ativos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {orgData.membros.map((membro, index) => (
             <OrganogramMemberCard key={membro.id} member={membro} delay={0.9 + index * 0.05} onMemberClick={handleMemberClick}/>
          ))}
        </div>
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && selectedMemberProfile && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setIsProfileModalOpen(false)} // Close on overlay click
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <CardHeader className="p-0">
                    <div className="h-28 bg-gradient-to-br from-primary to-blue-500 relative">
                         <div className="absolute inset-0 church-pattern opacity-10"></div>
                    </div>
                    <div className="flex justify-center -mt-14">
                        <Avatar className="w-28 h-28 border-4 border-card shadow-lg">
                            <AvatarImage src={selectedMemberProfile.avatar} alt={selectedMemberProfile.name} />
                            <AvatarFallback className="text-3xl bg-primary/80 text-primary-foreground">{selectedMemberProfile.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</AvatarFallback>
                        </Avatar>
                    </div>
                </CardHeader>
                <CardContent className="p-6 text-center">
                    <h2 className="text-2xl font-bold text-foreground">{selectedMemberProfile.name}</h2>
                    <p className="text-primary font-medium">{selectedMemberProfile.role}</p>
                    {selectedMemberProfile.churchName && <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1"><Home className="h-4 w-4"/>{selectedMemberProfile.churchName}</p>}

                    {selectedMemberProfile.ministries && selectedMemberProfile.ministries.length > 0 && (
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-1">Ministérios:</h4>
                            <div className="flex flex-wrap justify-center gap-1">
                                {selectedMemberProfile.ministries.map(min => <Badge key={min} variant="secondary">{min}</Badge>)}
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-4 flex justify-center gap-4">
                        {selectedMemberProfile.instagram && (
                            <Button variant="ghost" size="icon" asChild className="text-pink-500 hover:text-pink-600">
                                <a href={`https://instagram.com/${selectedMemberProfile.instagram}`} target="_blank" rel="noopener noreferrer"><Instagram /></a>
                            </Button>
                        )}
                        {selectedMemberProfile.whatsapp && (
                             <Button variant="ghost" size="icon" asChild className="text-green-500 hover:text-green-600">
                                <a href={`https://wa.me/${selectedMemberProfile.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /></a>
                            </Button>
                        )}
                        {selectedMemberProfile.email && (
                            <Button variant="ghost" size="icon" asChild className="text-blue-500 hover:text-blue-600">
                                <a href={`mailto:${selectedMemberProfile.email}`}><Mail /></a>
                            </Button>
                        )}
                    </div>
                </CardContent>
                <div className="p-4 bg-muted/50 border-t text-right">
                    <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>Fechar</Button>
                </div>
            </motion.div>
        </motion.div>
      )}

    </div>
  );
};

export default Organogram;