import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, Star, Send, MessageSquare, Target, Calendar } from 'lucide-react';

// Flexible event model — easy to extend with future events
interface SurveyEvent {
  id: string;
  name: string;
  date: string;
  active: boolean; // show in dropdown
}

const EVENTS: SurveyEvent[] = [
  {
    id: 'ai-krak-hack-2026',
    name: 'AI Krak Hack 2026',
    date: '27-28 marca 2026',
    active: true, // Active until end of April 2026
  },
  // ─── Dodaj przyszłe wydarzenia tutaj ───
  // {
  //   id: 'workshop-may-2026',
  //   name: 'Warsztat AI — Maj 2026',
  //   date: 'Maj 2026',
  //   active: false,
  // },
];

// Default event — auto-selected in the current timeframe
function getDefaultEvent(): string {
  const now = new Date();
  // AI Krak Hack 2026 is default until end of April 2026
  if (now <= new Date('2026-04-30T23:59:59')) {
    return 'ai-krak-hack-2026';
  }
  return '';
}

export function Survey() {
  const activeEvents = EVENTS.filter((e) => e.active);
  const [formData, setFormData] = useState({
    rating: 0,
    event: getDefaultEvent(),
    pros: '',
    cons: '',
    challenge: '',
    futureInterests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const selectedEvent = EVENTS.find((e) => e.id === formData.event);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.event) {
      setError('Wybierz wydarzenie, w którym brałeś/aś udział.');
      return;
    }
    if (formData.rating === 0) {
      setError('Oceń wydarzenie (1-5).');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
      const response = await fetch(`${apiBase}/api/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { ...formData, submittedAt: new Date().toISOString() } }),
      });

      if (response.status === 429) {
        const data = await response.json();
        setError(data.error || 'Ankieta została już wysłana. Spróbuj ponownie później.');
        return;
      }
      if (!response.ok) throw new Error('Błąd serwera');
      setSubmitted(true);
    } catch (err) {
      setError('Wystąpił błąd podczas wysyłania ankiety. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <Send className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">DZIĘKUJEMY ZA FEEDBACK!</h1>
          <p className="text-gray-400 mb-8 max-w-md">Twoja opinia pomoże nam zorganizować jeszcze lepszą edycję w przyszłym roku.</p>
          <Link to="/" className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-bold uppercase tracking-widest text-xs">
            Powrót do strony głównej
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-12 transition-colors uppercase font-black text-[10px] tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Powrót
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase italic">Ankieta Satysfakcji</h1>
          <p className="text-gray-400 mb-12 leading-relaxed">Chcielibyśmy poznać Twoją opinię na temat wydarzenia, abyśmy mogli się rozwijać.</p>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Event Selection — REQUIRED */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] text-orange-400">
                <Calendar className="w-4 h-4" /> W którym wydarzeniu brałeś/aś udział? *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {activeEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, event: event.id })}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      formData.event === event.id
                        ? 'bg-orange-500/15 border-orange-500 shadow-lg shadow-orange-500/10'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-white">{event.name}</div>
                    <div className="text-sm text-gray-400">{event.date}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] text-cyan-400">
                <Star className="w-4 h-4" /> Jak oceniasz wydarzenie? *
              </label>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all border ${
                      formData.rating >= star
                        ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] text-green-400">
                  <MessageSquare className="w-4 h-4" /> Co było na plus?
                </label>
                <textarea
                  value={formData.pros}
                  onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-1 focus:ring-cyan-500 outline-none min-h-[120px] transition-all text-white"
                  placeholder="Atmosfera, jedzenie, zadania..."
                />
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] text-red-400">
                  <MessageSquare className="w-4 h-4" /> Co do poprawy?
                </label>
                <textarea
                  value={formData.cons}
                  onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-1 focus:ring-cyan-500 outline-none min-h-[120px] transition-all text-white"
                  placeholder="Kolejki, prąd, wifi..."
                />
              </div>
            </div>

            {/* Challenge */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] text-purple-400">
                <Target className="w-4 h-4" /> Które wyzwanie wybrałeś/aś?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormData({ ...formData, challenge: 'geospatial' })}
                  className={`p-3 rounded-xl border text-left text-sm transition-all ${formData.challenge === 'geospatial' ? 'bg-purple-500/15 border-purple-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                  <span className="text-white font-medium">Smart Infrastructure</span>
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, challenge: 'process-automation' })}
                  className={`p-3 rounded-xl border text-left text-sm transition-all ${formData.challenge === 'process-automation' ? 'bg-purple-500/15 border-purple-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                  <span className="text-white font-medium">Process Automation</span>
                </button>
              </div>
            </div>

            {/* Future interests */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] text-cyan-400">
                Co chciałbyś zobaczyć w przyszłości?
              </label>
              <textarea
                value={formData.futureInterests}
                onChange={(e) => setFormData({ ...formData, futureInterests: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-1 focus:ring-cyan-500 outline-none min-h-[100px] transition-all text-white"
                placeholder="Tematy, format, sugestie..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || formData.rating === 0 || !formData.event}
              className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:grayscale"
            >
              {isSubmitting ? 'Wysyłanie...' : 'Wyślij opinię'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
