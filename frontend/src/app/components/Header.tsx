import { motion } from 'motion/react';
import { Flame, Map, BarChart3, Home as HomeIcon, BookOpen, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#0A1929] text-white px-8 py-4 shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            animate={{
              filter: [
                'drop-shadow(0 0 8px rgba(255, 59, 48, 0.6))',
                'drop-shadow(0 0 15px rgba(255, 59, 48, 0.8))',
                'drop-shadow(0 0 8px rgba(255, 59, 48, 0.6))',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="w-8 h-8 text-[#FF3B30]" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[#F2F2F7]">Alerta Fogo</h1>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="flex gap-6">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white shadow-[0_4px_15px_rgba(255,59,48,0.4)]'
                    : 'hover:bg-[#1C1C1E] text-[#F2F2F7]'
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                Home
              </motion.div>
            </Link>

            <Link to="/mapa">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/mapa')
                    ? 'bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white shadow-[0_4px_15px_rgba(255,59,48,0.4)]'
                    : 'hover:bg-[#1C1C1E] text-[#F2F2F7]'
                }`}
              >
                <Map className="w-5 h-5" />
                Mapa
              </motion.div>
            </Link>

            <Link to="/dados">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/dados')
                    ? 'bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white shadow-[0_4px_15px_rgba(255,59,48,0.4)]'
                    : 'hover:bg-[#1C1C1E] text-[#F2F2F7]'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Dados
              </motion.div>
            </Link>

            <Link to="/educacao">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive('/educacao')
                    ? 'bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white shadow-[0_4px_15px_rgba(255,59,48,0.4)]'
                    : 'hover:bg-[#1C1C1E] text-[#F2F2F7]'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Educação
              </motion.div>
            </Link>
          </nav>

          <Link to="/login">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border border-[#FF3B30]/50 ${
                isActive('/login')
                  ? 'bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white shadow-[0_4px_15px_rgba(255,59,48,0.4)]'
                  : 'hover:bg-[#1C1C1E] text-[#F2F2F7]'
              }`}
            >
              <Shield className="w-5 h-5" />
              Órgãos
            </motion.div>
          </Link>
        </div>
      </div>
    </header>
  );
}