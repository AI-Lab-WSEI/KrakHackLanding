import { motion } from 'motion/react';

interface CollaborationBridgeProps {
  partnerName: string;
  partnerLogo: string;
  color: string;
  size?: 'sm' | 'lg';
}

/**
 * Collaboration bridge: [AI Possibilities Lab logo] ←pulse→ [Partner logo]
 */
export function CollaborationBridge({ partnerName, partnerLogo, color, size = 'sm' }: CollaborationBridgeProps) {
  const isLarge = size === 'lg';
  const circleSize = isLarge ? 'w-20 h-20' : 'w-10 h-10';
  const imgSize = isLarge ? 'w-12 h-12' : 'w-6 h-6';
  const lineWidth = isLarge ? 'w-16' : 'w-8';
  const lineHeight = isLarge ? 'h-1' : 'h-[3px]';

  const pulseTransition = {
    duration: 3.5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  return (
    <div className="flex items-center justify-center gap-0">
      {/* AI Possibilities Lab logo */}
      <div className="flex flex-col items-center gap-1.5">
        <div className={`relative ${circleSize} shrink-0`}>
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${color}`}
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.08, 0.25] }}
            transition={pulseTransition}
          />
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} p-[2px]`}>
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dyux0lw71/image/upload/v1770831902/ai-possibilities-lab-logo_v0flns.svg"
                alt="AI Possibilities Lab"
                className={imgSize}
              />
            </div>
          </div>
        </div>
        {isLarge && <span className="text-xs text-gray-500 font-medium">AI Possibilities Lab</span>}
      </div>

      {/* Animated pulse line */}
      <div className={`relative overflow-hidden rounded-full ${lineWidth} ${lineHeight} mx-1`}>
        <div className="absolute inset-0 bg-white/8 rounded-full" />
        <motion.div
          className={`absolute inset-y-0 rounded-full bg-gradient-to-r ${color}`}
          style={{ width: '35%' }}
          animate={{ left: ['-35%', '135%'] }}
          transition={pulseTransition}
        />
      </div>

      {/* × symbol */}
      <span className={`${isLarge ? 'text-2xl' : 'text-sm'} font-bold text-transparent bg-clip-text bg-gradient-to-r ${color} mx-1`}>×</span>

      {/* Animated pulse line */}
      <div className={`relative overflow-hidden rounded-full ${lineWidth} ${lineHeight} mx-1`}>
        <div className="absolute inset-0 bg-white/8 rounded-full" />
        <motion.div
          className={`absolute inset-y-0 rounded-full bg-gradient-to-l ${color}`}
          style={{ width: '35%' }}
          animate={{ right: ['-35%', '135%'] }}
          transition={{ ...pulseTransition, delay: 1.75 }}
        />
      </div>

      {/* Partner logo */}
      <div className="flex flex-col items-center gap-1.5">
        <div className={`relative ${circleSize} shrink-0`}>
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${color}`}
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.08, 0.25] }}
            transition={{ ...pulseTransition, delay: 1.75 }}
          />
          <div className={`absolute inset-0 rounded-full bg-white/10 border border-white/20 p-[2px]`}>
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={partnerLogo}
                alt={partnerName}
                className={`${imgSize} object-contain`}
              />
            </div>
          </div>
        </div>
        {isLarge && <span className="text-xs text-gray-500 font-medium">{partnerName}</span>}
      </div>
    </div>
  );
}
