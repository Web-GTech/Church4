import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Heart, 
  CreditCard, 
  Smartphone, 
  QrCode,
  DollarSign,
  Gift,
  Target,
  TrendingUp,
  Copy,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const Offering = () => {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [pixKeyCopied, setPixKeyCopied] = useState(false);

  const [walletApp, setWalletApp] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const predefinedAmounts = [
    { value: '10', label: 'R$ 10' },
    { value: '25', label: 'R$ 25' },
    { value: '50', label: 'R$ 50' },
    { value: '100', label: 'R$ 100' },
    { value: '200', label: 'R$ 200' }
  ];

  const paymentOptions = [
    {
      id: 'pix',
      name: 'PIX',
      icon: QrCode,
      action: () => setIsPixModalOpen(true),
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'wallet',
      name: 'Carteira Digital',
      icon: Smartphone,
      action: () => setIsWalletModalOpen(true),
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'card',
      name: 'Cartão de Crédito',
      icon: CreditCard,
      action: () => setIsCardModalOpen(true),
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const campaigns = [
    {
      id: 1,
      title: 'Reforma do Templo',
      description: 'Ajude na renovação do nosso espaço de adoração',
      goal: 50000,
      current: 32500,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Missões Urbanas',
      description: 'Apoie o trabalho evangelístico na cidade',
      goal: 15000,
      current: 8750,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value);
    setSelectedAmount('');
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText("churchsynch@pix.com.br");
    setPixKeyCopied(true);
    toast({ title: "Chave PIX copiada!", description: "A chave PIX foi copiada para sua área de transferência."});
    setTimeout(() => setPixKeyCopied(false), 2000);
  };
  
  const handleWalletPayment = () => {
    if(!walletApp) {
      toast({ title: "Erro", description: "Por favor, selecione um aplicativo de pagamento.", variant: "destructive" });
      return;
    }
    setIsWalletModalOpen(false);
    const campaignTitle = selectedCampaignId ? campaigns.find(c => c.id === selectedCampaignId)?.title : null;
    setTimeout(() => {
      toast({ title: "Pagamento via Carteira Digital", description: `Pagamento de R$ ${currentAmount} ${campaignTitle ? `para ${campaignTitle} ` : ''}via ${walletApp} processado com sucesso!` });
    }, 1000);
  };

  const handleCardPayment = () => {
    if(!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      toast({ title: "Erro", description: "Por favor, preencha todos os campos do cartão.", variant: "destructive" });
      return;
    }
    setIsCardModalOpen(false);
    const campaignTitle = selectedCampaignId ? campaigns.find(c => c.id === selectedCampaignId)?.title : null;
    setTimeout(() => {
      const success = Math.random() > 0.2; 
      if (success) {
        toast({ title: "Pagamento Aprovado!", description: `Pagamento de R$ ${currentAmount} ${campaignTitle ? `para ${campaignTitle} ` : ''}com cartão final ${cardNumber.slice(-4)} aprovado.` });
      } else {
        toast({ title: "Erro no Pagamento", description: "Não foi possível processar seu pagamento. Tente novamente.", variant: "destructive" });
      }
      setCardNumber(''); setCardName(''); setCardExpiry(''); setCardCvv('');
    }, 1500);
  };

  const handleContributeToCampaign = (campaign) => {
    setSelectedCampaignId(campaign.id);
    // Optionally pre-fill amount or open a specific modal
    toast({ title: `Contribuir para: ${campaign.title}`, description: "Selecione o valor e método de pagamento." });
    // Scroll to amount section or open a modal for focused donation
    const amountSection = document.getElementById('offering-amount-section');
    if (amountSection) {
        amountSection.scrollIntoView({ behavior: 'smooth' });
    }
  };


  const getProgressPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  const currentAmount = selectedAmount || customAmount;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
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
                <Heart className="h-8 w-8" />
                <h1 className="text-2xl font-bold">Área de Oferta</h1>
              </div>
              <p className="text-white/80">
                "Cada um contribua segundo propôs no seu coração" - 2 Coríntios 9:7
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card id="offering-amount-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Fazer uma Oferta {selectedCampaignId && `para: ${campaigns.find(c=>c.id === selectedCampaignId)?.title}`}
            </CardTitle>
            {selectedCampaignId && <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setSelectedCampaignId(null)}>Limpar seleção de campanha</Button>}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Valor da Oferta</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {predefinedAmounts.map((amount) => (
                  <Button
                    key={amount.value}
                    variant={selectedAmount === amount.value ? "default" : "outline"}
                    onClick={() => handleAmountSelect(amount.value)}
                    className="h-12"
                  >
                    {amount.label}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Outro valor"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Escolha como contribuir</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentOptions.map((option) => {
                  const Icon = option.icon;
                  return(
                    <Button
                      key={option.id}
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
                      onClick={() => {
                        if (!currentAmount) {
                          toast({ title: "Valor não definido", description: "Por favor, defina um valor para a oferta.", variant: "destructive" });
                          return;
                        }
                        option.action();
                      }}
                    >
                      <div className={`p-3 rounded-full bg-gradient-to-r ${option.color} text-white mb-2`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-semibold">{option.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem (Opcional)</Label>
              <Textarea
                id="message"
                placeholder="Deixe uma mensagem de oração ou gratidão..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isPixModalOpen} onOpenChange={setIsPixModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-6 w-6 text-green-600"/>
              Ofertar com PIX
            </DialogTitle>
            <DialogDescription>
              Use a chave PIX abaixo ou escaneie o QR Code no seu app bancário.
              Valor: <strong>R$ {currentAmount}</strong>
              {selectedCampaignId && ` para ${campaigns.find(c=>c.id === selectedCampaignId)?.title}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="p-2 border rounded-md bg-muted">
              <QrCode className="h-32 w-32 text-foreground" />
            </div>
            <div className="w-full p-3 bg-muted rounded-md text-center">
              <p className="text-sm text-muted-foreground">Chave PIX (Email)</p>
              <p className="font-mono text-lg">churchsynch@pix.com.br</p>
            </div>
            <Button onClick={copyPixKey} className="w-full">
              {pixKeyCopied ? <CheckCircle className="h-5 w-5 mr-2 text-green-400" /> : <Copy className="h-5 w-5 mr-2" />}
              {pixKeyCopied ? "Chave Copiada!" : "Copiar Chave"}
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-purple-600"/>
              Ofertar com Carteira Digital
            </DialogTitle>
            <DialogDescription>
              Selecione sua carteira digital e confirme o pagamento.
              Valor: <strong>R$ {currentAmount}</strong>
              {selectedCampaignId && ` para ${campaigns.find(c=>c.id === selectedCampaignId)?.title}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="wallet-app">Aplicativo de Pagamento</Label>
              <select
                id="wallet-app"
                value={walletApp}
                onChange={(e) => setWalletApp(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md bg-background"
              >
                <option value="">Selecione...</option>
                <option value="MercadoPago">MercadoPago</option>
                <option value="PicPay">PicPay</option>
                <option value="PayPal">PayPal</option>
                <option value="Ame Digital">Ame Digital</option>
              </select>
            </div>
            <Button onClick={handleWalletPayment} className="w-full gradient-bg from-purple-500 to-pink-500">
              Confirmar Pagamento de R$ {currentAmount}
            </Button>
          </div>
           <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600"/>
              Ofertar com Cartão de Crédito
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do seu cartão.
              Valor: <strong>R$ {currentAmount}</strong>
              {selectedCampaignId && ` para ${campaigns.find(c=>c.id === selectedCampaignId)?.title}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="card-number">Número do Cartão</Label>
              <Input id="card-number" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="card-name">Nome do Titular</Label>
              <Input id="card-name" placeholder="Como impresso no cartão" value={cardName} onChange={(e) => setCardName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="card-expiry">Validade</Label>
                <Input id="card-expiry" placeholder="MM/AA" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="card-cvv">CVV</Label>
                <Input id="card-cvv" placeholder="123" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleCardPayment} className="w-full gradient-bg from-blue-500 to-cyan-500">
              Pagar R$ {currentAmount}
            </Button>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Campanhas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{campaign.title}</h3>
                    <p className="text-muted-foreground">{campaign.description}</p>
                  </div>
                  <div className={`p-2 rounded-full bg-gradient-to-r ${campaign.color} text-white`}>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Arrecadado</span>
                    <span className="font-semibold">
                      R$ {campaign.current.toLocaleString()} / R$ {campaign.goal.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full bg-gradient-to-r ${campaign.color} transition-all duration-500`}
                      style={{ width: `${getProgressPercentage(campaign.current, campaign.goal)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {getProgressPercentage(campaign.current, campaign.goal).toFixed(1)}% da meta
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => handleContributeToCampaign(campaign)}
                >
                  Contribuir para esta Campanha
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Informações Importantes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Todas as transações são seguras e criptografadas</li>
              <li>• Você receberá um comprovante por email</li>
              <li>• As ofertas são utilizadas para a obra de Deus e ação social</li>
              <li>• Em caso de dúvidas, entre em contato com a tesouraria</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Offering;