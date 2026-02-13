import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { FAQ } from '@/types/edition';

interface ProgramProps {
  title: string;
  description: string;
  faqs?: FAQ[];
}

export function Program({ title, description, faqs }: ProgramProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="program" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">{title}</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-600 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </motion.div>

        {faqs && faqs.length > 0 && (
          <div className="max-w-3xl mx-auto mt-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Najczęściej zadawane pytania</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-cyan-500/30 transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/70 transition-colors"
                  >
                    <span className="font-semibold text-white pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-cyan-400 flex-shrink-0 transition-transform ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-4 pt-2 text-gray-300 leading-relaxed border-t border-gray-700">
                      {faq.answer}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
