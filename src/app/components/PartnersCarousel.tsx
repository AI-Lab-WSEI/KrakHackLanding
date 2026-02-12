import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string;
}

export function PartnersCarousel() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    // Load partners from JSON file
    fetch('/partners.json')
      .then(response => response.json())
      .then(data => setPartners(data.partners))
      .catch(error => console.error('Error loading partners:', error));
  }, []);

  // Duplicate partners for seamless loop
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nasi Partnerzy
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Współpracujemy z najlepszymi firmami technologicznymi
          </p>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 rounded-full border border-gray-700"
          >
            <span className="text-gray-300">Chcesz, aby Twoje logo było tutaj?</span>
            <a
              href="#zostanSponsorom"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Zostań naszym sponsorem →
            </a>
          </motion.div>
        </motion.div>

        {/* Partners Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            animate={{
              x: [0, -50 * partners.length + '%']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="flex gap-12 items-center"
            style={{ width: `${duplicatedPartners.length * 200}px` }}
          >
            {duplicatedPartners.map((partner, index) => (
              <motion.div
                key={`${partner.id}-${index}`}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 w-48 h-24 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all duration-300 flex items-center justify-center group"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-w-32 max-h-16 object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}