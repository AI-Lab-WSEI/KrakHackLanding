import type { MembershipFormData } from '@/types/membership';

interface Step4Props {
  data: MembershipFormData;
  onChange: (updates: Partial<MembershipFormData>) => void;
}

export function Step4Motivations({ data, onChange }: Step4Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Co możesz wnieść do naszego koła?
        </label>
        <textarea
          value={data.whatYouBring}
          onChange={(e) => onChange({ whatYouBring: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          placeholder="Opowiedz o swoich umiejętnościach, doświadczeniach, pomysłach..."
        />
        <p className="text-xs text-gray-500 mt-1 text-right">{data.whatYouBring.length} znaków</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Czego oczekujesz od członkostwa?
        </label>
        <textarea
          value={data.expectations}
          onChange={(e) => onChange({ expectations: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          placeholder="Czego chciałbyś/chciałabyś się nauczyć? Jakie doświadczenia zdobyć?"
        />
        <p className="text-xs text-gray-500 mt-1 text-right">{data.expectations.length} znaków</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Które z naszych wartości są dla Ciebie najbardziej przekonujące?
        </label>
        <textarea
          value={data.valuesResonance}
          onChange={(e) => onChange({ valuesResonance: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          placeholder="Nawiąż do wartości prezentowanych na naszej stronie 'O nas'..."
        />
        <p className="text-xs text-gray-500 mt-1 text-right">{data.valuesResonance.length} znaków</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Skąd się o nas dowiedziałeś/aś? <span className="text-gray-500 font-normal">(opcjonalne)</span>
        </label>
        <select
          value={data.howDidYouHear || ''}
          onChange={(e) => onChange({ howDidYouHear: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
        >
          <option value="" className="bg-gray-900">— wybierz —</option>
          <option value="social_media" className="bg-gray-900">Media społecznościowe (Instagram, LinkedIn, Facebook)</option>
          <option value="uczelnia" className="bg-gray-900">Ogłoszenie na uczelni / od wykładowcy</option>
          <option value="znajomy" className="bg-gray-900">Polecenie znajomego / kolegi</option>
          <option value="wydarzenie" className="bg-gray-900">Inne wydarzenie / konferencja</option>
          <option value="google" className="bg-gray-900">Google / wyszukiwarka</option>
          <option value="newsletter" className="bg-gray-900">Newsletter / mailing</option>
          <option value="inne" className="bg-gray-900">Inne</option>
        </select>
      </div>
    </div>
  );
}
