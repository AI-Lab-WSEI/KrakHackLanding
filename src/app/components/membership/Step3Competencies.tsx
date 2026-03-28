import type { MembershipFormData, CompetencyProfile } from '@/types/membership';
import { COMPETENCY_LABELS } from '@/types/membership';
import { CompetencyRadarChart } from './CompetencyRadarChart';

interface Step3Props {
  data: MembershipFormData;
  onChange: (updates: Partial<MembershipFormData>) => void;
}

export function Step3Competencies({ data, onChange }: Step3Props) {
  const handleCompetencyChange = (key: keyof CompetencyProfile, value: number) => {
    onChange({
      competencies: { ...data.competencies, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-400 text-sm">
        Oceń swoje kompetencje w skali 1-10. Nie przejmuj się niskimi wynikami — szukamy różnorodności, nie perfekcji!
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sliders */}
        <div className="flex-1 space-y-5">
          {(Object.keys(COMPETENCY_LABELS) as (keyof CompetencyProfile)[]).map((key) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">
                  {COMPETENCY_LABELS[key]}
                </label>
                <span className="text-cyan-400 font-bold text-lg w-8 text-right">
                  {data.competencies[key]}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={data.competencies[key]}
                onChange={(e) => handleCompetencyChange(key, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          ))}
        </div>

        {/* Radar Chart */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full">
            <h3 className="text-center text-sm font-medium text-gray-400 mb-2">Twój profil kompetencji</h3>
            <CompetencyRadarChart competencies={data.competencies} size={280} />
          </div>
        </div>
      </div>
    </div>
  );
}
