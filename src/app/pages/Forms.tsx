import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Users, GraduationCap, Building, ArrowLeft } from 'lucide-react';
import { ParticipantForm } from '@/app/components/ParticipantForm';
import { MentorForm } from '@/app/components/MentorForm';
import { CompanyForm } from '@/app/components/CompanyForm';

type FormType = 'participant' | 'mentor' | 'company';

export function Forms() {
  const [activeForm, setActiveForm] = useState<FormType>('participant');

  const formTypes = [
    {
      id: 'participant' as FormType,
      title: 'Uczestnik',
      description: 'Zgłoś się jako uczestnik hackathonu',
      icon: Users,
      color: 'from-cyan-500 to-blue-600',
      hoverColor: 'hover:from-cyan-400 hover:to-blue-500'
    },
    {
      id: 'mentor' as FormType,
      title: 'Mentor',
      description: 'Zostań mentorem i wspieraj uczestników',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-600',
      hoverColor: 'hover:from-purple-400 hover:to-pink-500'
    },
    {
      id: 'company' as FormType,
      title: 'Partner/Sponsor',
      description: 'Współpracuj z nami jako firma',
      icon: Building,
      color: 'from-green-500 to-emerald-600',
      hoverColor: 'hover:from-green-400 hover:to-emerald-500'
    }
  ];

  const renderForm = () => {
    switch (activeForm) {
      case 'participant':
        return <ParticipantForm />;
      case 'mentor':
        return <MentorForm />;
      case 'company':
        return <CompanyForm />;
      default:
        return <ParticipantForm />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <section className="pt-24 pb-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8 backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10 uppercase font-black tracking-wider text-[10px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Powrót do bazy
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Dołącz do AI Krak Hack 2026
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Wybierz swoją rolę i wypełnij odpowiedni formularz, aby dołączyć do największego hackathonu AI w Krakowie
            </p>
          </motion.div>

          {/* Form Type Selector */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {formTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeForm === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveForm(type.id)}
                  className={`
                    flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 min-w-[200px]
                    ${isActive 
                      ? `bg-gradient-to-r ${type.color} text-white shadow-lg transform scale-105` 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold">{type.title}</div>
                    <div className="text-sm opacity-80">{type.description}</div>
                  </div>
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Form Content */}
      <motion.div
        key={activeForm}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderForm()}
      </motion.div>

      {/* Info Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dla Uczestników</h3>
              <p className="text-gray-300">
                Rozwijaj swoje umiejętności AI, pracuj w zespole nad realnym projektem i zdobądź cenne doświadczenie
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dla Mentorów</h3>
              <p className="text-gray-300">
                Dziel się swoją wiedzą, wspieraj młode talenty i buduj społeczność AI w Polsce
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dla Firm</h3>
              <p className="text-gray-300">
                Znajdź talenty, promuj swoją markę i wspieraj rozwój ekosystemu AI w regionie
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}