import { useParams, useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Globe, Shield, Terminal, Zap, CheckCircle } from 'lucide-react';
import { FileDownload } from '@/app/components/FileDownload';
import { editions } from '@/data/editions';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';

export function TaskDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [dynamicResources, setDynamicResources] = useState<{materials?: string, task?: string} | null>(null);
  
  // Find which edition/challenge this slug belongs to
  const edition2026 = editions['2026'];
  const slugIdMap: Record<string, string> = {
    'infrasruktura': 'geospatial',
    'asystent': 'process-automation',
    'urban-analytics': 'real-time-analytics'
  };
  
  const challengeId = slugIdMap[slug || ''] || slug;
  const challenge = edition2026.challenges?.find(c => c.id === challengeId);

  const defaultLinks: Record<string, {materials: string}> = {
    'process-automation': {
      materials: 'https://res.cloudinary.com/dyux0lw71/image/upload/v1774013122/Process_Mining_Preparation_Materials_av7ijw.pdf'
    },
    'geospatial': {
      materials: 'https://res.cloudinary.com/dyux0lw71/image/upload/v1774013122/Smart_Infrastructure_Challenge_Materials_lwxd0z.pdf'
    }
  };

  useEffect(() => {
    if (challengeId) {
      // 1. Try to fetch from API
      fetch(`/api/config/challenge_resources`)
        .then(res => res.json())
        .then(data => {
          if (data && data[challengeId]) {
            setDynamicResources(data[challengeId]);
          } else if (defaultLinks[challengeId]) {
            // 2. Fallback to hardcoded defaults if not in DB
            setDynamicResources(defaultLinks[challengeId]);
          }
        })
        .catch(err => {
          console.error('Failed to fetch challenge resources:', err);
          // 3. Fallback to hardcoded defaults on error
          if (defaultLinks[challengeId]) {
            setDynamicResources(defaultLinks[challengeId]);
          }
        });
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
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-12 backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10 uppercase font-black tracking-wider text-[10px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Powrót do bazy
          </Link>

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
              className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight leading-tight"
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
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider text-cyan-400"
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
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-3xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Icon className="w-32 h-32" />
               </div>
               
               <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-3">
                 <Terminal className="w-6 h-6 text-cyan-500" />
                 Opis Wyzwania
               </h2>
               
               <div className="prose prose-lg prose-invert max-w-none text-gray-200 font-medium leading-relaxed">
                  {challenge.fullDescription.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-6 last:mb-0">
                      {paragraph.startsWith('**') ? (
                        <strong className="text-white block mt-8 mb-4 tracking-wider">{paragraph.replace(/\*\*/g, '')}</strong>
                      ) : paragraph}
                    </p>
                  ))}
               </div>
            </div>

            {/* Deliverables */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-3xl">
               <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-8 flex items-center gap-3">
                 <CheckCircle className="w-6 h-6 text-green-500" />
                 Sugerowane Rezultaty
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
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 opacity-90" />
               <div className="relative z-10 space-y-6">
                 <h2 className="text-xl font-black uppercase tracking-widest text-white">Materiały Misji</h2>
                 <p className="text-gray-300 font-medium text-sm">Pobierz dokumentację i zbiory danych przygotowane przez naszych ekspertów.</p>
                 
                 <div className="space-y-4">
                   <FileDownload
                     fileName={`${slug}_materialy.pdf`}
                     fileTitle="Zestaw Startowy"
                     fileDescription="PDF • 2.4 MB"
                     externalUrl={dynamicResources?.materials}
                     unlockDate={new Date('2026-03-20T18:00:00')}
                     fileSize="2.4 MB"
                   />
                   <FileDownload
                     fileName={`${slug}_zadanie.pdf`}
                     fileTitle="Pobierz paczkę zadań"
                      expiryDate={new Date('2026-03-28T18:00:00')}
                     fileDescription="PDF • 1.2 MB"
                     externalUrl={dynamicResources?.task}
                     unlockDate={new Date('2026-03-27T18:00:00')}
                     fileSize="1.2 MB"
                    />
                    <FileDownload
                      fileName={`${slug}_rozwiazanie`}
                      fileTitle="Wyślij rozwiązanie"
                      fileDescription="Link do folderu Google Drive"
                      externalUrl="https://drive.google.com/drive/u/0/folders/1Ezwc0q3JuOy0L1a35Z-zjlcOGNV-Wc6l"
                      unlockDate={new Date('2026-03-28T18:00:00')}
                      fileSize="Folder Cloud"
                   />
                 </div>
               </div>
            </div>

          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}