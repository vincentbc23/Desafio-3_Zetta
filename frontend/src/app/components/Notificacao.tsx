import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface NotificacaoProps {
  tipo: 'sucesso' | 'alerta';
  titulo: string;
  mensagem?: string;
  visivel: boolean;
  onFechar: () => void;
}

export function Notificacao({ tipo, titulo, mensagem, visivel, onFechar }: NotificacaoProps) {
  useEffect(() => {
    if (visivel) {
      const timer = setTimeout(() => {
        onFechar();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visivel, onFechar]);

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-24 right-8 z-50 max-w-md"
        >
          <div 
            className={`p-4 rounded-xl shadow-2xl backdrop-blur-md border ${
              tipo === 'sucesso' 
                ? 'bg-[#34C759]/20 border-[#34C759]/40' 
                : 'bg-[#FF9500]/20 border-[#FF9500]/40'
            }`}
            style={{
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex items-start gap-3">
              {tipo === 'sucesso' ? (
                <CheckCircle className="w-6 h-6 text-[#34C759] flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-[#FF9500] flex-shrink-0" />
              )}
              <div className="flex-1">
                <h4 className="font-bold text-white mb-1">{titulo}</h4>
                {mensagem && <p className="text-sm text-gray-300">{mensagem}</p>}
              </div>
              <button 
                onClick={onFechar}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
