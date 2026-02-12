import { motion } from 'motion/react';
import { CheckCircle, Mail, Phone, Building2 } from 'lucide-react';

export function SponsorSection() {
  const benefits = [
    'Ekspozycja marki podczas wydarzenia i w mediach społecznościowych',
    'Logo na materiałach promocyjnych i stronie wydarzenia',
    'Bezpośredni dostęp do najlepszych talentów AI',
    'Możliwość prezentacji firm i rekrutacji uczestników',
    'Branding przestrzeni hackathonu',
    'Networking z innymi liderami branży tech'
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900" id="zostanSponsorom">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Zostań <span className="text-cyan-400">Sponsorem</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Wspieraj rozwój społeczności AI i buduj markę swojej firmy wśród najlepszych talentów
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-8 rounded-2xl border border-cyan-500/30">
                <Building2 className="w-16 h-16 text-cyan-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-6">Korzyści dla sponsorów</h3>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
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
              className="space-y-6"
            >
              <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-6">Skontaktuj się z nami</h3>
                <p className="text-gray-400 mb-8">
                  Zainteresowany sponsoringiem? Skontaktuj się z nami, aby omówić szczegóły pakietów sponsorskich.
                </p>
                
                <div className="space-y-4">
                  <a
                    href="mailto:sponsors@aipossibilitieslab.com"
                    className="flex items-center gap-4 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
                  >
                    <Mail className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-sm text-gray-400">Email</div>
                      <div className="text-white font-medium">sponsors@aipossibilitieslab.com</div>
                    </div>
                  </a>

                  <a
                    href="tel:+48123456789"
                    className="flex items-center gap-4 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
                  >
                    <Phone className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-sm text-gray-400">Telefon</div>
                      <div className="text-white font-medium">+48 123 456 789</div>
                    </div>
                  </a>
                </div>

                <button className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50 font-semibold">
                  Pobierz prezentację dla sponsorów
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
