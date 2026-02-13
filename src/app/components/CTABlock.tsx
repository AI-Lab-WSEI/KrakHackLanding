import { motion } from 'motion/react';
import { ArrowRight, Mail, Handshake } from 'lucide-react';

interface CTABlockProps {
  ctaUrl: string;
  showSecondary?: boolean;
}

export function CTABlock({ ctaUrl, showSecondary = true }: CTABlockProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-black via-purple-950/20 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Large Logo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex justify-center lg:justify-start"
            >
              <img 
                src="https://res.cloudinary.com/dyux0lw71/image/upload/v1770832103/ai-krak-hack-central_frj1yg.svg"
                alt="AI Krak Hack 2026"
                className="w-full max-w-lg h-auto opacity-90"
              />
            </motion.div>

            {/* Right side - CTA Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center lg:text-left"
            >
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                Gotowy na wyzwanie?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl">
                Dołącz do społeczności pasjonatów AI i rozwijaj swoje umiejętności w praktyce podczas największego hackathonu AI w Krakowie!
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start lg:justify-start justify-center gap-4">
                {ctaUrl && (
                  <a
                    href={ctaUrl}
                    className="group px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl transition-all shadow-xl hover:shadow-cyan-500/50 flex items-center gap-2 text-lg font-black uppercase tracking-widest"
                  >
                    <span>Zgłoś się teraz</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}

                {showSecondary && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="mailto:knai@microsoft.wsei.edu.pl"
                      className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 flex items-center gap-2 backdrop-blur-sm uppercase font-black tracking-wider text-[11px]"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Zostań sponsorem</span>
                    </a>
                    <a
                      href="mailto:knai@microsoft.wsei.edu.pl"
                      className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 flex items-center gap-2 backdrop-blur-sm uppercase font-black tracking-wider text-[11px]"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Zostań mentorem</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
