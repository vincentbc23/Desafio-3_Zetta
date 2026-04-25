import { motion } from "motion/react";
import {
  Map,
  BarChart3,
  Home as HomeIcon,
  BookOpen,
  Shield,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import logoSiriema from "../../assets/logosiriema-headerbg.png";

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-[#0A1929] text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <motion.div>
            <img
              src={logoSiriema}
              alt="Logo Alerta Siriema"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </motion.div>
          <h1 className="text-lg sm:text-2xl font-bold text-[#F2F2F7]">Alerta Siriema</h1>
        </Link>

        <div className="flex w-full md:w-auto flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <nav className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base ${
                  isActive("/")
                    ? "bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white shadow-[0_4px_15px_rgba(255,59,48,0.4)]"
                    : "hover:bg-[#1C1C1E] text-[#F2F2F7]"
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
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base ${
                  isActive("/mapa")
                    ? "bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white shadow-[0_4px_15px_rgba(255,59,48,0.4)]"
                    : "hover:bg-[#1C1C1E] text-[#F2F2F7]"
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
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base ${
                  isActive("/dados")
                    ? "bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white shadow-[0_4px_15px_rgba(255,59,48,0.4)]"
                    : "hover:bg-[#1C1C1E] text-[#F2F2F7]"
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
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base ${
                  isActive("/educacao")
                    ? "bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white shadow-[0_4px_15px_rgba(255,59,48,0.4)]"
                    : "hover:bg-[#1C1C1E] text-[#F2F2F7]"
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
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all border border-[#FF3B30]/50 whitespace-nowrap text-sm sm:text-base w-fit ${
                isActive("/login")
                  ? "bg-gradient-to-r from-[#FF3B30] to-[#FF6A00] text-white shadow-[0_4px_15px_rgba(255,59,48,0.4)]"
                  : "hover:bg-[#1C1C1E] text-[#F2F2F7]"
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
