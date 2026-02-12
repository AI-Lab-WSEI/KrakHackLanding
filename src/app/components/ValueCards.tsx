import { motion } from 'motion/react';
import { ValueCard } from '@/types/edition';
import * as Icons from 'lucide-react';

interface ValueCardsProps {
  cards: ValueCard[];
  title?: string;
}

export function ValueCards({ cards, title = 'Dlaczego warto?' }: ValueCardsProps) {
  return (
    <section id="o-nas" className="py-20 bg-gradient-to-br from-black via-purple-950/30 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-pink-500/20 blur-[100px] rounded-full"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cards.map((card, index) => {
            const Icon = Icons[card.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
            const gradientColors = [
              'from-cyan-500 to-blue-500',
              'from-pink-500 to-purple-500',
              'from-blue-500 to-cyan-500',
              'from-purple-500 to-pink-500',
              'from-cyan-500 to-teal-500',
              'from-pink-500 to-red-500',
            ];
            const gradient = gradientColors[index % gradientColors.length];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all h-full flex flex-col">
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {Icon && <Icon className="w-7 h-7 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-gray-300 leading-relaxed flex-grow">{card.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
