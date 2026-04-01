import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Linkedin, Mail, MessageSquare, ChevronLeft, Building2, ExternalLink } from 'lucide-react';
import { OrgContactForm } from '@/app/components/OrgContactForm';
import { Footer } from '@/app/components/Footer';

interface OrgSettings {
  linkedinUrl?: string;
  contactEmail?: string;
  contactPhones?: string[];
}

export function ContactPage() {
  const [settings, setSettings] = useState<OrgSettings>({});

  useEffect(() => {
    const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
    fetch(`${apiBase}/api/config/org_settings`)
      .then(r => r.json())
      .then(d => { if (d && typeof d === 'object') setSettings(d); })
      .catch(() => {});
  }, []);

  const linkedinUrl = settings.linkedinUrl || 'https://www.linkedin.com/company/ai-possibilities-lab/';
  const contactEmail = settings.contactEmail || 'knai@wsei.edu.pl';

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500 opacity-10 rounded-full blur-[120px]" />
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-8 text-sm">
            <ChevronLeft className="w-4 h-4" /> Strona główna
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Skontaktuj się z nami</h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Chcesz nawiązać współpracę z AI Possibilities Lab? Napisz do nas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact methods */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
            {/* LinkedIn */}
            <motion.a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] hover:border-blue-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Linkedin className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-1">LinkedIn</h3>
              <p className="text-gray-500 text-sm mb-3">Napisz do nas na LinkedIn</p>
              <span className="text-blue-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Otwórz profil <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </motion.a>

            {/* Email */}
            <motion.a
              href={`mailto:${contactEmail}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] hover:border-purple-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-bold mb-1">Email</h3>
              <p className="text-gray-500 text-sm mb-3">Napisz bezpośrednio</p>
              <span className="text-purple-400 text-sm font-medium">{contactEmail}</span>
            </motion.a>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Formularz kontaktowy</h2>
                <p className="text-gray-500 text-sm">Dla organizacji zainteresowanych współpracą</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <OrgContactForm />
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
