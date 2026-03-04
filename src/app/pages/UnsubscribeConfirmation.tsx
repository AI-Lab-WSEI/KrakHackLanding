import { ThumbsUp } from 'lucide-react';
import { Footer } from '@/app/components/Footer';

export function UnsubscribeConfirmation() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="flex justify-center">
            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full border border-cyan-500/30 shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)]">
              <ThumbsUp className="w-20 h-20 text-cyan-400" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Pomyślnie wypisano
            </h1>
            <div className="space-y-6 text-xl text-gray-400 leading-relaxed">
              <p>
                Zostałeś wypisany, nie będziemy wysyłać więcej wiadomości.
              </p>
              <p className="text-gray-500 italic">
                To była jedyna, pojedyncza wiadomość. Śpij spokojnie.
              </p>
              <p className="pt-4 text-cyan-400 font-medium">
                I tak zapraszamy do współpracy.
              </p>
            </div>
          </div>

          <div className="pt-8">
            <a
              href="/"
              className="inline-block px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all border border-gray-700 hover:border-gray-600"
            >
              Wróć do strony głównej
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
