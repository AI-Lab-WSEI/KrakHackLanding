import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ChevronDown, MapPin, Workflow, Code, Zap, ArrowRight } from 'lucide-react';
import { Challenge } from '@/types/edition';

interface ChallengesSectionProps {
  challenges: Challenge[];
}

const iconMap = {
  MapPin,
  Workflow,
  Code,
  Zap,
};

export function ChallengesSection({ challenges }: ChallengesSectionProps) {
  const navigate = useNavigate();

  const handleChallengeClick = (challengeId: string) => {
    const slugMap: { [key: string]: string } = {
      'geospatial': 'tramwaje',
      'process-automation': 'asystent'
    };
    const slug = slugMap[challengeId] || challengeId;
    navigate(`/zadania/${slug}`);
  };

  return (
    <section id="wyzwania" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
            Wyzwania AI Krak Hack 2026
          </h2>
          <div className="w-24 h-2 bg-gradient-to-r from-cyan-400 to-blue-600 mx-auto mb-8 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Dwa główne wyzwania czekają na uczestników. Wybierz swój track i stwórz rozwiązanie, które zmieni przyszłość krakowskiej infrastruktury.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {challenges.map((challenge, index) => {
            const Icon = iconMap[challenge.icon as keyof typeof iconMap] || Code;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative group"
                onClick={() => handleChallengeClick(challenge.id)}
              >
                {/* Challenge Card */}
                <div
                  className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl cursor-pointer transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_60px_rgba(6,182,212,0.2)] hover:scale-[1.02] p-10"
                >
                  {/* Status Badge */}
                  <div className="absolute top-8 right-8">
                    <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                       <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Active Track</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`
                    w-20 h-20 rounded-2xl bg-gradient-to-br ${challenge.color} 
                    flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform duration-500
                  `}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-3xl font-black text-white mb-3 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                    {challenge.title}
                  </h3>
                  <p className="text-cyan-400 font-bold mb-6 text-sm uppercase tracking-widest">
                    {challenge.subtitle}
                  </p>
                  <p className="text-gray-400 leading-relaxed mb-8 text-lg font-medium">
                    {challenge.shortDescription}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-3 mb-10">
                    {challenge.technologies.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-4 py-2 bg-white/5 text-gray-400 text-xs font-bold rounded-xl border border-white/5 uppercase tracking-tighter"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Improved Navigation Tooltip Style Button */}
                  <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-cyan-400 font-black uppercase tracking-widest text-[11px] group-hover:bg-cyan-500 group-hover:text-black transition-all">
                    <span>ZOBACZ WIĘCEJ DETALI ZADANIA</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-20"
        >
          <a
            href="/forms"
            className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl transition-all shadow-2xl hover:shadow-cyan-500/50 font-black uppercase tracking-widest"
          >
            <span>Zgłoś się do hackathonu</span>
            <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}