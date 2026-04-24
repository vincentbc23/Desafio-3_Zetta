import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';
import { BotaoPrincipal } from '../components/BotaoPrincipal';
import { api } from '../api/client';

const AUTH_TOKEN_KEY = 'alerta-fogo-auth-token';
const AUTH_USER_KEY = 'alerta-fogo-auth-user';

interface LoginResponse {
  token: string;
  expiresAt: string;
  firefighter: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      navigate('/painel', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post<LoginResponse>('/api/auth/login', { email, senha });

      window.localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.firefighter));

      navigate('/painel', { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível acessar o painel.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#1C1C1E] to-[#0A1929] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF3B30] to-[#FF6A00] rounded-full mb-4 shadow-[0_0_30px_rgba(255,59,48,0.5)]"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#F2F2F7] mb-2">Acesso Restrito</h1>
          <p className="text-gray-400">Portal exclusivo para bombeiros autorizados</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[#F2F2F7] mb-2 font-medium">E-mail Institucional</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@bombeiros.gov.br"
                  required
                  className="w-full bg-[#2C2C2E] border border-white/20 rounded-xl pl-12 pr-4 py-3 text-[#F2F2F7] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#F2F2F7] mb-2 font-medium">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#2C2C2E] border border-white/20 rounded-xl pl-12 pr-4 py-3 text-[#F2F2F7] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-[#FF3B30] hover:text-[#FF6A00] text-sm transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            {errorMessage && (
              <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-lg p-4 text-sm text-[#F2F2F7] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#FF3B30] mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <BotaoPrincipal fullWidth isLoading={isLoading}>
              Acessar Painel
            </BotaoPrincipal>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-lg p-4"
          >
            <p className="text-sm text-gray-300 flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#FF3B30] mt-0.5 flex-shrink-0" />
              <span>Este sistema é de uso exclusivo de órgãos autorizados. Acessos são monitorados e registrados.</span>
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-[#F2F2F7] transition-colors"
          >
            ← Voltar para a página inicial
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}