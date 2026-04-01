import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { BridgeLink } from '@/app/components/BridgeLink';
import { Footer } from '@/app/components/Footer';

interface Collaboration {
  id: number;
  slug: string;
  partner: string;
  partner_full: string;
  partner_logo: string;
  tagline: string;
  description: string;
  full_content: string[];
  outcomes: string[];
  color: string;
}

export function CollaborationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [collab, setCollab] = useState<Collaboration | null>(null);
  const [allCollabs, setAllCollabs] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);

  const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';

  useEffect(() => {
    if (!slug) { navigate('/o-nas'); return; }
    Promise.all([
      fetch(`${apiBase}/api/collaborations/${slug}`).then(r => r.ok ? r.json() : null),
      fetch(`${apiBase}/api/collaborations`).then(r => r.ok ? r.json() : []),
    ]).then(([detail, all]) => {
      if (!detail) { navigate('/o-nas'); return; }
      setCollab(detail);
      setAllCollabs(all);
    }).catch(() => navigate('/o-nas'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">Ładowanie...</div>;
  if (!collab) return null;

  const currentIdx = allCollabs.findIndex((c) => c.slug === collab.slug);
  const prevCollab = currentIdx > 0 ? allCollabs[currentIdx - 1] : undefined;
  const nextCollab = currentIdx < allCollabs.length - 1 ? allCollabs[currentIdx + 1] : undefined;

  return (
    <div className="min-h-screen bg-black relative">
      {prevCollab && (
        <Link to={`/wspolpraca/${prevCollab.slug}`}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-white/10 hover:border-cyan-500/30 transition-all group"
          title={prevCollab.partner}>
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
      )}
      {nextCollab && (
        <Link to={`/wspolpraca/${nextCollab.slug}`}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-white/10 hover:border-cyan-500/30 transition-all group"
          title={nextCollab.partner}>
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/assets/marble-texture.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br ${collab.color} opacity-10 rounded-full blur-[120px]`} />
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/o-nas" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8 text-sm">
            <ChevronLeft className="w-4 h-4" /> Wróć do "O nas"
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-400 uppercase tracking-widest">Współpraca</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              AI Possibilities Lab{' '}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${collab.color}`}>
                × {collab.partner}
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mt-4">{collab.tagline}</p>
          </motion.div>
        </div>
      </section>

      {/* Bridge */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <BridgeLink
              leftLabel="AI Possibilities Lab"
              rightLabel={collab.partner_full}
              leftDescription="Wiedza, społeczność i innowacyjne podejście"
              rightDescription="Realne wyzwania, dane i potrzeby biznesowe"
              color={collab.color}
              size="lg"
            />
          </div>
        </div>
      </section>

      {/* Full Content */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {collab.full_content.map((paragraph, idx) => (
              <motion.p key={idx} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="text-gray-300 text-lg leading-relaxed mb-6">
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="text-white font-bold mb-4">Dostarczona wartość</h3>
              <ul className="space-y-3">
                {collab.outcomes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <Check className="w-5 h-5 shrink-0 mt-0.5 text-cyan-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Chcesz współpracować?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Szukamy partnerów do wspólnych projektów. Skontaktuj się z nami lub wypełnij formularz.
            </p>
            <Link to="/kontakt"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-500/20">
              Nawiąż współpracę
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
