import { MembershipWizard } from '@/app/components/MembershipWizard';
import { Footer } from '@/app/components/Footer';

export function MembershipForm() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Parallax marble background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/assets/marble-texture.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.08,
        }}
      />
      {/* Base gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" style={{ mixBlendMode: 'multiply' }} />

      <div className="relative z-10 pt-28">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Dołącz do{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                AI Possibilities Lab
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Wypełnij formularz zgłoszeniowy, a my skontaktujemy się z Tobą, żeby umówić krótką rozmowę.
            </p>
          </div>

          <MembershipWizard />
        </div>

        <Footer />
      </div>
    </div>
  );
}
