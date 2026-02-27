import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Send, Building, Award, Clock } from 'lucide-react';
import { notificationService } from '@/utils/notificationService';

interface MentorFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  experience: string;
  expertise: string[];
  availability: string;
  motivation: string;
  previousMentoring: string;
  linkedIn: string;
  portfolio: string;
  acceptRules: boolean;
  consentMarketingEmail: boolean;
  consentMarketingPhone: boolean;
  consentMarketingSms: boolean;
  consentMarketingChat: boolean;
  consentImage: boolean;
}

export function MentorForm() {
  const [formData, setFormData] = useState<MentorFormData>(() => {
    const saved = localStorage.getItem('mentor_form_draft');
    const initialData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      experience: '',
      expertise: [],
      availability: '',
      motivation: '',
      previousMentoring: '',
      linkedIn: '',
      portfolio: '',
      acceptRules: false,
      consentMarketingEmail: false,
      consentMarketingPhone: false,
      consentMarketingSms: false,
      consentMarketingChat: false,
      consentImage: false,
    };

    if (saved) {
      try {
        return { ...initialData, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error parsing draft:', e);
      }
    }
    return initialData;
  });

  // Save draft on change
  useEffect(() => {
    localStorage.setItem('mentor_form_draft', JSON.stringify(formData));
  }, [formData]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const expertiseOptions = [
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Science',
    'Python', 'TensorFlow', 'PyTorch', 'Cloud Computing', 'MLOps', 'AI Ethics',
    'Product Management', 'Startup Experience', 'Business Development'
  ];

  const handleExpertiseToggle = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...prev.expertise, expertise]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submission = {
        id: Date.now().toString(),
        type: 'mentor' as const,
        timestamp: new Date().toISOString(),
        data: formData,
        status: 'new' as const
      };

      const existing = JSON.parse(localStorage.getItem('hackathon_submissions') || '[]');
      existing.push(submission);
      localStorage.setItem('hackathon_submissions', JSON.stringify(existing));

      // Send email & Teams notifications
      await notificationService.notifyFormSubmission(formData, 'mentor');

      // Clear draft on submission
      localStorage.removeItem('mentor_form_draft');

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
            <h3 className="text-2xl font-bold text-white mb-4">Dziękujemy za zgłoszenie!</h3>
            <p className="text-gray-300 mb-6">
              Twoje zgłoszenie jako mentor zostało wysłane. Skontaktujemy się z Tobą wkrótce z dalszymi informacjami.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  firstName: '', lastName: '', email: '', phone: '', company: '',
                  position: '', experience: '', expertise: [], availability: '',
                  motivation: '', previousMentoring: '', linkedIn: '', portfolio: '',
                  acceptRules: false,
                  consentMarketingEmail: false, consentMarketingPhone: false,
                  consentMarketingSms: false, consentMarketingChat: false,
                  consentImage: false
                });
                localStorage.removeItem('mentor_form_draft');
              }}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-colors"
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Zgłoszenie Mentora</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Dołącz do nas jako mentor i pomóż uczestnikom rozwijać ich projekty AI
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
              {/* Personal Info */}
              <div>
                <label htmlFor="firstName" className="flex items-center gap-2 text-white mb-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Imię *</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Jan"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="flex items-center gap-2 text-white mb-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Nazwisko *</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Kowalski"
                />
              </div>

              <div>
                <label htmlFor="email" className="flex items-center gap-2 text-white mb-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span>Email *</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="jan.kowalski@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="flex items-center gap-2 text-white mb-2">
                  <Phone className="w-4 h-4 text-purple-400" />
                  <span>Telefon</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="+48 123 456 789"
                />
              </div>

              {/* Professional Info */}
              <div>
                <label htmlFor="company" className="flex items-center gap-2 text-white mb-2">
                  <Building className="w-4 h-4 text-purple-400" />
                  <span>Firma/Organizacja *</span>
                </label>
                <input
                  type="text"
                  id="company"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Google, Microsoft, startup..."
                />
              </div>

              <div>
                <label htmlFor="position" className="flex items-center gap-2 text-white mb-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span>Stanowisko *</span>
                </label>
                <input
                  type="text"
                  id="position"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Senior AI Engineer, Data Scientist..."
                />
              </div>

              <div>
                <label htmlFor="linkedIn" className="flex items-center gap-2 text-white mb-2">
                  <span>LinkedIn</span>
                </label>
                <input
                  type="url"
                  id="linkedIn"
                  value={formData.linkedIn}
                  onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label htmlFor="portfolio" className="flex items-center gap-2 text-white mb-2">
                  <span>Portfolio/GitHub</span>
                </label>
                <input
                  type="url"
                  id="portfolio"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            {/* Experience */}
            <div className="mt-6">
              <label htmlFor="experience" className="flex items-center gap-2 text-white mb-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Doświadczenie zawodowe *</span>
              </label>
              <textarea
                id="experience"
                required
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                placeholder="Opisz swoje doświadczenie zawodowe, projekty, osiągnięcia..."
              />
            </div>

            {/* Expertise */}
            <div className="mt-6">
              <label className="flex items-center gap-2 text-white mb-4">
                <span>Obszary ekspertyzy *</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {expertiseOptions.map(expertise => (
                  <label key={expertise} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.expertise.includes(expertise)}
                      onChange={() => handleExpertiseToggle(expertise)}
                      className="rounded border-gray-600 bg-gray-900 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">{expertise}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="mt-6">
              <label htmlFor="availability" className="flex items-center gap-2 text-white mb-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Dostępność podczas hackathonu *</span>
              </label>
              <select
                id="availability"
                required
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="">Wybierz...</option>
                <option value="full-time">Pełny czas (cały weekend)</option>
                <option value="saturday">Tylko sobota</option>
                <option value="sunday">Tylko niedziela</option>
                <option value="evening">Wieczory (po pracy)</option>
                <option value="flexible">Elastycznie (kilka godzin)</option>
              </select>
            </div>

            {/* Previous Mentoring */}
            <div className="mt-6">
              <label htmlFor="previousMentoring" className="flex items-center gap-2 text-white mb-2">
                <span>Poprzednie doświadczenie mentorskie</span>
              </label>
              <textarea
                id="previousMentoring"
                value={formData.previousMentoring}
                onChange={(e) => setFormData({ ...formData, previousMentoring: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                placeholder="Czy wcześniej byłeś mentorem? Opisz swoje doświadczenie..."
              />
            </div>

            {/* Motivation */}
            <div className="mt-6">
              <label htmlFor="motivation" className="flex items-center gap-2 text-white mb-2">
                <span>Dlaczego chcesz być mentorem? *</span>
              </label>
              <textarea
                id="motivation"
                required
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                placeholder="Opowiedz nam o swoich motywacjach do mentoringu..."
              />
            </div>

            <div className="mt-8 space-y-6">
              <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={formData.acceptRules}
                    onChange={(e) => setFormData({ ...formData, acceptRules: e.target.checked })}
                    className="mt-1 rounded border-gray-600 bg-gray-900 text-purple-500 focus:ring-purple-500 transition-colors"
                  />
                  <span className="text-sm text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                    Akceptuję <a 
                      href="https://res.cloudinary.com/dyux0lw71/image/upload/v1772050760/AI_KrakHack_REGULAMIN_HACKATHONU_tzgb7g.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >Regulamin Hackathonu</a>. 
                    Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO oraz przyjmuję do wiadomości zapisy dotyczące przekazania autorskich praw majątkowych do wypracowanych rozwiązań na rzecz Organizatora i Partnerów (zgodnie z § 8 Regulaminu). *
                  </span>
                </label>
              </div>

              {/* Marketing Consents */}
              <div className="p-4 bg-gray-900/20 border border-gray-800 rounded-lg space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Wyrażam zgodę na przetwarzanie moich danych osobowych przez Szkołę w celu przesyłania informacji handlowych dotyczących usług, promocji i wydarzeń związanych z Szkołą. Zgoda obejmuje przesyłanie informacji za pośrednictwem:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.consentMarketingEmail}
                      onChange={(e) => setFormData({ ...formData, consentMarketingEmail: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-900 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300">poczty elektronicznej (e-mail)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.consentMarketingPhone}
                      onChange={(e) => setFormData({ ...formData, consentMarketingPhone: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-900 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300">połączeń telefonicznych</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.consentMarketingSms}
                      onChange={(e) => setFormData({ ...formData, consentMarketingSms: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-900 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300">SMS/MMS</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.consentMarketingChat}
                      onChange={(e) => setFormData({ ...formData, consentMarketingChat: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-900 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300">komunikatorów internetowych (np. WhatsApp)</span>
                  </label>
                </div>
              </div>

              {/* Image Consent */}
              <div className="p-4 bg-gray-900/20 border border-gray-800 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.consentImage}
                    onChange={(e) => setFormData({ ...formData, consentImage: e.target.checked })}
                    className="mt-1 rounded border-gray-600 bg-gray-900 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-300 leading-relaxed group-hover:text-gray-200">
                    <span className="font-semibold">Zgoda na wizerunek: </span> Wyrażam zgodę na nieodpłatne utrwalanie i rozpowszechnianie mojego wizerunku przez Koło Naukowe AI Possibilities Lab oraz Wyższą Szkołę Ekonomii i Informatyki w Krakowie w celach promocyjnych zgodnie z § 7 ust. 9 Regulaminu.
                  </span>
                </label>
              </div>

              {/* Administrator Info */}
              <div className="p-4 border-l-2 border-purple-500/50 bg-purple-500/5">
                <p className="text-xs text-gray-400">
                  Administratorem Twoich danych osobowych jest Wyższa Szkoła Ekonomii i Informatyki w Krakowie.
                  Więcej informacji o przetwarzaniu danych znajdziesz pod adresem: <a 
                    href="https://wsei.edu.pl/ochrona-danych-osobowych/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >https://wsei.edu.pl/ochrona-danych-osobowych/</a>
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 font-semibold"
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