import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { SimpleCountdown } from './SimpleCountdown';

interface HeroProps {
  subtitle: string;
  ctaUrl: string;
  isArchive?: boolean;
}

export function Hero({ subtitle, ctaUrl, isArchive = false }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image - Dark Purple Futuristic */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1762278804729-13d330fad71a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwcHVycGxlJTIwZnV0dXJpc3RpYyUyMHRlY2hub2xvZ3klMjBhYnN0cmFjdCUyMG5lb258ZW58MXx8fHwxNzcwMTUxNDYzfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="AI Krak Hack Futuristic Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-purple-950/40 to-black/90"></div>
      </div>

      {/* Animated gradient overlay - enhanced purple atmosphere */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-1/2 h-1/2 bg-purple-600/30 blur-[120px] rounded-full"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.25, 0.35, 0.25]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-fuchsia-600/25 blur-[120px] rounded-full"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-cyan-500/20 blur-[150px] rounded-full"
        ></motion.div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {isArchive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6 px-6 py-2 bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-full"
            >
              <span className="text-gray-300 text-sm font-medium">Archiwum</span>
            </motion.div>
          )}
          
          {/* Large AI Krak Hack Central Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex justify-center mb-8"
          >
            <img 
              src="https://res.cloudinary.com/dyux0lw71/image/upload/v1770832103/ai-krak-hack-central_frj1yg.svg"
              alt="AI Krak Hack 2026"
              className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl h-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
          >
            {subtitle}
          </motion.p>

          {/* Countdown Timer - Integrated */}
          {!isArchive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-12"
            >
              <SimpleCountdown />
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            {!isArchive && ctaUrl && (
              <a
                href={ctaUrl}
                className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] hover:-translate-y-1 relative overflow-hidden group"
              >
                <span className="relative z-10">Zgłoś się teraz</span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-white/50"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </a>
            )}

            {!isArchive && (
              <a
                href="#harmonogram"
                className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest transition-all backdrop-blur-md hover:-translate-y-1 flex items-center gap-3"
              >
                Harmonogram
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </motion.div>

          {!isArchive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="mt-10"
            >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 backdrop-blur-sm border border-green-400/40 rounded-full">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2.5 h-2.5 bg-green-400 rounded-full"
                ></motion.div>
                <span className="text-green-300 font-medium">Rekrutacja otwarta</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {!isArchive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-gray-400 text-sm font-medium">Przewiń w dół</span>
            <div className="w-7 h-12 border-2 border-cyan-400/60 rounded-full flex items-start justify-center p-2 backdrop-blur-sm bg-black/20">
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
              ></motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}