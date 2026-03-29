import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Trophy,
  Users,
  Building,
  Calendar,
  Hash,
  ExternalLink,
  Copy,
  ArrowLeft,
  Loader2,
  Fingerprint,
  Check,
  Star,
  ArrowRight,
} from 'lucide-react';
import { TEAMS } from '@/data/teams';
import results from '@/data/results.json';

interface CertificateData {
  participant_name: string;
  team_name: string;
  project_name: string;
  university: string;
  certificate_type: 'participation' | 'winner';
  event_name: string;
  event_dates: string;
  issued_at: string;
  hash: string;
  metadata: Record<string, unknown>;
}

interface VerifyResponse {
  valid: boolean;
  reason?: string;
  certificate?: CertificateData;
}

export function CertificateView() {
  const { hash } = useParams<{ hash: string }>();
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hash) return;
    fetch(`/api/verify/${hash}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => setData({ valid: false, reason: 'error' }))
      .finally(() => setLoading(false));
  }, [hash]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030213] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const cert = data?.certificate;
  const isValid = data?.valid === true && cert;
  const isRevoked = data?.reason === 'revoked';
  const isWinner = cert?.certificate_type === 'winner';

  return (
    <div className="min-h-screen bg-[#030213] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className={`absolute top-1/4 -left-40 w-[500px] h-[500px] rounded-full blur-[150px] ${isValid ? (isWinner ? 'bg-amber-500/15' : 'bg-cyan-500/15') : 'bg-red-500/10'}`} />
        <div className={`absolute bottom-1/4 -right-40 w-[500px] h-[500px] rounded-full blur-[150px] ${isValid ? 'bg-purple-600/15' : 'bg-gray-500/5'}`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-xl w-full"
      >
        {isValid && cert ? (
          /* ─── Valid Certificate ───────────────────────── */
          <div className="space-y-6">
            {/* Verification Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-center"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
                isWinner
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
                  : 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-500/30'
              }`}>
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className={`text-lg font-black uppercase tracking-widest ${isWinner ? 'text-amber-400' : 'text-green-400'}`}>
                {isWinner ? 'Certyfikat Zwyciezcy' : 'Certyfikat Uczestnictwa'}
              </h2>
              <p className="text-green-400/80 text-xs mt-1 flex items-center justify-center gap-1.5">
                <Fingerprint className="w-3 h-3" />
                Podpis kryptograficzny zweryfikowany
              </p>
            </motion.div>

            {/* Certificate Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`bg-white/5 backdrop-blur-md border rounded-3xl overflow-hidden ${
                isWinner ? 'border-amber-500/30' : 'border-white/10'
              }`}
            >
              {/* Card Header */}
              <div className={`px-8 py-6 text-center ${
                isWinner
                  ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border-b border-amber-500/20'
                  : 'bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-b border-white/10'
              }`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Kolo Naukowe AI Possibilities Lab &bull; WSEI Krakow
                </p>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                  {cert.event_name}
                </h1>
                <p className="text-gray-400 text-xs mt-1">{cert.event_dates}</p>
              </div>

              {/* Card Body */}
              <div className="px-8 py-8 space-y-6">
                {/* Type indicator */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    {isWinner ? 'niniejszym potwierdza zwyciestwo' : 'niniejszym potwierdza udzial'}
                  </p>
                </div>

                {/* Participant Name */}
                <div className="text-center">
                  <h2 className={`text-3xl md:text-4xl font-black ${isWinner ? 'text-amber-300' : 'text-white'}`}>
                    {cert.participant_name}
                  </h2>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-3">
                    <Users className={`w-4 h-4 mt-0.5 shrink-0 ${isWinner ? 'text-amber-400' : 'text-cyan-400'}`} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Zespol</p>
                      <p className="text-sm text-white font-bold">{cert.team_name}</p>
                    </div>
                  </div>

                  {cert.project_name && (
                    <div className="flex items-start gap-3">
                      <ExternalLink className={`w-4 h-4 mt-0.5 shrink-0 ${isWinner ? 'text-amber-400' : 'text-cyan-400'}`} />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Projekt</p>
                        <p className="text-sm text-white font-bold">{cert.project_name}</p>
                      </div>
                    </div>
                  )}

                  {cert.university && (
                    <div className="flex items-start gap-3">
                      <Building className={`w-4 h-4 mt-0.5 shrink-0 ${isWinner ? 'text-amber-400' : 'text-cyan-400'}`} />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Uczelnia</p>
                        <p className="text-sm text-white font-bold">{cert.university}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className={`w-4 h-4 mt-0.5 shrink-0 ${isWinner ? 'text-amber-400' : 'text-cyan-400'}`} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Data wydania</p>
                      <p className="text-sm text-white font-bold">
                        {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                  </div>

                  {isWinner && cert.metadata?.placement && (
                    <div className="flex items-start gap-3">
                      <Trophy className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Miejsce</p>
                        <p className="text-sm text-amber-300 font-black">{String(cert.metadata.placement)}</p>
                      </div>
                    </div>
                  )}

                  {isWinner && cert.metadata?.challenge_name && (
                    <div className="flex items-start gap-3">
                      <Trophy className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Wyzwanie</p>
                        <p className="text-sm text-white font-bold">{String(cert.metadata.challenge_name)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Crypto Hash */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Hash weryfikacyjny (HMAC-SHA256)</span>
                  </div>
                  <code className="text-xs font-mono text-indigo-300 break-all block">{cert.hash}</code>
                </div>
              </div>
            </motion.div>

            {/* Actions — unified style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-3"
            >
              <button
                onClick={shareLinkedIn}
                className="px-5 py-3 bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 text-[#0A66C2] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-[#0A66C2]/20"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </button>
              <button
                onClick={copyLink}
                className="px-5 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.05)]"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Skopiowano!' : 'Kopiuj link'}
              </button>
            </motion.div>

            {/* Team project info — extended cert section */}
            {cert && (() => {
              const team = TEAMS.find(t => t.members.some(m =>
                cert.participant_name.toLowerCase().includes(m.split(' ').pop()?.toLowerCase() || '') &&
                cert.participant_name.toLowerCase().includes(m.split(' ')[0]?.toLowerCase() || '')
              ) && t.name.toLowerCase().includes(cert.team_name.toLowerCase().split(' ')[0]) ||
              t.members.some(m => cert.participant_name === m));

              // Try matching by team name directly
              const teamByName = team || TEAMS.find(t =>
                cert.team_name.toLowerCase() === t.name.toLowerCase() ||
                cert.team_name.toLowerCase().includes(t.id.replace(/-/g, ' '))
              );

              const matchedTeam = teamByName;
              if (!matchedTeam) return null;

              // Get scores
              let scores: any = null;
              for (const ch of Object.values(results.challenges)) {
                const r = (ch as any).results?.find((r: any) => r.teamId === matchedTeam.id);
                if (r) { scores = r.scores; break; }
              }
              const sm = results.specialMentions.find(s => s.teamId === matchedTeam.id);
              if (sm && (sm as any).scores) scores = (sm as any).scores;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className={`bg-white/5 backdrop-blur-md border rounded-3xl overflow-hidden mt-4 ${isWinner ? 'border-pink-500/20' : 'border-white/10'}`}
                >
                  <div className="px-6 py-4 border-b border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Projekt zespołu</p>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    {matchedTeam.projectName && (
                      <h3 className="text-lg font-bold text-white">{matchedTeam.projectName}</h3>
                    )}
                    <p className="text-gray-400 text-sm leading-relaxed">{matchedTeam.shortDescription}</p>

                    {/* Key features */}
                    <div className="space-y-2">
                      {matchedTeam.keyFeatures.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                          <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-400" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Scores if available */}
                    {scores && (
                      <div className="bg-white/5 rounded-xl p-4 mt-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ocena jury</span>
                          <span className="text-pink-400 font-black text-lg">{scores.total}/80</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'innovation', label: 'Innowacja' },
                            { key: 'technicalValue', label: 'Technika' },
                            { key: 'usefulness', label: 'Użyteczność' },
                            { key: 'presentationQuality', label: 'Prezentacja' },
                          ].map(cat => (
                            <div key={cat.key} className="flex justify-between text-xs">
                              <span className="text-gray-500">{cat.label}</span>
                              <span className="text-gray-300 font-bold">{scores[cat.key]}/20</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Special mention */}
                    {matchedTeam.specialMention && (
                      <div className="flex items-center gap-2 text-cyan-400 text-xs">
                        <Star className="w-3.5 h-3.5" />
                        <span className="font-medium">{matchedTeam.specialMention}</span>
                      </div>
                    )}

                    {/* Link to team page */}
                    <Link
                      to={`/zespoly/${matchedTeam.id}`}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/8 transition-colors group"
                    >
                      <span className="text-gray-300 text-sm font-medium">Zobacz pełny opis projektu</span>
                      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    </Link>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        ) : (
          /* ─── Invalid / Not Found ─────────────────────── */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg ${
              isRevoked
                ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-red-500/30'
                : 'bg-gradient-to-br from-gray-500 to-gray-600 shadow-gray-500/20'
            }`}>
              {isRevoked ? <ShieldAlert className="w-10 h-10 text-white" /> : <ShieldX className="w-10 h-10 text-white" />}
            </div>

            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
                {isRevoked ? 'Certyfikat cofniety' : 'Certyfikat nie znaleziony'}
              </h2>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                {isRevoked
                  ? 'Ten certyfikat zostal cofniety przez administratora i nie jest juz wazny.'
                  : 'Podany hash nie odpowiada zadnemu certyfikatowi w naszej bazie. Sprawdz poprawnosc wpisanego kodu.'}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-xs mx-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Szukany hash</p>
              <code className="text-xs font-mono text-red-400 break-all">{hash}</code>
            </div>

            <Link
              to="/verify"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Sprobuj ponownie
            </Link>
          </motion.div>
        )}

        {/* CTA Links */}
        {isValid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mt-6"
          >
            <a
              href="https://krakhack.info"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 rounded-2xl text-xs font-bold text-cyan-400 flex items-center gap-2 transition-all justify-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Zobacz AI Krak Hack
            </a>
            <a
              href="https://ai.possibilitieslab.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-2xl text-xs font-bold text-purple-400 flex items-center gap-2 transition-all justify-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Poznaj AI Possibilities Lab
            </a>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center mt-10 text-gray-600 text-xs space-y-2">
          <p>AI Krak Hack 2026 &bull; Kolo Naukowe AI Possibilities Lab &bull; WSEI Krakow</p>
          <a href="/" className="hover:text-cyan-400 transition-colors">
            &larr; Wroc do strony glownej
          </a>
        </div>
      </motion.div>
    </div>
  );
}
