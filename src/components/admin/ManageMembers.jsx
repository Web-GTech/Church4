import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Edit, Trash2, UserPlus, ShieldCheck, ShieldAlert, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ManageMembers = () => {
  const { user: currentUser } = useAuth(); // For not allowing admin to edit/delete self
  const [allUsers, setAllUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const mockUsers = JSON.parse(localStorage.getItem('church-synch-users')) || [
      { id: '1', firstName: 'João', lastName: 'Silva', email: 'joao.silva@example.com', role: 'admin', ministries: ['Louvor', 'Liderança'], profileImage: null, churchName: 'Comunidade da Graça' },
      { id: '2', firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@example.com', role: 'member', ministries: ['Recepção', 'Crianças'], profileImage: null, churchName: 'Comunidade da Graça' },
      { id: '3', firstName: 'Carlos', lastName: 'Lima', email: 'carlos.lima@example.com', role: 'member', ministries: ['Som', 'Jovens'], profileImage: null, churchName: 'Igreja Batista Central' },
      { id: '4', firstName: 'Ana', lastName: 'Oliveira', email: 'ana.oliveira@example.com', role: 'member', ministries: ['Ação Social'], profileImage: null, churchName: 'Comunidade da Graça' },
    ];
    setAllUsers(mockUsers);
  }, []);

  const handleEditUser = (usr) => {
    setEditingUser({ ...usr, ministries: usr.ministries || [] }); // Ensure ministries is an array
    setIsEditUserModalOpen(true);
  };

  const handleSaveUserChanges = () => {
    if (!editingUser) return;
    const updatedUsers = allUsers.map(u => u.id === editingUser.id ? editingUser : u);
    setAllUsers(updatedUsers);
    localStorage.setItem('church-synch-users', JSON.stringify(updatedUsers));
    toast({ title: "Usuário Atualizado!", description: `Dados de ${editingUser.firstName} salvos.` });
    setIsEditUserModalOpen(false);
    setEditingUser(null);
  };

  const handleToggleAdmin = (userId) => {
    const updatedUsers = allUsers.map(u => 
      u.id === userId ? { ...u, role: u.role === 'admin' ? 'member' : 'admin' } : u
    );
    setAllUsers(updatedUsers);
    localStorage.setItem('church-synch-users', JSON.stringify(updatedUsers));
    const targetUser = updatedUsers.find(u => u.id === userId);
    toast({ title: "Cargo Alterado!", description: `${targetUser.firstName} agora é ${targetUser.role === 'admin' ? 'Administrador(a)' : 'Membro'}.` });
  };

  const confirmRemoveUser = (usr) => {
    setUserToDelete(usr);
    setIsConfirmDeleteModalOpen(true);
  };
  
  const handleRemoveUser = () => {
    if (!userToDelete) return;
    const updatedUsers = allUsers.filter(u => u.id !== userToDelete.id);
    setAllUsers(updatedUsers);
    localStorage.setItem('church-synch-users', JSON.stringify(updatedUsers));
    toast({ title: "Usuário Removido!", description: `${userToDelete.firstName} foi removido do sistema.` });
    setIsConfirmDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const filteredUsers = allUsers.filter(usr => 
    `${usr.firstName} ${usr.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usr.ministries && usr.ministries.join(', ').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="shadow-xl rounded-2xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>Gerenciar Membros</CardTitle>
        <CardDescription>Visualize, edite, promova ou remova usuários do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Input 
          placeholder="Buscar membros por nome, email ou ministério..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6"
        />
        <div className="space-y-4">
          {filteredUsers.map(usr => (
            <motion.div 
              key={usr.id} 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow bg-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={usr.profileImage} />
                  <AvatarFallback className="bg-primary/20 text-primary">{usr.firstName?.[0]}{usr.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground">{usr.firstName} {usr.lastName} {usr.id === currentUser.id && <Badge variant="outline" className="ml-2 text-xs">Você</Badge>}</h4>
                  <p className="text-sm text-muted-foreground">{usr.email}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(usr.ministries || []).map(min => <Badge key={min} variant="secondary" className="text-xs">{min}</Badge>)}
                    <Badge variant={usr.role === 'admin' ? 'default' : 'outline'} className="text-xs capitalize bg-primary/10 text-primary border-primary/30">
                      {usr.role === 'admin' ? <ShieldCheck className="h-3 w-3 mr-1"/> : <ShieldAlert className="h-3 w-3 mr-1"/>}
                      {usr.role}
                    </Badge>
                  </div>
                </div>
              </div>
              {usr.id !== currentUser.id && ( // Prevent admin from editing/deleting self
                <div className="flex gap-2 self-start sm:self-center">
                  <Button variant="outline" size="icon" onClick={() => handleEditUser(usr)} title="Editar Usuário">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleToggleAdmin(usr.id)} title={usr.role === 'admin' ? 'Revogar Admin' : 'Promover a Admin'}>
                    {usr.role === 'admin' ? <ShieldAlert className="h-4 w-4 text-orange-500" /> : <ShieldCheck className="h-4 w-4 text-green-500" />}
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => confirmRemoveUser(usr)} title="Remover Usuário">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>

      {editingUser && (
        <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Usuário: {editingUser.firstName} {editingUser.lastName}</DialogTitle>
              <DialogDescription>Modifique os dados do usuário abaixo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="editFirstName">Nome</Label><Input id="editFirstName" value={editingUser.firstName} onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})} /></div>
                <div><Label htmlFor="editLastName">Sobrenome</Label><Input id="editLastName" value={editingUser.lastName} onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})} /></div>
              </div>
              <div><Label htmlFor="editEmail">Email</Label><Input id="editEmail" type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} /></div>
              <div><Label htmlFor="editChurchName">Nome da Igreja</Label><Input id="editChurchName" value={editingUser.churchName || ''} onChange={(e) => setEditingUser({...editingUser, churchName: e.target.value})} /></div>
              <div>
                <Label htmlFor="editMinistries">Ministérios (separados por vírgula)</Label>
                <Input id="editMinistries" value={(editingUser.ministries || []).join(', ')} onChange={(e) => setEditingUser({...editingUser, ministries: e.target.value.split(',').map(m => m.trim()).filter(m => m)})} />
              </div>
              <div>
                <Label htmlFor="editRole">Cargo</Label>
                <select id="editRole" value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full p-2 border rounded-md bg-background text-sm h-10">
                    <option value="member">Membro</option>
                    <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditUserModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveUserChanges} className="bg-primary hover:bg-primary/90">Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {userToDelete && (
        <Dialog open={isConfirmDeleteModalOpen} onOpenChange={setIsConfirmDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive">Confirmar Remoção</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja remover o usuário <span className="font-semibold">{userToDelete.firstName} {userToDelete.lastName}</span>? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsConfirmDeleteModalOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleRemoveUser}>Remover Usuário</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default ManageMembers;