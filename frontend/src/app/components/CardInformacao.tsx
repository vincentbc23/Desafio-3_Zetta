import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface CardInformacaoProps {
  icon: LucideIcon;
  titulo: string;
  valor: string | number;
}

export function CardInformacao({ icon: Icon, titulo, valor }: CardInformacaoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-[#1C1C1E] text-white p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/10"
      style={{
        background: 'rgba(28, 28, 30, 0.8)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Icon className="w-8 h-8 text-[#FF3B30]" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{titulo}</p>
          <p className="text-2xl font-bold text-[#F2F2F7]">{valor}</p>
        </div>
      </div>
    </motion.div>
  );
}
