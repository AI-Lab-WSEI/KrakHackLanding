import { motion } from 'motion/react';
import { TimelineStep } from '@/types/edition';
import { Calendar } from 'lucide-react';

interface TimelineProps {
  steps: TimelineStep[];
  title?: string;
}

export function Timeline({ steps, title = 'Harmonogram' }: TimelineProps) {
  return (
    <section id="harmonogram" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">{title}</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-600 mx-auto rounded-full"></div>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-pink-500 to-cyan-500"></div>

            {steps.map((step, index) => {
              const isLeft = index % 2 === 0;
              const colorClass = step.color === 'cyan' ? 'from-cyan-500 to-blue-500' : 'from-pink-500 to-purple-500';
              const borderColor = step.color === 'cyan' ? 'border-cyan-500' : 'border-pink-500';

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-center mb-12 md:mb-20 ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className={`w-full md:w-5/12 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className={`bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 border-l-4 ${borderColor} hover:bg-white/10 transition-all shadow-xl`}>
                      <div className="flex items-start gap-4 mb-4">
                        <Calendar className={`w-6 h-6 mt-1 ${step.color === 'cyan' ? 'text-cyan-400' : 'text-blue-400'}`} />
                        <div>
                          <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight">{step.title}</h3>
                          <p className={`text-sm font-black uppercase tracking-widest ${step.color === 'cyan' ? 'text-cyan-400' : 'text-blue-400'}`}>
                            {step.dateRange}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-400 font-medium leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${colorClass} ring-4 ring-gray-900`}></div>
                  </div>

                  {/* Empty space for alternating layout */}
                  <div className="hidden md:block w-5/12"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
