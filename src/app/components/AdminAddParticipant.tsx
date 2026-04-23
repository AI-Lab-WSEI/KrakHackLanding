import { useState } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { getAdminToken } from '@/lib/adminApi';

interface AdminAddParticipantProps {
  onClose: () => void;
  onAdded: () => void;
}

const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'SQL', 'Git',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'Data Analysis', 'React', 'Node.js', 'Docker', 'Cloud',
];

export function AdminAddParticipant({ onClose, onAdded }: AdminAddParticipantProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: '',
    studyField: '',
    yearOfStudy: '',
    teamName: '',
    skills: [] as string[],
    experience: '',
    motivation: '',
    dietaryRestrictions: '',
    additionalNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Imię, nazwisko i email są wymagane.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
      const res = await fetch(`${apiBase}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          type: 'participant',
          data: {
            ...formData,
            acceptRules: true,
            addedByAdmin: true,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Błąd dodawania');
      }

      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors";
  const labelClass = "text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1 block";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-950 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-950 border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Dodaj uczestnika ręcznie</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Imię *</label>
              <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={inputClass} placeholder="Jan" />
            </div>
            <div>
              <label className={labelClass}>Nazwisko *</label>
              <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={inputClass} placeholder="Kowalski" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass} placeholder="jan@email.pl" />
            </div>
            <div>
              <label className={labelClass}>Telefon</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass} placeholder="+48 123 456 789" />
            </div>
          </div>

          {/* University + Study */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Uczelnia</label>
              <input type="text" value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className={inputClass} placeholder="WSEI, AGH, UJ..." />
            </div>
            <div>
              <label className={labelClass}>Kierunek</label>
              <input type="text" value={formData.studyField} onChange={(e) => setFormData({ ...formData, studyField: e.target.value })}
                className={inputClass} placeholder="Informatyka" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Rok studiów</label>
              <select value={formData.yearOfStudy} onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                className={inputClass}>
                <option value="" className="bg-gray-900">Wybierz...</option>
                <option value="1" className="bg-gray-900">1 rok</option>
                <option value="2" className="bg-gray-900">2 rok</option>
                <option value="3" className="bg-gray-900">3 rok</option>
                <option value="master1" className="bg-gray-900">Magisterskie</option>
                <option value="doctoral" className="bg-gray-900">Doktoranckie</option>
                <option value="working" className="bg-gray-900">Pracuje zawodowo</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Zespół</label>
              <input type="text" value={formData.teamName} onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                className={inputClass} placeholder="Nazwa zespołu" />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className={labelClass}>Umiejętności</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    formData.skills.includes(skill)
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Text fields */}
          <div>
            <label className={labelClass}>Doświadczenie</label>
            <textarea value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className={`${inputClass} resize-none`} rows={2} placeholder="Opis doświadczenia..." />
          </div>
          <div>
            <label className={labelClass}>Motywacja</label>
            <textarea value={formData.motivation} onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              className={`${inputClass} resize-none`} rows={2} placeholder="Dlaczego chce wziąć udział..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Dieta</label>
              <input type="text" value={formData.dietaryRestrictions} onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                className={inputClass} placeholder="Wegetariańska, bezglutenowa..." />
            </div>
            <div>
              <label className={labelClass}>Dodatkowe notatki</label>
              <input type="text" value={formData.additionalNotes} onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                className={inputClass} placeholder="Uwagi..." />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-950 border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3 rounded-b-3xl">
          <button onClick={onClose}
            className="px-5 py-2.5 bg-white/5 text-gray-400 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            Anuluj
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Dodawanie...' : 'Dodaj uczestnika'}
          </button>
        </div>
      </div>
    </div>
  );
}
