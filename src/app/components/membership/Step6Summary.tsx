import type { MembershipFormData } from '@/types/membership';
import { COMPETENCY_LABELS, ENGAGEMENT_TYPE_LABELS, YEAR_OPTIONS } from '@/types/membership';
import { CompetencyRadarChart } from './CompetencyRadarChart';
import type { CompetencyProfile, EngagementType } from '@/types/membership';

interface Step6Props {
  data: MembershipFormData;
  onGoToStep: (step: number) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

function SectionHeader({ title, step, onEdit }: { title: string; step: number; onEdit: (step: number) => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-white font-semibold">{title}</h3>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
      >
        Edytuj
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{value || '—'}</span>
    </div>
  );
}

export function Step6Summary({ data, onGoToStep, onSubmit, isSubmitting }: Step6Props) {
  const yearLabel = YEAR_OPTIONS.find((o) => o.value === data.yearOrStatus)?.label || data.yearOrStatus;

  return (
    <div className="space-y-6">
      {/* Top CTA — so user knows they still need to submit */}
      {onSubmit && (
        <div className="p-5 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Wszystko się zgadza?</p>
            <p className="text-gray-400 text-sm">Sprawdź dane poniżej i wyślij zgłoszenie.</p>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="shrink-0 px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl text-white font-semibold hover:from-green-400 hover:to-cyan-400 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
          </button>
        </div>
      )}

      <p className="text-gray-400 text-sm">
        Sprawdź swoje odpowiedzi przed wysłaniem. Możesz wrócić do dowolnego kroku i edytować.
      </p>

      {/* Step 1: Basic Info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <SectionHeader title="Podstawowe dane" step={1} onEdit={onGoToStep} />
        <InfoRow label="Imię i nazwisko" value={`${data.firstName} ${data.lastName}`} />
        <InfoRow label="Email" value={data.email} />
        <InfoRow label="Uczelnia" value={data.university} />
        <InfoRow label="Kierunek" value={data.fieldOfStudy} />
        <InfoRow label="Rok / status" value={yearLabel} />
      </div>

      {/* Step 2: Engagement */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <SectionHeader title="Deklaracja zaangażowania" step={2} onEdit={onGoToStep} />
        <InfoRow label="Uczestnictwo w spotkaniach" value={data.attendMeetings ? 'Tak' : 'Nie'} />
        <InfoRow label="Spotkania stacjonarne" value={data.attendInPerson ? 'Tak' : 'Nie'} />
        <InfoRow label="Godziny miesięcznie" value={`${data.monthlyHours}h`} />
      </div>

      {/* Step 3: Competencies */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <SectionHeader title="Profil kompetencji" step={3} onEdit={onGoToStep} />
        <CompetencyRadarChart competencies={data.competencies} size={250} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(Object.keys(COMPETENCY_LABELS) as (keyof CompetencyProfile)[]).map((key) => (
            <InfoRow key={key} label={COMPETENCY_LABELS[key]} value={`${data.competencies[key]}/10`} />
          ))}
        </div>
      </div>

      {/* Step 4: Motivations */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <SectionHeader title="Motywacje i oczekiwania" step={4} onEdit={onGoToStep} />
        {data.whatYouBring && (
          <div className="mb-3">
            <p className="text-gray-400 text-xs mb-1">Co wnosisz:</p>
            <p className="text-white text-sm">{data.whatYouBring}</p>
          </div>
        )}
        {data.expectations && (
          <div className="mb-3">
            <p className="text-gray-400 text-xs mb-1">Oczekiwania:</p>
            <p className="text-white text-sm">{data.expectations}</p>
          </div>
        )}
        {data.valuesResonance && (
          <div>
            <p className="text-gray-400 text-xs mb-1">Wartości:</p>
            <p className="text-white text-sm">{data.valuesResonance}</p>
          </div>
        )}
      </div>

      {/* Step 5: Engagement Types */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <SectionHeader title="Forma zaangażowania" step={5} onEdit={onGoToStep} />
        <div className="flex flex-wrap gap-2">
          {data.engagementTypes.map((type) => {
            const info = ENGAGEMENT_TYPE_LABELS[type as EngagementType];
            return (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/30 rounded-full text-cyan-400 text-sm"
              >
                {info?.emoji} {info?.title}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
