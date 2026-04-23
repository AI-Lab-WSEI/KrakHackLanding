import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { MembershipFormData } from '@/types/membership';
import { DEFAULT_COMPETENCIES } from '@/types/membership';
import { Step1BasicInfo } from './membership/Step1BasicInfo';
import { Step2Engagement } from './membership/Step2Engagement';
import { Step3Competencies } from './membership/Step3Competencies';
import { Step4Motivations } from './membership/Step4Motivations';
import { Step5EngagementType } from './membership/Step5EngagementType';
import { Step6Summary } from './membership/Step6Summary';

const STORAGE_KEY = 'membership_form_draft';

const STEPS = [
  { number: 1, label: 'Dane' },
  { number: 2, label: 'Zaangażowanie' },
  { number: 3, label: 'Kompetencje' },
  { number: 4, label: 'Motywacje' },
  { number: 5, label: 'Forma' },
  { number: 6, label: 'Podsumowanie' },
];

const initialFormData: MembershipFormData = {
  firstName: '',
  lastName: '',
  email: '',
  university: '',
  fieldOfStudy: '',
  yearOrStatus: '',
  attendMeetings: false,
  attendInPerson: false,
  monthlyHours: 5,
  competencies: DEFAULT_COMPETENCIES,
  whatYouBring: '',
  expectations: '',
  valuesResonance: '',
  engagementTypes: [],
  howDidYouHear: '',
  discordUsername: '',
  clickupEmail: '',
};

function validateStep(step: number, data: MembershipFormData): string | null {
  switch (step) {
    case 1:
      if (!data.firstName.trim()) return 'Podaj imię';
      if (!data.lastName.trim()) return 'Podaj nazwisko';
      if (!data.email.trim() || !data.email.includes('@')) return 'Podaj prawidłowy email';
      return null;
    case 2:
      if (!data.attendMeetings) return 'Deklaracja uczestnictwa w spotkaniach jest wymagana';
      return null;
    case 5:
      if (data.engagementTypes.length === 0) return 'Wybierz przynajmniej jedną formę zaangażowania';
      return null;
    default:
      return null;
  }
}

export function MembershipWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<MembershipFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...initialFormData, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return initialFormData;
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleChange = useCallback((updates: Partial<MembershipFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setError(null);
  }, []);

  const handleNext = () => {
    const validationError = validateStep(currentStep, formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setCurrentStep((s) => Math.min(s + 1, 6));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
      const res = await fetch(`${apiBase}/api/membership-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Błąd wysyłki');
      }

      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-20 px-6"
      >
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-white mb-4">Dziękujemy za zgłoszenie!</h2>
        <p className="text-gray-300 text-lg mb-6">
          Skontaktujemy się z Tobą, żeby umówić krótką rozmowę i pokazać Ci, jak działa nasze koło. Dajemy Ci czas — żadnego pośpiechu.
        </p>
        <p className="text-gray-400">
          Sprawdź swoją skrzynkę mailową — potwierdzenie powinno już tam być.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Progress Bar */}
      <div className="mb-10">
        {/* Circles + lines row */}
        <div className="flex items-center">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => {
                  if (step.number < currentStep) goToStep(step.number);
                }}
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step.number === currentStep
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                    : step.number < currentStep
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500 cursor-pointer'
                    : 'bg-white/5 text-gray-500 border border-white/10'
                }`}
              >
                {step.number < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.number
                )}
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  step.number < currentStep ? 'bg-cyan-500/50' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>
        {/* Labels row */}
        <div className="flex items-start mt-2">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              <span className={`shrink-0 w-10 text-center text-[10px] hidden sm:block ${
                step.number === currentStep ? 'text-cyan-400 font-medium' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {idx < STEPS.length - 1 && <div className="flex-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            {currentStep === 1 && 'Podstawowe dane'}
            {currentStep === 2 && 'Deklaracja zaangażowania'}
            {currentStep === 3 && 'Profil kompetencji'}
            {currentStep === 4 && 'Motywacje i oczekiwania'}
            {currentStep === 5 && 'Forma zaangażowania'}
            {currentStep === 6 && 'Podsumowanie'}
          </h2>

          {currentStep === 1 && <Step1BasicInfo data={formData} onChange={handleChange} />}
          {currentStep === 2 && <Step2Engagement data={formData} onChange={handleChange} />}
          {currentStep === 3 && <Step3Competencies data={formData} onChange={handleChange} />}
          {currentStep === 4 && <Step4Motivations data={formData} onChange={handleChange} />}
          {currentStep === 5 && <Step5EngagementType data={formData} onChange={handleChange} />}
          {currentStep === 6 && <Step6Summary data={formData} onGoToStep={goToStep} onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pb-12">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors"
          >
            Wstecz
          </button>
        ) : (
          <div />
        )}

        {currentStep < 6 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20"
          >
            Dalej
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl text-white font-semibold hover:from-green-400 hover:to-cyan-400 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
          </button>
        )}
      </div>
    </div>
  );
}
