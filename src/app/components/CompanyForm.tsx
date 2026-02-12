import { motion } from 'motion/react';
import { useState } from 'react';
import { Building, Mail, Phone, Send, User, DollarSign, Award, Users } from 'lucide-react';
import { notificationService } from '@/utils/notificationService';

interface CompanyFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  companySize: string;
  partnershipType: string[];
  sponsorshipLevel: string;
  budget: string;
  goals: string;
  previousExperience: string;
  additionalServices: string[];
  timeline: string;
}

export function CompanyForm() {
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    companySize: '',
    partnershipType: [],
    sponsorshipLevel: '',
    budget: '',
    goals: '',
    previousExperience: '',
    additionalServices: [],
    timeline: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const partnershipOptions = [
    'Sponsoring finansowy',
    'Nagrody dla zwycięzców',
    'Mentoring techniczny',
    'Warsztaty/prezentacje',
    'Rekrutacja talentów',
    'Udostępnienie infrastruktury',
    'Catering',
    'Marketing/promocja'
  ];

  const additionalServicesOptions = [
    'Prezentacja firmy',
    'Stoisko rekrutacyjne',
    'Warsztaty techniczne',
    'Networking z uczestnikami',
    'Ocena projektów (jury)',
    'Możliwość praktyk/pracy',
    'Dostęp do bazy CV',
    'Branding na materiałach'
  ];

  const handlePartnershipToggle = (partnership: string) => {
    setFormData(prev => ({
      ...prev,
      partnershipType: prev.partnershipType.includes(partnership)
        ? prev.partnershipType.filter(p => p !== partnership)
        : [...prev.partnershipType, partnership]
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(service)
        ? prev.additionalServices.filter(s => s !== service)
        : [...prev.additionalServices, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submission = {
        id: Date.now().toString(),
        type: 'company' as const,
        timestamp: new Date().toISOString(),
        data: formData,
        status: 'new' as const
      };

      const existing = JSON.parse(localStorage.getItem('hackathon_submissions') || '[]');
      existing.push(submission);
      localStorage.setItem('hackathon_submissions', JSON.stringify(existing));

      await notificationService.notifyFormSubmission(formData, 'company');

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Dziękujemy za zainteresowanie!</h3>
            <p className="text-gray-300 mb-6">
              Twoje zgłoszenie partnerskie zostało wysłane. Skontaktujemy się z Tobą wkrótce w sprawie współpracy.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  companyName: '', contactPerson: '', email: '', phone: '', website: '',
                  industry: '', companySize: '', partnershipType: [], sponsorshipLevel: '',
                  budget: '', goals: '', previousExperience: '', additionalServices: [], timeline: ''
                });
              }}
              className="px-6 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg transition-colors"
            >
              Wyślij kolejne zgłoszenie
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Partnerstwo Biznesowe</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Dołącz do nas jako partner i wspieraj rozwój talentów AI w Polsce
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Info */}
              <div>
                <label htmlFor="companyName" className="flex items-center gap-2 text-white mb-2">
                  <Building className="w-4 h-4 text-green-400" />
                  <span>Nazwa firmy *</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Nazwa Twojej firmy"
                />
              </div>

              <div>
                <label htmlFor="contactPerson" className="flex items-center gap-2 text-white mb-2">
                  <User className="w-4 h-4 text-green-400" />
                  <span>Osoba kontaktowa *</span>
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Jan Kowalski"
                />
              </div>

              <div>
                <label htmlFor="email" className="flex items-center gap-2 text-white mb-2">
                  <Mail className="w-4 h-4 text-green-400" />
                  <span>Email *</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="kontakt@firma.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="flex items-center gap-2 text-white mb-2">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span>Telefon</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="+48 123 456 789"
                />
              </div>

              <div>
                <label htmlFor="website" className="flex items-center gap-2 text-white mb-2">
                  <span>Strona internetowa</span>
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="https://firma.com"
                />
              </div>

              <div>
                <label htmlFor="industry" className="flex items-center gap-2 text-white mb-2">
                  <span>Branża *</span>
                </label>
                <select
                  id="industry"
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="">Wybierz...</option>
                  <option value="technology">Technologia/IT</option>
                  <option value="fintech">Fintech</option>
                  <option value="healthcare">Zdrowie/Medtech</option>
                  <option value="automotive">Motoryzacja</option>
                  <option value="consulting">Konsulting</option>
                  <option value="education">Edukacja</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="other">Inne</option>
                </select>
              </div>

              <div>
                <label htmlFor="companySize" className="flex items-center gap-2 text-white mb-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span>Wielkość firmy *</span>
                </label>
                <select
                  id="companySize"
                  required
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="">Wybierz...</option>
                  <option value="startup">Startup (1-10 osób)</option>
                  <option value="small">Mała (11-50 osób)</option>
                  <option value="medium">Średnia (51-250 osób)</option>
                  <option value="large">Duża (251-1000 osób)</option>
                  <option value="enterprise">Korporacja (1000+ osób)</option>
                </select>
              </div>

              <div>
                <label htmlFor="sponsorshipLevel" className="flex items-center gap-2 text-white mb-2">
                  <Award className="w-4 h-4 text-green-400" />
                  <span>Poziom sponsoringu</span>
                </label>
                <select
                  id="sponsorshipLevel"
                  value={formData.sponsorshipLevel}
                  onChange={(e) => setFormData({ ...formData, sponsorshipLevel: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="">Wybierz...</option>
                  <option value="title">Sponsor tytularny</option>
                  <option value="gold">Sponsor złoty</option>
                  <option value="silver">Sponsor srebrny</option>
                  <option value="bronze">Sponsor brązowy</option>
                  <option value="partner">Partner</option>
                  <option value="other">Inne</option>
                </select>
              </div>
            </div>

            {/* Partnership Type */}
            <div className="mt-6">
              <label className="flex items-center gap-2 text-white mb-4">
                <span>Rodzaj partnerstwa *</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {partnershipOptions.map(partnership => (
                  <label key={partnership} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.partnershipType.includes(partnership)}
                      onChange={() => handlePartnershipToggle(partnership)}
                      className="rounded border-gray-600 bg-gray-900 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-300">{partnership}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="mt-6">
              <label htmlFor="budget" className="flex items-center gap-2 text-white mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span>Budżet (orientacyjny)</span>
              </label>
              <select
                id="budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
              >
                <option value="">Wybierz...</option>
                <option value="under-5k">Poniżej 5 000 PLN</option>
                <option value="5k-10k">5 000 - 10 000 PLN</option>
                <option value="10k-25k">10 000 - 25 000 PLN</option>
                <option value="25k-50k">25 000 - 50 000 PLN</option>
                <option value="over-50k">Powyżej 50 000 PLN</option>
                <option value="discuss">Do uzgodnienia</option>
              </select>
            </div>

            {/* Additional Services */}
            <div className="mt-6">
              <label className="flex items-center gap-2 text-white mb-4">
                <span>Dodatkowe usługi</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {additionalServicesOptions.map(service => (
                  <label key={service} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.additionalServices.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="rounded border-gray-600 bg-gray-900 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-300">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div className="mt-6">
              <label htmlFor="goals" className="flex items-center gap-2 text-white mb-2">
                <span>Cele partnerstwa *</span>
              </label>
              <textarea
                id="goals"
                required
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors resize-none"
                placeholder="Jakie są Wasze cele związane z partnerstwem? Rekrutacja, branding, CSR, networking..."
              />
            </div>

            {/* Previous Experience */}
            <div className="mt-6">
              <label htmlFor="previousExperience" className="flex items-center gap-2 text-white mb-2">
                <span>Poprzednie doświadczenie</span>
              </label>
              <textarea
                id="previousExperience"
                value={formData.previousExperience}
                onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors resize-none"
                placeholder="Czy wcześniej sponsorowaliście hackathony lub podobne wydarzenia?"
              />
            </div>

            {/* Timeline */}
            <div className="mt-6">
              <label htmlFor="timeline" className="flex items-center gap-2 text-white mb-2">
                <span>Preferowany termin decyzji</span>
              </label>
              <select
                id="timeline"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
              >
                <option value="">Wybierz...</option>
                <option value="asap">Jak najszybciej</option>
                <option value="1-week">W ciągu tygodnia</option>
                <option value="2-weeks">W ciągu 2 tygodni</option>
                <option value="1-month">W ciągu miesiąca</option>
                <option value="flexible">Elastycznie</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 font-semibold"
            >
              <Send className="w-5 h-5" />
              <span>{isSubmitting ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}</span>
            </button>

            <p className="text-sm text-gray-400 text-center mt-4">
              * Pola wymagane. Twoje dane będą przetwarzane zgodnie z RODO.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}