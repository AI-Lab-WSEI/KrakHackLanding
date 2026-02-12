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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto"></div>
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
                    <div className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border-l-4 ${borderColor} hover:bg-gray-800/70 transition-all`}>
                      <div className="flex items-start gap-3 mb-3">
                        <Calendar className={`w-5 h-5 mt-1 ${step.color === 'cyan' ? 'text-cyan-400' : 'text-pink-400'}`} />
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                          <p className={`text-sm font-medium ${step.color === 'cyan' ? 'text-cyan-400' : 'text-pink-400'}`}>
                            {step.dateRange}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{step.description}</p>
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
