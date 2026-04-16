import { motion } from 'motion/react';

interface BotaoPrincipalProps {
  children: React.ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function BotaoPrincipal({ children, onClick, fullWidth = false, isLoading = false }: BotaoPrincipalProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
      whileTap={{ scale: 0.95 }}
      className={`relative bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white px-8 py-4 rounded-xl shadow-[0_8px_30px_rgba(255,59,48,0.4)] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${ fullWidth ? 'w-full' : '' } text-[20px]`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full"
          />
          Enviando...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
