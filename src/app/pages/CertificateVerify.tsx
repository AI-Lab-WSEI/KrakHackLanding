import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Search, ShieldCheck, ArrowRight } from 'lucide-react';

export function CertificateVerify() {
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = () => {
    const cleaned = hash.trim().toLowerCase();
    if (!cleaned) {
      setError('Wpisz hash certyfikatu');
      return;
    }
    if (!/^[a-f0-9]{16,64}$/.test(cleaned)) {
      setError('Nieprawidlowy format hash — oczekiwany ciag znakow hex');
      return;
    }
    navigate(`/verify/${cleaned}`);
  };

  return (
    <div className="min-h-screen bg-[#030213] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg w-full text-center"
      >
        {/* Logo / Header */}
        <div className="mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-3">
            Weryfikacja Certyfikatu
          </h1>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Sprawdz autentycznosc certyfikatu wydanego przez AI Krak Hack 2026.
            Wpisz hash weryfikacyjny z certyfikatu.
          </p>
        </div>

        {/* Input */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={hash}
              onChange={e => { setHash(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="Wpisz hash certyfikatu (np. a1b2c3d4e5f6...)"
              className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 rounded-2xl text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs font-bold"
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={handleVerify}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-500/20"
          >
            Zweryfikuj certyfikat
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 space-y-3 text-left">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Jak to dziala?</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Kazdy certyfikat AI Krak Hack jest podpisany kryptograficznie za pomoca HMAC-SHA256.
              Unikalny hash generowany jest z danych certyfikatu i klucza serwera, co gwarantuje
              autentycznosc i integralnosc dokumentu. Nie mozna podrabiac certyfikatow bez dostepu
              do klucza kryptograficznego.
            </p>
          </div>
        </div>

        {/* Footer link */}
        <div className="mt-8 text-gray-600 text-xs">
          <a href="/" className="hover:text-cyan-400 transition-colors">
            &larr; Wroc do strony AI Krak Hack 2026
          </a>
        </div>
      </motion.div>
    </div>
  );
}
