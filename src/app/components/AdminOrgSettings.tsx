import { useState, useEffect } from 'react';
import { getAdminToken } from './AdminAuth';
import { motion } from 'motion/react';
import { Settings, Save, Plus, X, Linkedin, Mail, Phone, MapPin, Globe, MessageCircle } from 'lucide-react';

interface OrgSettingsData {
  linkedinUrl: string;
  contactEmail: string;
  contactPhones: string[];
  location: string;
  discordInviteUrl: string;
  githubUrl: string;
  websiteUrl: string;
}

const DEFAULT_SETTINGS: OrgSettingsData = {
  linkedinUrl: 'https://www.linkedin.com/company/ai-possibilities-lab/',
  contactEmail: 'knai@wsei.edu.pl',
  contactPhones: ['+48 662 974 402', '+48 690 459 531'],
  location: 'Kraków, Polska',
  discordInviteUrl: '',
  githubUrl: '',
  websiteUrl: '',
};

export function AdminOrgSettings() {
  const [settings, setSettings] = useState<OrgSettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';

  useEffect(() => {
    fetch(`${apiBase}/api/config/org_settings`)
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getAdminToken();
      const res = await fetch(`${apiBase}/api/config/org_settings`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: settings }),
      });
      if (!res.ok) throw new Error();
      setStatus({ type: 'success', msg: 'Ustawienia zapisane' });
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus({ type: 'error', msg: 'Błąd zapisu' });
    } finally {
      setSaving(false);
    }
  };

  const updatePhone = (idx: number, value: string) => {
    const phones = [...settings.contactPhones];
    phones[idx] = value;
    setSettings({ ...settings, contactPhones: phones });
  };

  const addPhone = () => setSettings({ ...settings, contactPhones: [...settings.contactPhones, ''] });
  const removePhone = (idx: number) => {
    const phones = settings.contactPhones.filter((_, i) => i !== idx);
    setSettings({ ...settings, contactPhones: phones.length > 0 ? phones : [''] });
  };

  if (loading) return <div className="text-center text-gray-500 py-12">Ładowanie ustawień...</div>;

  const inputClass = 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 transition-colors';
  const labelClass = 'text-xs font-bold uppercase text-gray-500 mb-1.5 flex items-center gap-2';

  return (
    <motion.div key="org_settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
          <Settings className="w-5 h-5 text-purple-400" /> Ustawienia organizacji
        </h2>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold hover:bg-purple-500/30 transition-all disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Zapisywanie...' : 'Zapisz'}
        </button>
      </div>

      {status && (
        <div className={`p-3 rounded-xl text-sm font-bold text-center ${status.type === 'success' ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
          {status.msg}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
        <h3 className="text-sm font-black uppercase text-gray-400 border-b border-white/5 pb-2">Dane kontaktowe</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}><Mail className="w-3.5 h-3.5" /> Email kontaktowy</label>
            <input value={settings.contactEmail} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
              className={inputClass} placeholder="email@organizacja.pl" />
          </div>
          <div>
            <label className={labelClass}><MapPin className="w-3.5 h-3.5" /> Lokalizacja</label>
            <input value={settings.location} onChange={e => setSettings({ ...settings, location: e.target.value })}
              className={inputClass} placeholder="Kraków, Polska" />
          </div>
        </div>

        <div>
          <label className={labelClass}><Phone className="w-3.5 h-3.5" /> Telefony</label>
          {settings.contactPhones.map((phone, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={phone} onChange={e => updatePhone(i, e.target.value)}
                className={`${inputClass} flex-1`} placeholder="+48 xxx xxx xxx" />
              <button onClick={() => removePhone(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={addPhone} className="text-xs text-purple-400 hover:text-purple-300 font-bold">+ Dodaj telefon</button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
        <h3 className="text-sm font-black uppercase text-gray-400 border-b border-white/5 pb-2">Social media</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}><Linkedin className="w-3.5 h-3.5" /> LinkedIn URL</label>
            <input value={settings.linkedinUrl} onChange={e => setSettings({ ...settings, linkedinUrl: e.target.value })}
              className={inputClass} placeholder="https://linkedin.com/company/..." />
          </div>
          <div>
            <label className={labelClass}><Globe className="w-3.5 h-3.5" /> Strona WWW</label>
            <input value={settings.websiteUrl} onChange={e => setSettings({ ...settings, websiteUrl: e.target.value })}
              className={inputClass} placeholder="https://ai.possibilitieslab.org" />
          </div>
          <div>
            <label className={labelClass}><MessageCircle className="w-3.5 h-3.5" /> Discord (link zaproszenia)</label>
            <input value={settings.discordInviteUrl} onChange={e => setSettings({ ...settings, discordInviteUrl: e.target.value })}
              className={inputClass} placeholder="https://discord.gg/..." />
          </div>
          <div>
            <label className={labelClass}><Globe className="w-3.5 h-3.5" /> GitHub URL</label>
            <input value={settings.githubUrl} onChange={e => setSettings({ ...settings, githubUrl: e.target.value })}
              className={inputClass} placeholder="https://github.com/..." />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center">
        Te ustawienia są używane na stronie kontaktowej i w stopce strony.
      </p>
    </motion.div>
  );
}
