import { motion } from 'motion/react';
import { Brain, Database, MapPin, Workflow, Map, Zap } from 'lucide-react';

interface Category {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface CategoriesProps {
  categories: Category[];
  title?: string;
}

const iconMap: Record<string, any> = {
  Brain,
  Database,
  MapPin,
  Workflow,
  Map,
  Zap,
};

export function Categories({ categories, title = 'Technologie i narzędzia' }: CategoriesProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black" id="kategorie">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">{title}</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Poznaj kluczowe technologie i obszary, które będziesz wykorzystywać podczas hackathonu
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon] || Brain;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="h-full p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-300 shadow-xl group/card">
                  {/* Very subtle background pattern */}
                  <div className="absolute inset-0 opacity-[0.02] rounded-xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600"></div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-14 h-14 mb-6 bg-white/5 rounded-2xl flex items-center justify-center group-hover/card:bg-white/10 group-hover/card:scale-110 transition-all duration-300 border border-white/5">
                      <IconComponent className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                      {category.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                      {category.description}
                    </p>
                  </div>

                  {/* Subtle glow effect on hover */}
                  <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/5 to-blue-600/5 rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
