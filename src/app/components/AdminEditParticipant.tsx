import { useState, useEffect } from 'react';
import { X, Save, Users } from 'lucide-react';
import { getAdminToken } from '@/lib/adminApi';

interface ParticipantData {
  id: string;
  name: string;
  email: string;
  type: string;
  fullData: Record<string, any>;
}

interface AdminEditParticipantProps {
  participant: ParticipantData;
  existingTeams: string[];
  onClose: () => void;
  onSaved: () => void;
}

export function AdminEditParticipant({ participant, existingTeams, onClose, onSaved }: AdminEditParticipantProps) {
  const d = participant.fullData || {};
  const [formData, setFormData] = useState({
    firstName: d.firstName || '',
    lastName: d.lastName || '',
    email: d.email || participant.email || '',
    phone: d.phone || d.phoneNumber || '',
    university: d.university || '',
    studyField: d.studyField || '',
    yearOfStudy: d.yearOfStudy || '',
    teamName: d.teamName || '',
    discordUsername: d.discordUsername || '',
    discordInviteLink: d.discordInviteLink || '',
    experience: d.experience || '',
    motivation: d.motivation || '',
    dietaryRestrictions: d.dietaryRestrictions || '',
    additionalNotes: d.additionalNotes || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showTeamSuggestions, setShowTeamSuggestions] = useState(false);

  const filteredTeams = existingTeams.filter(
    (t) => t.toLowerCase().includes(formData.teamName.toLowerCase()) && t !== formData.teamName
  );

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
      // Update submission data via PATCH
      const res = await fetch(`${apiBase}/api/submissions/${participant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          data: { ...d, ...formData },
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Błąd zapisu');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors";
  const labelClass = "text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1 block";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-950 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-950 border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-lg font-bold text-white">Edytuj: {participant.name}</h2>
            <p className="text-xs text-gray-500">{participant.email} · ID: {participant.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Imię</label>
              <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nazwisko</label>
              <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefon</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass} />
            </div>
          </div>

          {/* Team — with autocomplete from existing teams */}
          <div className="relative">
            <label className={labelClass}>
              <Users className="w-3 h-3 inline mr-1" />
              Zespół
            </label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => { setFormData({ ...formData, teamName: e.target.value }); setShowTeamSuggestions(true); }}
              onFocus={() => setShowTeamSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTeamSuggestions(false), 200)}
              className={`${inputClass} border-cyan-500/30`}
              placeholder="Wpisz lub wybierz istniejący zespół..."
            />
            {showTeamSuggestions && filteredTeams.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-xl max-h-40 overflow-y-auto">
                {filteredTeams.map((team) => (
                  <button
                    key={team}
                    type="button"
                    onMouseDown={() => { setFormData({ ...formData, teamName: team }); setShowTeamSuggestions(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-cyan-400 transition-colors"
                  >
                    {team}
                  </button>
                ))}
              </div>
            )}
            {!formData.teamName && (
              <p className="text-[10px] text-yellow-400/70 mt-1">⚠ Brak zespołu</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Discord nick</label>
              <input type="text" value={formData.discordUsername} onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
                className={inputClass} placeholder="nick#1234" />
            </div>
            <div>
              <label className={labelClass}>Discord link</label>
              <input type="text" value={formData.discordInviteLink} onChange={(e) => setFormData({ ...formData, discordInviteLink: e.target.value })}
                className={inputClass} placeholder="https://discord.gg/..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Uczelnia</label>
              <input type="text" value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Kierunek</label>
              <input type="text" value={formData.studyField} onChange={(e) => setFormData({ ...formData, studyField: e.target.value })}
                className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Rok studiów</label>
              <select value={formData.yearOfStudy} onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                className={inputClass}>
                <option value="" className="bg-gray-900">—</option>
                <option value="1" className="bg-gray-900">1 rok</option>
                <option value="2" className="bg-gray-900">2 rok</option>
                <option value="3" className="bg-gray-900">3 rok</option>
                <option value="master1" className="bg-gray-900">Magisterskie</option>
                <option value="doctoral" className="bg-gray-900">Doktoranckie</option>
                <option value="working" className="bg-gray-900">Pracuje zawodowo</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Dieta</label>
              <input type="text" value={formData.dietaryRestrictions} onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notatki</label>
            <textarea value={formData.additionalNotes} onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              className={`${inputClass} resize-none`} rows={2} />
          </div>

          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-950 border-t border-white/10 px-6 py-4 flex items-center justify-end gap-3 rounded-b-3xl">
          <button onClick={onClose} className="px-5 py-2.5 bg-white/5 text-gray-400 rounded-xl text-sm font-medium hover:bg-white/10">
            Anuluj
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4" />
            {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>
    </div>
  );
}
