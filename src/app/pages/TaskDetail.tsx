import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, Globe, Shield, Terminal, Zap, CheckCircle } from 'lucide-react';
import { FileDownload } from '@/app/components/FileDownload';
import { editions } from '@/data/editions';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';

export function TaskDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [dynamicExternalUrl, setDynamicExternalUrl] = useState<string | null>(null);
  
  // Find which edition/challenge this slug belongs to
  const edition2026 = editions['2026'];
  const slugIdMap: Record<string, string> = {
    'tramwaje': 'geospatial',
    'asystent': 'process-automation'
  };
  
  const challengeId = slugIdMap[slug || ''] || slug;
  const challenge = edition2026.challenges?.find(c => c.id === challengeId);

  useEffect(() => {
    if (challengeId) {
      const storedLinks = localStorage.getItem('challenge-external-links-v1');
      if (storedLinks) {
        const links = JSON.parse(storedLinks);
        if (links[challengeId]) {
          setDynamicExternalUrl(links[challengeId]);
        }
      }
    }
  }, [challengeId]);

  if (!challenge) {
    navigate('/');
    return null;
  }

  const icons = {
    'MapPin': Globe,
    'Workflow': Terminal,
    'Code': Terminal,
    'Zap': Zap,
    'Shield': Shield
  };

  const Icon = icons[challenge.icon as keyof typeof icons] || Terminal;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
      <Header />
      
      {/* Hero-like Header Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.button
            onClick={() => navigate('/')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors mb-12 uppercase font-black tracking-widest text-[10px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Powrót do bazy
          </motion.button>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${challenge.color} shadow-2xl mb-8`}
            >
              <Icon className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter leading-tight"
            >
              {challenge.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed mb-10"
            >
              {challenge.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {challenge.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-cyan-400"
                >
                  {tech}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-16"
          >
            {/* Description Card */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Icon className="w-32 h-32" />
               </div>
               
               <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-3">
                 <Terminal className="w-6 h-6 text-cyan-500" />
                 Opis Wyzwania
               </h2>
               
               <div className="prose prose-lg prose-invert max-w-none text-gray-400 font-medium leading-relaxed">
                  {challenge.fullDescription.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-6 last:mb-0">
                      {paragraph.startsWith('**') ? (
                        <strong className="text-white block mt-8 mb-4 uppercase tracking-wider">{paragraph.replace(/\*\*/g, '')}</strong>
                      ) : paragraph}
                    </p>
                  ))}
               </div>
            </div>

            {/* Deliverables */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl">
               <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-3">
                 <CheckCircle className="w-6 h-6 text-green-500" />
                 Oczekiwane Rezultaty
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenge.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-cyan-500/30 transition-all">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                      <span className="text-sm font-bold text-gray-300">{item}</span>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            {/* Materials Card */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90" />
               <div className="relative z-10 space-y-6">
                 <h2 className="text-xl font-black uppercase tracking-widest text-white">Materiały Misji</h2>
                 <p className="text-indigo-100/70 font-medium text-sm">Pobierz dokumentację i zbiory danych przygotowane przez naszych ekspertów.</p>
                 
                 <div className="space-y-4">
                   <FileDownload
                     fileName={`${slug}_materialy.pdf`}
                     fileTitle="Zestaw Startowy"
                     fileDescription="PDF • 2.4 MB"
                     unlockDate={new Date('2026-03-20T18:00:00')}
                     fileSize="2.4 MB"
                   />
                   <FileDownload
                     fileName={`${slug}_zadanie.pdf`}
                     fileTitle="Arkusz Zadania"
                     fileDescription="PDF • 1.2 MB"
                     unlockDate={new Date('2026-03-27T16:00:00')}
                     fileSize="1.2 MB"
                   />
                 </div>
               </div>
            </div>

            {/* Quick Link (CMS Glue) */}
            {(dynamicExternalUrl || challenge.externalUrl) && (
              <a 
                href={dynamicExternalUrl || challenge.externalUrl} 
                target="_blank" 
                rel="noreferrer"
                className="block p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:border-cyan-500 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase tracking-widest text-xs text-cyan-400 group-hover:text-white transition-colors">Repozytorium / Zasoby</span>
                  <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
              </a>
            )}
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}