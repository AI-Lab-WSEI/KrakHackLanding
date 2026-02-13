import { motion } from 'motion/react';
import { Heart, Users, Lightbulb, Trophy, Mail, CheckCircle } from 'lucide-react';

export function MentorSection() {
  const benefits = [
    'Dziel się swoją wiedzą i doświadczeniem z pasjonatami AI',
    'Buduj swoją markę osobistą w społeczności tech',
    'Poznaj najnowsze trendy i innowacyjne podejścia do AI',
    'Networking z innymi ekspertami i uczestnikami',
    'Satysfakcja z pomagania rozwijać talenty',
    'Certyfikat mentora AI Krak Hack'
  ];

  const responsibilities = [
    {
      icon: Users,
      title: 'Wsparcie zespołu',
      description: 'Prowadzenie 1-2 zespołów przez cały hackathon'
    },
    {
      icon: Lightbulb,
      title: 'Konsultacje techniczne',
      description: 'Pomoc w rozwiązywaniu problemów i podejmowaniu decyzji'
    },
    {
      icon: Trophy,
      title: 'Motywacja',
      description: 'Inspirowanie uczestników do osiągania najlepszych rezultatów'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black" id="zostanMentorem">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
            Zostań <span className="text-pink-400">Mentorem</span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-pink-400 to-purple-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Podziel się swoją wiedzą i doświadczeniem, inspiruj następne pokolenie ekspertów AI
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-12">
          {/* Responsibilities */}
          <div className="grid md:grid-cols-3 gap-8">
            {responsibilities.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-pink-500/10 to-purple-600/10 rounded-2xl border border-pink-500/30 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-xl h-full">
                <Heart className="w-16 h-16 text-pink-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-6">Dlaczego warto zostać mentorem?</h3>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-pink-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-xl h-full">
                <h3 className="text-2xl font-bold text-white mb-4">Wymagania</h3>
                <ul className="space-y-3 mb-8 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400">•</span>
                    <span>Doświadczenie w pracy z AI/ML (min. 2 lata)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400">•</span>
                    <span>Umiejętność pracy z zespołem i komunikatywność</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400">•</span>
                    <span>Dostępność podczas hackathonu (29-31 maja)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400">•</span>
                    <span>Chęć dzielenia się wiedzą i motywowania innych</span>
                  </li>
                </ul>

                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-white">Aplikuj już teraz</h4>
                  <p className="text-gray-400">
                    Chcesz zostać mentorem? Wyślij nam krótką informację o swoim doświadczeniu.
                  </p>
                  
                  <a
                    href="mailto:knai@microsoft.wsei.edu.pl"
                    className="flex items-center gap-4 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
                  >
                    <Mail className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-sm text-gray-400">Email</div>
                      <div className="text-white font-medium">knai@microsoft.wsei.edu.pl</div>
                    </div>
                  </a>

                  <button className="w-full px-8 py-5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-2xl transition-all shadow-xl hover:shadow-pink-500/50 font-black uppercase tracking-widest text-sm">
                    Zgłoś się jako mentor
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
