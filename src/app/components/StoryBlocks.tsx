import { motion } from 'motion/react';
import { StoryBlock } from '@/types/edition';

interface StoryBlocksProps {
  blocks: StoryBlock[];
}

export function StoryBlocks({ blocks }: StoryBlocksProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Historia wydarzenia</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto"></div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {blocks.map((block, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-xl border-l-4 border-cyan-500/50"
            >
              {block.title && (
                <h3 className="text-2xl font-bold text-white mb-4">{block.title}</h3>
              )}
              <p className="text-gray-300 leading-relaxed text-lg">{block.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
