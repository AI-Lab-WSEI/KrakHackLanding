import { motion } from 'motion/react';
import { ImageOff } from 'lucide-react';
import partnersData from '../../../partners.json';

interface Partner {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  isPlaceholder?: boolean;
}

export function PartnersSection() {
  const { partners } = partnersData as { partners: Partner[] };
  
  // Duplicate partners to create a seamless infinite loop
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section id="partnerzy" className="py-20 bg-black overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-wider text-gray-400">
            Nasi Partnerzy & Wsparcie
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 mx-auto rounded-full opacity-50"></div>
        </motion.div>
      </div>

      {/* Infinite Slider */}
      <div className="relative flex overflow-hidden group">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              className="relative w-40 h-40 md:w-56 md:h-56 flex-shrink-0"
            >
              {partner.isPlaceholder ? (
                <div className="w-full h-full bg-white/5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center transition-all duration-300 group/item hover:bg-white/10 hover:border-white/40 overflow-hidden">
                  <div className="flex flex-col items-center gap-2 group-hover/item:opacity-0 transition-opacity">
                    <ImageOff className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity p-4 text-center">
                    <span className="text-sm font-bold text-cyan-400 leading-tight">
                      Tutaj może znaleźć się Twoje logo
                    </span>
                  </div>
                </div>
              ) : (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full bg-white/5 border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:bg-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-110"
                  />
                </a>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
