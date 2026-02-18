import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, GraduationCap, Briefcase, Send, Code } from 'lucide-react';
import { notificationService } from '@/utils/notificationService';

interface ParticipantFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  studyField: string;
  yearOfStudy: string;
  experience: string;
  motivation: string;
  skills: string[];
  otherSkill: string;
  teamName: string;
  teamPreference: string;
  dietaryRestrictions: string;
  additionalNotes: string;
}

export function ParticipantForm() {
  const [formData, setFormData] = useState<ParticipantFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: '',
    studyField: '',
    yearOfStudy: '',
    experience: '',
    motivation: '',
    skills: [],
    otherSkill: '',
    teamName: '',
    teamPreference: '',
    dietaryRestrictions: '',
    additionalNotes: '',
  });

  const [existingTeams, setExistingTeams] = useState<string[]>([]);

  useEffect(() => {
    // Collect unique team names from existing submissions to offer suggestions
    const stored = localStorage.getItem('hackathon_submissions');
    if (stored) {
      try {
        const submissions = JSON.parse(stored);
        const teams = new Set<string>();
        submissions.forEach((s: any) => {
          if (s.data?.teamName) teams.add(s.data.teamName);
        });
        setExistingTeams(Array.from(teams));
      } catch (e) {
        console.error('Error loading existing teams:', e);
      }
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const skillOptions = [
    'Python', 'JavaScript', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'Data Analysis', 'React', 'Node.js', 'TensorFlow', 'PyTorch', 'SQL', 'Git', 'Docker'
  ];

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to localStorage (in real app, send to API)
      const submission = {
        id: Date.now().toString(),
        type: 'participant' as const,
        timestamp: new Date().toISOString(),
        data: formData,
        status: 'new' as const
      };

      const existing = JSON.parse(localStorage.getItem('hackathon_submissions') || '[]');
      existing.push(submission);
      localStorage.setItem('hackathon_submissions', JSON.stringify(existing));

      // Send email & Teams notifications
      await notificationService.notifyFormSubmission(formData, 'participant');

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
              Twoje zgłoszenie zostało wysłane. Skontaktujemy się z Tobą wkrótce z dalszymi informacjami.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  firstName: '', lastName: '', email: '', phone: '', university: '',
                  studyField: '', yearOfStudy: '', experience: '', motivation: '',
                  skills: [], otherSkill: '', teamName: '', teamPreference: '', 
                  dietaryRestrictions: '', additionalNotes: ''
                });
              }}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors"
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Zgłoszenie Uczestnika</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Wypełnij formularz poniżej, aby zgłosić się jako uczestnik AI Krak Hack 2026
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
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Imię *</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Jan"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="flex items-center gap-2 text-white mb-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Nazwisko *</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Kowalski"
                />
              </div>

              <div>
                <label htmlFor="email" className="flex items-center gap-2 text-white mb-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>Email *</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="jan.kowalski@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="flex items-center gap-2 text-white mb-2">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <span>Telefon</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="+48 123 456 789"
                />
              </div>

              {/* Education */}
              <div>
                <label htmlFor="university" className="flex items-center gap-2 text-white mb-2">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span>Uczelnia *</span>
                </label>
                <input
                  type="text"
                  id="university"
                  required
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="AGH, UJ, WSEI..."
                />
              </div>

              <div>
                <label htmlFor="studyField" className="flex items-center gap-2 text-white mb-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span>Kierunek studiów *</span>
                </label>
                <input
                  type="text"
                  id="studyField"
                  required
                  value={formData.studyField}
                  onChange={(e) => setFormData({ ...formData, studyField: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Informatyka, Matematyka..."
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="teamName" className="flex items-center gap-2 text-white mb-2">
                  <span>Nazwa grupy (jeśli już ją masz)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="teamName"
                    list="team-suggestions"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Wpisz nazwę swojej grupy lub wybierz z listy..."
                  />
                  <datalist id="team-suggestions">
                    {existingTeams.map(team => (
                      <option key={team} value={team} />
                    ))}
                  </datalist>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest">Wskazówka: Dołączenie do istniejącej grupy połączy Twoje zgłoszenie z zespołem w panelu admina.</p>
              </div>

              <div>
                <label htmlFor="yearOfStudy" className="flex items-center gap-2 text-white mb-2">
                  <span>Rok studiów *</span>
                </label>
                <select
                  id="yearOfStudy"
                  required
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">Wybierz...</option>
                  <option value="1">I rok</option>
                  <option value="2">II rok</option>
                  <option value="3">III rok</option>
                  <option value="4">IV rok</option>
                  <option value="5">V rok</option>
                  <option value="master1">I rok magisterskich</option>
                  <option value="master2">II rok magisterskich</option>
                  <option value="phd">Doktorant</option>
                </select>
              </div>

              <div>
                <label htmlFor="dietaryRestrictions" className="flex items-center gap-2 text-white mb-2">
                  <span>Ograniczenia dietetyczne</span>
                </label>
                <input
                  type="text"
                  id="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Wegetariańska, wegańska, alergie..."
                />
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <label className="flex items-center gap-2 text-white mb-4">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Zainteresowania techniczne</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {skillOptions.map(skill => (
                  <label key={skill} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="rounded border-gray-600 bg-gray-900 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-gray-300">{skill}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  value={formData.otherSkill}
                  onChange={(e) => setFormData({ ...formData, otherSkill: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Inne zainteresowania / Własna umiejętność..."
                />
              </div>
            </div>

            {/* Experience & Motivation */}
            <div className="mt-6">
              <label htmlFor="experience" className="flex items-center gap-2 text-white mb-2">
                <span>Doświadczenie z AI/ML</span>
              </label>
              <textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                placeholder="Opisz swoje doświadczenie z AI, machine learning, projektami..."
              />
            </div>

            <div className="mt-6">
              <label htmlFor="motivation" className="flex items-center gap-2 text-white mb-2">
                <span>Dlaczego chcesz wziąć udział? *</span>
              </label>
              <textarea
                id="motivation"
                required
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                placeholder="Opowiedz nam o swoich motywacjach i celach..."
              />
            </div>

            <div className="mt-6">
              <label htmlFor="teamPreference" className="flex items-center gap-2 text-white mb-2">
                <span>Preferencje zespołowe</span>
              </label>
              <textarea
                id="teamPreference"
                value={formData.teamPreference}
                onChange={(e) => setFormData({ ...formData, teamPreference: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                placeholder="Czy masz już zespół? Jakie umiejętności chciałbyś mieć w zespole?"
              />
            </div>

            <div className="mt-6">
              <label htmlFor="additionalNotes" className="flex items-center gap-2 text-white mb-2">
                <span>Dodatkowe uwagi dla organizatorów</span>
              </label>
              <textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                placeholder="Np. informacja o spóźnieniu, specyficzne potrzeby..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center gap-2 font-semibold"
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