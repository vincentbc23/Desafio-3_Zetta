import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { CheckCircle, Home, Shield } from 'lucide-react';
import { BotaoPrincipal } from '../components/BotaoPrincipal';
import { useEffect } from 'react';

export default function Sucesso() {
  const navigate = useNavigate();

  useEffect(() => {
    // Animação de confetti ou celebração poderia ser adicionada aqui
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1929] flex items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Ícone de sucesso animado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[#34C759] rounded-full blur-2xl"
            />
            <CheckCircle className="relative w-24 h-24 text-[#34C759]" />
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-[#F2F2F7] mb-4"
        >
          ✅ Alerta Enviado!
        </motion.h1>

        {/* Descrição */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8"
        >
          <p className="text-[#F2F2F7] text-lg mb-4">
            Seu reporte foi recebido com sucesso!
          </p>
          
          {/* Cards de status */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 bg-[#34C759]/10 border border-[#34C759]/30 rounded-lg p-3"
            >
              <Shield className="w-5 h-5 text-[#34C759]" />
              <p className="text-sm text-[#F2F2F7] text-left">
                Autoridades notificadas
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 bg-[#34C759]/10 border border-[#34C759]/30 rounded-lg p-3"
            >
              <Shield className="w-5 h-5 text-[#34C759]" />
              <p className="text-sm text-[#F2F2F7] text-left">
                Equipes de emergência mobilizadas
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-3 bg-[#34C759]/10 border border-[#34C759]/30 rounded-lg p-3"
            >
              <Shield className="w-5 h-5 text-[#34C759]" />
              <p className="text-sm text-[#F2F2F7] text-left">
                Comunidade local alertada
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Botões */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <BotaoPrincipal fullWidth onClick={() => navigate('/')}>
            <Home className="w-5 h-5 inline mr-2" />
            Voltar ao Início
          </BotaoPrincipal>
          
          <button 
            onClick={() => navigate('/mapa')}
            className="w-full text-[#F2F2F7] hover:text-white transition-colors"
          >
            Ver no Mapa
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}