import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Lock, Clock } from 'lucide-react';

interface FileDownloadProps {
  fileName: string;
  fileTitle: string;
  fileDescription: string;
  unlockDate?: Date;
  fileSize?: string;
  externalUrl?: string;
}

export function FileDownload({
  fileName,
  fileTitle,
  fileDescription,
  unlockDate,
  fileSize = '1.5 MB',
  externalUrl
}: FileDownloadProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!unlockDate) {
      setIsUnlocked(true);
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      if (now >= unlockDate) {
        setIsUnlocked(true);
        clearInterval(timer);
      } else {
        const diff = unlockDate.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let timeString = '';
        if (days > 0) {
          timeString += `${days} ${days === 1 ? 'dzień' : 'dni'} `;
        }
        if (hours > 0 || days > 0) { // Show hours if days exist or hours are present
          timeString += `${hours}h `;
        }
        timeString += `${minutes}min`;
        if (days === 0 && hours === 0) { // Only show seconds if it's less than an hour
          timeString += ` ${seconds}s`;
        }
        setTimeLeft(timeString.trim());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [unlockDate]);

  const handleDownload = () => {
    if (!isUnlocked) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }

    if (externalUrl) {
      window.open(externalUrl, '_blank');
      return;
    }

    // Simulate download for internal files
    const link = document.createElement('a');
    link.href = `/files/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowTooltip(false);
      }}
      onClick={handleDownload}
      className={`
        relative p-6 rounded-xl cursor-pointer transition-all duration-300 min-h-[280px] flex flex-col
        ${isUnlocked
          ? 'bg-card/60 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/20'
          : 'bg-card/40 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50'
        }
      `}
    >
      {/* File Icon */}
      <div className="relative flex justify-center mb-6">
        <div className={`
          relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
          ${isUnlocked
            ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30'
            : 'bg-gradient-to-br from-purple-500/20 to-gray-500/20 border border-gray-400/30'
          }
        `}>
          <FileText className={`w-10 h-10 ${isUnlocked ? 'text-cyan-400' : 'text-gray-400'}`} />

          {/* Lock overlay for locked files */}
          {!isUnlocked && (
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-2 border-background">
              <Lock className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Download overlay for unlocked files on hover */}
          {isUnlocked && isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-cyan-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
            >
              <Download className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 text-center">
        <h3 className="text-lg font-bold text-foreground mb-2">{fileTitle}</h3>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{fileDescription}</p>

        <div className="space-y-2">
          <p className={`text-sm font-medium ${isUnlocked ? 'text-cyan-400' : 'text-muted-foreground'}`}>
            {fileSize}
          </p>

          {!isUnlocked && unlockDate && (
            <div className="space-y-1">
              <p className="text-xs text-purple-400 font-medium">
                Odblokowanie: {unlockDate.toLocaleDateString('pl-PL')} {unlockDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      {isUnlocked ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full"
        >
          Dostępne
        </motion.div>
      ) : (
        <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500/80 text-white text-xs font-bold rounded-full">
          Zablokowane
        </div>
      )}

      {/* Tooltip for locked files */}
      {(showTooltip || (isHovered && !isUnlocked)) && isUnlocked === false && timeLeft && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-card border border-purple-500/50 rounded-xl p-4 min-w-[200px] text-center shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <p className="text-sm text-muted-foreground">Do odblokowania pozostało:</p>
            </div>
            <p className="text-cyan-400 font-bold">{timeLeft}</p>

            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-purple-500/50" />
          </div>
        </motion.div>
      )}

      {/* Locked overlay effect */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 rounded-xl pointer-events-none" />
      )}
    </motion.div>
  );
}