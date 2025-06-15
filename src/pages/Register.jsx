import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Church, Users, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    churchName: 'Comunidade da Graça', 
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
        action: <AlertCircle className="text-red-500" />,
      });
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Erro no cadastro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
        action: <AlertCircle className="text-red-500" />,
      });
      setLoading(false);
      return;
    }


    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.churchName
      );
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: `Bem-vindo(a), ${formData.firstName}! Você será redirecionado.`,
      });
      // AuthContext's onAuthStateChange and ProtectedRoute will handle navigation
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Não foi possível criar sua conta. Tente novamente.";
      if (error.message && error.message.toLowerCase().includes("user already registered")) {
        errorMessage = "Este e-mail já está cadastrado. Tente fazer login ou use um e-mail diferente.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
        action: <AlertCircle className="text-red-500" />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-effect border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div 
              className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Church className="w-10 h-10 text-white" />
              <Users className="w-6 h-6 text-white absolute -bottom-1 -right-1 opacity-70" />
            </motion.div>
            <CardTitle className="text-3xl font-bold gradient-text">Criar Conta</CardTitle>
            <CardDescription className="text-muted-foreground">
              Junte-se à nossa comunidade de fé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="João"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="bg-background/70 dark:bg-slate-800/50 border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Silva"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="bg-background/70 dark:bg-slate-800/50 border-border focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-background/70 dark:bg-slate-800/50 border-border focus:border-primary"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="churchName">Nome da Igreja (Opcional)</Label>
                <Input
                  id="churchName"
                  name="churchName"
                  placeholder="Comunidade da Graça"
                  value={formData.churchName}
                  onChange={handleChange}
                  className="bg-background/70 dark:bg-slate-800/50 border-border focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha (mínimo 6 caracteres)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-background/70 dark:bg-slate-800/50 border-border focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-background/70 dark:bg-slate-800/50 border-border focus:border-primary"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 transition-all duration-300 ease-in-out transform hover:scale-105"
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;