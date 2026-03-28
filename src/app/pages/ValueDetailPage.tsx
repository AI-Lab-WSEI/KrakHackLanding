import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Check } from 'lucide-react';
import { getValueBySlug, VALUES } from '@/data/values';
import { BridgeLink } from '@/app/components/BridgeLink';
import { Footer } from '@/app/components/Footer';

export function ValueDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const value = slug ? getValueBySlug(slug) : undefined;

  if (!value) {
    navigate('/o-nas');
    return null;
  }

  const currentIdx = VALUES.findIndex((v) => v.id === value.id);
  const prevValue = currentIdx > 0 ? VALUES[currentIdx - 1] : undefined;
  const nextValue = currentIdx < VALUES.length - 1 ? VALUES[currentIdx + 1] : undefined;

  return (
    <div className="min-h-screen bg-black relative">
      {/* Fixed prev/next buttons — centered vertically */}
      {prevValue && (
        <Link
          to={`/o-nas/${prevValue.id}`}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-white/10 hover:border-cyan-500/30 transition-all group"
          title={prevValue.title}
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
      )}
      {nextValue && (
        <Link
          to={`/o-nas/${nextValue.id}`}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-white/10 hover:border-cyan-500/30 transition-all group"
          title={nextValue.title}
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/assets/marble-texture.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br ${value.color} opacity-10 rounded-full blur-[120px]`} />

        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/o-nas"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Wróć do "O nas"
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} items-center justify-center mb-6 shadow-lg`}>
              <value.icon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{value.title}</h1>
            <p className="text-xl text-gray-400 max-w-2xl">{value.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Bridge: Lewo ← [animated pulse + logo] → Prawo */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-center text-sm font-bold uppercase tracking-widest text-gray-500 mb-10">
              Kogo z czym łączymy?
            </h2>
            <BridgeLink
              leftLabel={value.linkLeft.label}
              rightLabel={value.linkRight.label}
              leftDescription={value.linkLeft.description}
              rightDescription={value.linkRight.description}
              color={value.color}
              size="lg"
            />
          </motion.div>
        </div>
      </section>

      {/* Full Content */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {value.fullContent.map((paragraph, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-gray-300 text-lg leading-relaxed mb-6"
              >
                {paragraph}
              </motion.p>
            ))}

            {/* Highlights */}
            {value.highlights && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-10 p-6 bg-white/5 border border-white/10 rounded-2xl"
              >
                <h3 className="text-white font-bold mb-4">Co konkretnie oferujemy?</h3>
                <ul className="space-y-3">
                  {value.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <Check className="w-5 h-5 shrink-0 mt-0.5 text-cyan-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Companies Section — only for firmy-rekruterzy */}
      {value.companies && value.companies.length > 0 && (
        <section className="py-16 bg-gray-950">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-3">Firmy partnerskie</h2>
              <p className="text-gray-400">Z tymi firmami współpracujemy lub planujemy współpracę</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {value.companies.map((company, idx) => (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all"
                >
                  <h3 className="text-xl font-bold text-white mb-3">{company.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{company.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* External Link */}
      {value.externalLink && (
        <section className="py-8 bg-gray-950">
          <div className="container mx-auto px-4 text-center">
            <Link
              to={value.externalLink.url}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg"
            >
              {value.externalLink.label}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Zainteresowany/a?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Wypełnij formularz zgłoszeniowy — skontaktujemy się z Tobą i opowiemy więcej.
            </p>
            <Link
              to="/dolacz"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-500/20"
            >
              Dołącz do nas
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
