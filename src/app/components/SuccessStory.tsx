import { motion } from 'motion/react';
import { SuccessStory as SuccessStoryType } from '@/types/edition';
import { Quote, ExternalLink } from 'lucide-react';

interface SuccessStoryProps {
  story: SuccessStoryType;
}

export function SuccessStory({ story }: SuccessStoryProps) {
  if (!story) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Success Story</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 md:p-12 rounded-2xl border border-gray-700 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {story.imageUrl && (
                <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-cyan-500/30">
                  <img
                    src={story.imageUrl}
                    alt={story.personNameOrAlias}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-grow">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{story.personNameOrAlias}</h3>
                  <p className="text-cyan-400 font-medium mb-3">{story.role}</p>
                  <p className="text-gray-300 leading-relaxed">{story.whatDid}</p>
                </div>

                <div className="bg-black/30 p-6 rounded-lg mb-6 relative">
                  <Quote className="absolute top-4 left-4 w-8 h-8 text-pink-400/30" />
                  <p className="text-lg text-gray-200 leading-relaxed pl-8 italic">
                    "{story.quote}"
                  </p>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 to-pink-500/10 p-6 rounded-lg mb-6 border border-cyan-500/20">
                  <p className="text-green-400 font-semibold mb-1">Efekt:</p>
                  <p className="text-white leading-relaxed">{story.outcome}</p>
                </div>

                {story.links && story.links.length > 0 && (
                  <div className="flex gap-4">
                    {story.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
