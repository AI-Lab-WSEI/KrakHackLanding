import type { MembershipFormData } from '@/types/membership';
import { YEAR_OPTIONS } from '@/types/membership';

interface Step1Props {
  data: MembershipFormData;
  onChange: (updates: Partial<MembershipFormData>) => void;
}

export function Step1BasicInfo({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Imię *</label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="Twoje imię"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nazwisko *</label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="Twoje nazwisko"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          placeholder="twoj@email.pl"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Uczelnia</label>
        <input
          type="text"
          value={data.university}
          onChange={(e) => onChange({ university: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          placeholder="np. WSEI, AGH, UJ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Kierunek studiów / zawód</label>
        <input
          type="text"
          value={data.fieldOfStudy}
          onChange={(e) => onChange({ fieldOfStudy: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          placeholder="np. Informatyka, Data Science..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Rok studiów / status</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {YEAR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ yearOrStatus: opt.value })}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                data.yearOrStatus === opt.value
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discord + ClickUp — opcjonalne, mocno rekomendowane. */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex items-start gap-2 mb-4">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full mt-1">
            Rekomendowane
          </span>
          <div>
            <p className="text-sm font-medium text-gray-300">Integracje</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Nieobowiązkowe, ale bez tego będziemy musieli dopytać później. Jak zaprosimy Cię do koła
              — te dane używamy do dodania Cię do naszego serwera Discord i workspace ClickUp.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nazwa na Discordzie <span className="text-gray-500 font-normal">(np. <code className="text-cyan-400">janek.kowalski</code> albo <code className="text-cyan-400">janek#1234</code>)</span>
            </label>
            <input
              type="text"
              value={data.discordUsername ?? ''}
              onChange={(e) => onChange({ discordUsername: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="twoja-nazwa-discord"
              autoComplete="off"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Ustawienia Discorda → "Mój profil" → skopiuj nazwę użytkownika.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email dla ClickUp <span className="text-gray-500 font-normal">(jeśli inny niż powyżej)</span>
            </label>
            <input
              type="email"
              value={data.clickupEmail ?? ''}
              onChange={(e) => onChange({ clickupEmail: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder={data.email || 'adres@clickup.pl'}
              autoComplete="off"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Adres, na który wyślemy zaproszenie do workspace ClickUp. Zostaw puste jeśli jest taki sam jak email powyżej.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
