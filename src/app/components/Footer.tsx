import { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Linkedin } from 'lucide-react';
import { Link } from 'react-router';

interface OrgSettings {
  linkedinUrl?: string;
  contactEmail?: string;
  contactPhones?: string[];
  location?: string;
}

const DEFAULTS: OrgSettings = {
  linkedinUrl: 'https://www.linkedin.com/company/ai-possibilities-lab/?viewAsMember=true',
  contactEmail: 'knai@wsei.edu.pl',
  contactPhones: ['+48 662 974 402', '+48 690 459 531'],
  location: 'Kraków, Polska',
};

let cachedSettings: OrgSettings | null = null;

export function Footer() {
  const [settings, setSettings] = useState<OrgSettings>(cachedSettings || DEFAULTS);

  useEffect(() => {
    if (cachedSettings) return;
    const apiBase = import.meta.env.DEV ? 'http://localhost:3000' : '';
    fetch(`${apiBase}/api/config/org_settings`)
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object' && !data.error) {
          const merged = { ...DEFAULTS, ...data };
          cachedSettings = merged;
          setSettings(merged);
        }
      })
      .catch(() => {});
  }, []);

  const phoneDisplay = (settings.contactPhones || DEFAULTS.contactPhones || []).join(' / ');

  return (
    <footer id="kontakt" className="bg-black border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src="https://res.cloudinary.com/dyux0lw71/image/upload/v1770831902/ai-possibilities-lab-logo_v0flns.svg"
                alt="AI Possibilities Lab"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 leading-relaxed mb-4">
              Hackathon AI organizowany przez koło naukowe AI Possibilities Lab przy WSEI w Krakowie.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-bold mb-4">Nawigacja</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#info" className="hover:text-cyan-400 transition-colors">Info</a></li>
              <li><a href="#wyzwania" className="hover:text-cyan-400 transition-colors">Wyzwania</a></li>
              <li><a href="#harmonogram" className="hover:text-cyan-400 transition-colors">Harmonogram</a></li>
              <li><a href="#pytania" className="hover:text-cyan-400 transition-colors">Pytania</a></li>
              <li><a href="#sponsorzy" className="hover:text-cyan-400 transition-colors">Dla sponsorów</a></li>
              <li><a href="#mentorzy" className="hover:text-cyan-400 transition-colors">Dla mentorów</a></li>
              <li><a href="#zgloszenie" className="hover:text-cyan-400 transition-colors">Zgłoś się</a></li>
              <li><Link to="/o-nas" className="hover:text-cyan-400 transition-colors">O nas</Link></li>
              <li><Link to="/kontakt" className="hover:text-purple-400 transition-colors font-medium">Kontakt / Współpraca</Link></li>
              <li><Link to="/dolacz" className="hover:text-pink-400 transition-colors font-medium">Dołącz do koła</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Kontakt</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-cyan-400" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-cyan-400 transition-colors">
                  {settings.contactEmail}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 text-cyan-400" />
                <span>{phoneDisplay}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-cyan-400" />
                <span>{settings.location}</span>
              </div>
            </div>

            {/* Social Media */}
            <h3 className="text-white font-bold mt-6 mb-3">Social Media</h3>
            <div className="space-y-3">
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>AI Possibilities Lab</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AI Krak Hack. Wszystkie prawa zastrzeżone.</p>
          <p className="mt-2">Organizowane przez AI Possibilities Lab przy WSEI Kraków</p>
        </div>
      </div>
    </footer>
  );
}
