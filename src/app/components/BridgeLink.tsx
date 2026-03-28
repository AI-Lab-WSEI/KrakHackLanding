import { motion } from 'motion/react';

interface BridgeLinkProps {
  leftLabel: string;
  rightLabel: string;
  leftDescription?: string;
  rightDescription?: string;
  color: string;
  size?: 'sm' | 'lg';
}

/**
 * Shared bridge: Left ←[animated pulse + logo]→ Right
 * - sm: used in value cards on AboutPage (compact, fixed height)
 * - lg: used in detail pages (full width with descriptions)
 */
export function BridgeLink({ leftLabel, rightLabel, leftDescription, rightDescription, color, size = 'sm' }: BridgeLinkProps) {
  const isLarge = size === 'lg';

  // Shared slow sync animation config
  const pulseTransition = {
    duration: 3.5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  return (
    <div className="flex items-center w-full">
      {/* Left label */}
      <div className={`${isLarge
        ? 'flex-1 p-6 bg-white/5 border border-white/10 rounded-2xl text-right min-h-[90px] flex flex-col justify-center'
        : 'w-[72px] h-[36px] flex items-center justify-end text-right'
      }`}>
        <div>
          <span className={`font-medium leading-tight ${isLarge ? 'text-white text-lg' : 'text-gray-400 text-[10px] block'}`}>
            {leftLabel}
          </span>
          {leftDescription && isLarge && (
            <p className="text-gray-500 text-sm mt-1">{leftDescription}</p>
          )}
        </div>
      </div>

      {/* Center — animated gradient pulse + logo */}
      <div className={`flex items-center shrink-0 ${isLarge ? 'mx-3' : 'mx-2'}`}>
        {/* Left pulse line */}
        <div className={`relative overflow-hidden rounded-full ${isLarge ? 'w-12 h-1' : 'w-6 h-[3px]'}`}>
          <div className="absolute inset-0 bg-white/8 rounded-full" />
          <motion.div
            className={`absolute inset-y-0 rounded-full bg-gradient-to-r ${color}`}
            style={{ width: '40%' }}
            animate={{ left: ['-40%', '140%'] }}
            transition={pulseTransition}
          />
        </div>

        {/* Logo circle with outer pulse */}
        <div className={`relative shrink-0 ${isLarge ? 'w-20 h-20' : 'w-10 h-10'}`}>
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${color}`}
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.08, 0.25] }}
            transition={{ ...pulseTransition, duration: 3.5 }}
          />
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} ${isLarge ? 'p-[2px]' : 'p-[1.5px]'}`}>
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dyux0lw71/image/upload/v1770831902/ai-possibilities-lab-logo_v0flns.svg"
                alt=""
                className={isLarge ? 'w-10 h-10' : 'w-5 h-5'}
              />
            </div>
          </div>
        </div>

        {/* Right pulse line */}
        <div className={`relative overflow-hidden rounded-full ${isLarge ? 'w-12 h-1' : 'w-6 h-[3px]'}`}>
          <div className="absolute inset-0 bg-white/8 rounded-full" />
          <motion.div
            className={`absolute inset-y-0 rounded-full bg-gradient-to-l ${color}`}
            style={{ width: '40%' }}
            animate={{ right: ['-40%', '140%'] }}
            transition={pulseTransition}
          />
        </div>
      </div>

      {/* Right label */}
      <div className={`${isLarge
        ? 'flex-1 p-6 bg-white/5 border border-white/10 rounded-2xl text-left min-h-[90px] flex flex-col justify-center'
        : 'w-[72px] h-[36px] flex items-center text-left'
      }`}>
        <div>
          <span className={`font-medium leading-tight ${isLarge ? 'text-white text-lg' : 'text-gray-400 text-[10px] block'}`}>
            {rightLabel}
          </span>
          {rightDescription && isLarge && (
            <p className="text-gray-500 text-sm mt-1">{rightDescription}</p>
          )}
        </div>
      </div>
    </div>
  );
}
