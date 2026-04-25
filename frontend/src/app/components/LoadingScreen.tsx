import { motion } from "motion/react";
import { Flame } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0A1929] flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-6 flex justify-center"
        >
          <motion.div
            animate={{
              filter: [
                "drop-shadow(0 0 10px rgba(255, 59, 48, 0.6))",
                "drop-shadow(0 0 25px rgba(255, 59, 48, 1))",
                "drop-shadow(0 0 10px rgba(255, 59, 48, 0.6))",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Flame className="w-16 h-16 text-[#FF3B30]" />
          </motion.div>
        </motion.div>

        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[#F2F2F7] text-xl font-bold"
        >
          Alerta Siriema
        </motion.h2>

        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-4"
        >
          <div className="flex gap-1 justify-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-[#FF3B30] rounded-full"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-[#FF3B30] rounded-full"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-[#FF3B30] rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
