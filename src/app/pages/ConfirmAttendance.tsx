import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Users, ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { getTeamByToken, updateAttendance, Team } from '@/data/attendance';

export function ConfirmAttendance() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<'success' | 'declined' | null>(null);

  useEffect(() => {
    if (!id) return;
    getTeamByToken(id).then(data => {
      setTeam(data);
      setLoading(false);
    });
  }, [id]);

  const handleAction = async (status: 'confirmed' | 'declined') => {
    if (!id) return;
    
    const success = await updateAttendance(id, status);
    if (success) {
      setResult(status === 'confirmed' ? 'success' : 'declined');
    } else {
      alert('Wystąpił błąd podczas zapisywania statusu. Spróbuj ponownie.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
    </div>
  );

  if (!team) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <XCircle className="w-20 h-20 text-red-500 mb-6" />
      <h1 className="text-3xl font-bold text-white mb-4">Nie znaleziono zespołu</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        Link może być nieprawidłowy lub wygasł. Skontaktuj się z organizatorami na Discordzie.
      </p>
      <Link to="/" className="text-cyan-400 hover:underline flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Wróć do strony głównej
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl"
            >
              <div className="flex justify-center mb-8">
                <div className="p-4 bg-cyan-500/20 rounded-2xl">
                  <Users className="w-12 h-12 text-cyan-400" />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-center mb-2 uppercase tracking-tight">
                Potwierdzenie Przyjazdu
              </h1>
              <p className="text-gray-400 text-center mb-10">
                Hej <span className="text-cyan-400 font-bold">{team.team_name}</span>! Potwierdźcie swoją obecność na AI Krak Hack 2026.
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-300">Kiedy?</p>
                    <p className="text-white">27 marca 2026, 18:00 (Start Hackathonu)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-gray-300">Gdzie?</p>
                    <p className="text-white">Kraków, AI Lab WSEI (ul. św. Filipa 17)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAction('confirmed')}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" /> Potwierdzam
                  </button>
                  <button
                    onClick={() => handleAction('declined')}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" /> Nie dotrzemy
                  </button>
                </div>
              </div>
            </motion.div>
          ) : result === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 p-12 rounded-3xl shadow-2xl"
            >
              <div className="mb-8 flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.5)]"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
              </div>
              <h1 className="text-4xl font-black mb-4 uppercase">Dziękujemy!</h1>
              <p className="text-xl text-cyan-100 mb-8">
                Obecność zespołu <span className="font-bold text-white">{team.team_name}</span> została pomyślnie potwierdzona.
              </p>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 mb-8 text-left">
                <p className="text-white font-bold mb-2">Co dalej?</p>
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li>• Sprawdźcie harmonogram na stronie głównej</li>
                  <li>• Upewnijcie się, że macie gotowe środowisko dev</li>
                  <li>• Śledźcie kanał #announcements na Discordzie</li>
                </ul>
              </div>
              <Link to="/" className="inline-flex items-center gap-2 text-cyan-400 font-bold hover:underline">
                <ArrowLeft className="w-4 h-4" /> Wróć do strony głównej
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-gray-900/50 backdrop-blur-xl border border-red-500/30 p-12 rounded-3xl shadow-2xl"
            >
              <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-4">Potwierdzono brak obecności</h1>
              <p className="text-gray-400 mb-8">
                Przykro nam, że zespół <span className="font-bold">{team.team_name}</span> nie dotrze. 
                Dziękujemy za informację - dzięki temu inni będą mogli zająć Wasze miejsce.
              </p>
              <Link to="/" className="text-cyan-400 hover:underline">
                Wróć do strony głównej
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
