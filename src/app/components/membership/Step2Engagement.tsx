import type { MembershipFormData } from '@/types/membership';

interface Step2Props {
  data: MembershipFormData;
  onChange: (updates: Partial<MembershipFormData>) => void;
}

export function Step2Engagement({ data, onChange }: Step2Props) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <label
          className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors"
        >
          <input
            type="checkbox"
            checked={data.attendMeetings}
            onChange={(e) => onChange({ attendMeetings: e.target.checked })}
            className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
          />
          <div>
            <p className="text-white font-medium">Deklaruję uczestnictwo w spotkaniach koła *</p>
            <p className="text-gray-400 text-sm mt-1">Regularne spotkania odbywają się co 1-2 tygodnie</p>
          </div>
        </label>

        <label
          className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors"
        >
          <input
            type="checkbox"
            checked={data.attendInPerson}
            onChange={(e) => onChange({ attendInPerson: e.target.checked })}
            className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
          />
          <div>
            <p className="text-white font-medium">Deklaruję możliwość uczestnictwa stacjonarnie</p>
            <p className="text-gray-400 text-sm mt-1">Spotkania na żywo w siedzibie WSEI w Krakowie</p>
          </div>
        </label>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Ile godzin <span className="text-cyan-400">miesięcznie</span> chcesz przeznaczyć na działalność koła?
        </label>
        <div className="px-2">
          <input
            type="range"
            min={1}
            max={40}
            value={data.monthlyHours}
            onChange={(e) => onChange({ monthlyHours: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1h</span>
            <span>10h</span>
            <span>20h</span>
            <span>30h</span>
            <span>40h</span>
          </div>
        </div>
        <div className="text-center">
          <span className="inline-block px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 text-2xl font-bold">
            {data.monthlyHours}h
          </span>
          <p className="text-gray-400 text-sm mt-2">
            {data.monthlyHours <= 5 ? 'Lekkie zaangażowanie — idealne na start' :
             data.monthlyHours <= 15 ? 'Umiarkowane zaangażowanie — świetny balans' :
             data.monthlyHours <= 25 ? 'Duże zaangażowanie — moc sprawcza!' :
             'Hardcore — jesteś maszyną! 🚀'}
          </p>
        </div>
      </div>
    </div>
  );
}
