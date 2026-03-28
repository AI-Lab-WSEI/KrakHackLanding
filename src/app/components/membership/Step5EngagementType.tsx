import type { MembershipFormData, EngagementType } from '@/types/membership';
import { ENGAGEMENT_TYPE_LABELS } from '@/types/membership';

interface Step5Props {
  data: MembershipFormData;
  onChange: (updates: Partial<MembershipFormData>) => void;
}

export function Step5EngagementType({ data, onChange }: Step5Props) {
  const toggleType = (type: EngagementType) => {
    const current = data.engagementTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ engagementTypes: updated });
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-400 text-sm">
        W jaki sposób chcesz się angażować? Możesz wybrać kilka opcji.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(ENGAGEMENT_TYPE_LABELS) as EngagementType[]).map((type) => {
          const { emoji, title, description } = ENGAGEMENT_TYPE_LABELS[type];
          const isSelected = data.engagementTypes.includes(type);

          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
              }`}
            >
              <div className="text-3xl mb-3">{emoji}</div>
              <h3 className={`font-semibold mb-1 ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                {title}
              </h3>
              <p className="text-sm text-gray-400">{description}</p>
              {isSelected && (
                <div className="mt-3 flex items-center gap-2 text-cyan-400 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Wybrano
                </div>
              )}
            </button>
          );
        })}
      </div>

      {data.engagementTypes.length === 0 && (
        <p className="text-yellow-400/80 text-sm text-center">Wybierz przynajmniej jedną formę zaangażowania</p>
      )}
    </div>
  );
}
