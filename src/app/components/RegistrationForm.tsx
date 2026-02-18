import { motion } from 'motion/react';
import { Users, GraduationCap, Building, ArrowRight } from 'lucide-react';

export function RegistrationForm() {
  const formTypes = [
    {
      title: 'Uczestnik',
      description: 'Zgłoś się jako uczestnik hackathonu AI',
      icon: Users,
      color: 'from-cyan-500 to-blue-600',
      hoverColor: 'hover:from-cyan-400 hover:to-blue-500',
      link: '/forms?type=participant'
    },
    {
      title: 'Mentor',
      description: 'Zostań mentorem i wspieraj uczestników',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-600',
      hoverColor: 'hover:from-purple-400 hover:to-pink-500',
      link: '/forms?type=mentor'
    },
    {
      title: 'Partner/Sponsor',
      description: 'Współpracuj z nami jako firma',
      icon: Building,
      color: 'from-green-500 to-emerald-600',
      hoverColor: 'hover:from-green-400 hover:to-emerald-500',
      link: '/forms?type=company'
    }
  ];

  return (
    <section id="zgloszenie" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Dołącz do nas</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Wybierz swoją rolę i wypełnij odpowiedni formularz, aby dołączyć do AI Krak Hack 2026
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {formTypes.map((type, index) => {
            const Icon = type.icon;
            
            return (
              <motion.a
                key={type.title}
                href={type.link}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`
                  group block p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 
                  hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105
                `}
              >
                <div className="text-center">
                  <div className={`
                    w-16 h-16 bg-gradient-to-r ${type.color} rounded-full flex items-center justify-center mx-auto mb-6
                    group-hover:shadow-lg transition-all duration-300
                  `}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">{type.title}</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{type.description}</p>
                  
                  <div className={`
                    inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${type.color} 
                    ${type.hoverColor} text-white rounded-lg transition-all duration-300 
                    group-hover:shadow-lg font-semibold
                  `}>
                    <span>Wypełnij formularz</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-gray-400">
            Wszystkie dane będą przetwarzane zgodnie z RODO. Skontaktujemy się z Tobą z dalszymi informacjami.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
