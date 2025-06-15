import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Circle } from 'lucide-react';

const NewConversationModal = ({ isOpen, onOpenChange, allUsers, conversations, onStartConversation }) => {
  const [newConversationUserSearch, setNewConversationUserSearch] = useState('');

  const filteredUsersForNewPrivateConversation = allUsers.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(newConversationUserSearch.toLowerCase()) &&
    !conversations.find(c => !c.isGlobal && c.otherUserId === u.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Nova Conversa Privada</DialogTitle>
          <DialogDescription>Selecione um membro para conversar em particular.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input 
            placeholder="Buscar membro..." 
            value={newConversationUserSearch} 
            onChange={(e) => setNewConversationUserSearch(e.target.value)}
            className="mb-4"
          />
          <div className="max-h-[300px] overflow-y-auto space-y-2 scrollbar-hide">
            {filteredUsersForNewPrivateConversation.map(u => (
              <Button 
                key={u.id} 
                variant="ghost" 
                className="w-full justify-start gap-3 p-2 h-auto"
                onClick={() => {
                  onStartConversation(u);
                  setNewConversationUserSearch(''); // Reset search after selection
                }}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.profileImage} />
                  <AvatarFallback>{u.firstName?.[0]}{u.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <span>{u.firstName} {u.lastName}</span>
                {u.online && <Circle className="h-2 w-2 fill-green-500 text-green-500 ml-auto"/>}
              </Button>
            ))}
            {filteredUsersForNewPrivateConversation.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">Nenhum membro encontrado ou todas as conversas já foram iniciadas.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => setNewConversationUserSearch('')}>Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationModal;