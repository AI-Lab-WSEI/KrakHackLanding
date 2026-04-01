import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Building2, User, Mail, MessageSquare, CheckCircle } from 'lucide-react';

interface OrgContactData {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  howToCollaborate: string;
}

export function OrgContactForm() {
  const [formData, setFormData] = useState<OrgContactData>({
    organizationName: '', firstName: '', lastName: '', email: '', howToCollaborate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.firstName || !formData.email || !formData.howToCollaborate) {
      setError('Proszę wypełnić wymagane pola.');
      return;
    }
    setIsSubmitting(true);
    try {
      const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
      const res = await fetch(`${apiBase}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'org_contact', data: formData }),
      });
      if (!res.ok) throw new Error('Błąd wysyłania');
      setSubmitted(true);
    } catch {
      setError('Nie udało się wysłać formularza. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="p-8 bg-white/5 border border-green-500/20 rounded-2xl text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Wiadomość wysłana!</h3>
        <p className="text-gray-400">Odezwiemy się jak najszybciej. Dziękujemy za zainteresowanie współpracą.</p>
      </motion.div>
    );
  }

  const inputClass = 'w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-600';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 block">
            Imię <span className="text-red-400">*</span>
          </label>
          <input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
            className={inputClass} placeholder="Jan" required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 block">Nazwisko</label>
          <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
            className={inputClass} placeholder="Kowalski" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 block">Organizacja</label>
          <input type="text" value={formData.organizationName} onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
            className={inputClass} placeholder="Nazwa firmy / uczelni / organizacji" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 block">
            Email <span className="text-red-400">*</span>
          </label>
          <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
            className={inputClass} placeholder="jan@firma.pl" required />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-1 block">
          Jak chciałbyś/chciałabyś współpracować? <span className="text-red-400">*</span>
        </label>
        <textarea value={formData.howToCollaborate} onChange={e => setFormData({ ...formData, howToCollaborate: e.target.value })}
          className={`${inputClass} resize-none`} rows={4}
          placeholder="Opisz krótko pomysł na współpracę — np. sponsor, dane, mentoring, patronat..." required />
      </div>

      {error && (
        <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">{error}</div>
      )}

      <button type="submit" disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-400 hover:to-pink-400 transition-all disabled:opacity-50">
        <Send className="w-4 h-4" />
        {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
      </button>
    </form>
  );
}
