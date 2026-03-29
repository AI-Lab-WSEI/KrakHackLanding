import { Link, useLocation } from 'react-router';
import { ChevronDown, ChevronLeft, Menu, X, ExternalLink } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSiteConfig } from '@/app/hooks/useSiteConfig';
import { getVisibleEditions, CURRENT_EDITION_NUMBER, resolveEditionParam } from '@/data/edition-registry';

export function Header() {
  const { isLab, hackathonUrl } = useSiteConfig();
  const [showHackathonNav, setShowHackathonNav] = useState(false);
  const [editionDropdownOpen, setEditionDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileHackathonOpen, setMobileHackathonOpen] = useState(false);
  const editionRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Detect current edition from URL
  const editionMatch = location.pathname.match(/^\/edycja\/(\w+)/);
  const resolvedEdition = editionMatch ? resolveEditionParam(editionMatch[1]) : null;
  const currentEditionDisplay = resolvedEdition
    ? resolvedEdition.meta.year
    : location.pathname === '/2025' ? '2025' : String(CURRENT_EDITION_NUMBER);
  const visibleEditions = getVisibleEditions();

  const isHackathonPage = location.pathname === '/' || location.pathname === '/2025' || location.pathname.startsWith('/zadania') || location.pathname === '/forms' || location.pathname.startsWith('/edycja');
  const isPostHackathon = new Date() >= new Date('2026-03-28T18:00:00');

  // Reset hackathon nav when navigating away
  useEffect(() => {
    setShowHackathonNav(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editionRef.current && !editionRef.current.contains(event.target as Node)) {
        setEditionDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hackathonLinks = [
    { href: '/#info', label: 'Info' },
    { href: '/#wyzwania', label: 'Wyzwania' },
    { href: '/#harmonogram', label: 'Harmonogram' },
    { href: '/#pytania', label: 'Pytania' },
    { href: '/#sponsorzy', label: 'Sponsorzy' },
    { href: '/#mentorzy', label: 'Mentorzy' },
    { href: '/#zgloszenie', label: 'Zgłoś się' },
    { href: '/feedback', label: 'Ankieta', isLink: true },
  ];

  const linkClass = "text-gray-300 hover:text-cyan-400 transition-colors font-medium px-3 py-2.5 rounded-lg hover:bg-white/5 block";

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-cyan-500/30" style={{ zIndex: 9999 }}>
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 py-1 shrink-0">
          <img
            src="https://res.cloudinary.com/dyux0lw71/image/upload/v1770831902/ai-possibilities-lab-logo_v0flns.svg"
            alt="AI Possibilities Lab"
            className="h-8 w-auto"
          />
          {isLab ? (
            <img
              src="/assets/ai-lab-text-logo.png"
              alt="AI Possibilities Lab"
              className="h-8 w-auto"
            />
          ) : (
            <div className="text-xl font-bold">
              <span className="text-white">AI </span>
              <span className="text-cyan-400">KRAK</span>
              <span className="text-pink-400"> HACK</span>
            </div>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {isLab ? (
            /* LAB MODE: section scroll links + Hackathon external + Dołącz */
            <div className="flex items-center gap-1">
              <a href="/#dlaczego-warto" className={linkClass}>Co oferujemy</a>
              <a href="/#galeria" className={linkClass}>Galeria</a>
              <a href="/#dla-kogo" className={linkClass}>Dla kogo</a>
              <a href="/#wspolpraca" className={linkClass}>Współpraca</a>
              <a href="/#wizja" className={linkClass}>Misja</a>
              <div className="w-px h-4 bg-white/20 mx-1" />
              <a
                href={hackathonUrl}
                className="flex items-center gap-1.5 text-gray-300 hover:text-cyan-400 transition-colors font-medium px-3 py-2.5 rounded-lg hover:bg-white/5"
                target="_blank"
                rel="noopener noreferrer"
              >
                Hackathon
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
              <Link
                to="/dolacz"
                className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-pink-500/20 mx-1"
              >
                Dołącz do koła
              </Link>
            </div>
          ) : showHackathonNav ? (
            /* HACKATHON MODE: drill-down */
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHackathonNav(false)}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-medium px-3 py-2.5 rounded-lg hover:bg-white/5"
              >
                <ChevronLeft className="w-4 h-4" />
                Wróć
              </button>
              <div className="w-px h-5 bg-white/20 mx-1" />
              {hackathonLinks.map((link) =>
                link.isLink ? (
                  <Link key={link.href} to={link.href} className={linkClass}>{link.label}</Link>
                ) : (
                  <a key={link.href} href={link.href} className={linkClass}>{link.label}</a>
                )
              )}
            </div>
          ) : (
            /* HACKATHON MODE: main nav */
            <div className="flex items-center gap-1">
              <Link to="/o-nas" className={linkClass}>O nas</Link>
              <button
                onClick={() => setShowHackathonNav(true)}
                className="flex items-center gap-1 text-gray-300 hover:text-cyan-400 transition-colors font-medium px-3 py-2.5 rounded-lg hover:bg-white/5"
              >
                Hackathon
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/dolacz"
                className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-pink-500/20 mx-1"
              >
                Dołącz do koła
              </Link>
              {isPostHackathon && (
                <Link to="/feedback" className={linkClass}>Ankieta</Link>
              )}
              <a href="/#kontakt" className={linkClass}>Kontakt</a>
            </div>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Edition switcher — only on hackathon pages, never in lab mode */}
          {!isLab && (isHackathonPage || showHackathonNav) && (
            <div className="relative" ref={editionRef}>
              <button
                onClick={() => setEditionDropdownOpen(!editionDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs"
              >
                {currentEditionDisplay}
                <ChevronDown className={`w-3 h-3 transition-transform ${editionDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {editionDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                  {visibleEditions.map((ed, idx) => {
                    const isCurrent = ed.number === CURRENT_EDITION_NUMBER;
                    const linkTo = isCurrent ? '/' : `/edycja/${ed.number}`;
                    const label = isCurrent ? 'Aktualna edycja' : 'Archiwum';
                    return (
                      <Link key={ed.number} to={linkTo} onClick={() => setEditionDropdownOpen(false)}
                        className={`block px-4 py-2.5 hover:bg-gray-700 text-white transition-colors ${idx < visibleEditions.length - 1 ? 'border-b border-gray-700' : ''}`}>
                        <div className="font-medium text-sm">{ed.year} <span className="text-gray-500 text-xs">({ed.number}. edycja)</span></div>
                        <div className="text-xs text-gray-400">{label}</div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {location.pathname === '/admin' && (
            <Link to="/admin" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Admin</Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-cyan-400 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {!isLab && (
              <Link to="/o-nas" onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-cyan-400 transition-colors py-3 px-3 rounded-lg hover:bg-white/5 font-medium">
                O nas
              </Link>
            )}
            {isLab ? (
              <>
                <a href="/#dlaczego-warto" onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-cyan-400 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 font-medium text-sm">Co oferujemy</a>
                <a href="/#galeria" onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-cyan-400 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 font-medium text-sm">Galeria</a>
                <a href="/#dla-kogo" onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-cyan-400 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 font-medium text-sm">Dla kogo</a>
                <a href="/#wspolpraca" onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-cyan-400 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 font-medium text-sm">Współpraca</a>
                <a href="/#wizja" onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-cyan-400 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 font-medium text-sm">Misja</a>
                <a href={hackathonUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors py-3 px-3 rounded-lg hover:bg-white/5 font-medium">
                  Hackathon <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </>
            ) : (
              <>
                <button
                  onClick={() => setMobileHackathonOpen(!mobileHackathonOpen)}
                  className="flex items-center justify-between text-gray-300 hover:text-cyan-400 transition-colors py-3 px-3 rounded-lg hover:bg-white/5 font-medium"
                >
                  Hackathon
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileHackathonOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileHackathonOpen && (
                  <div className="pl-4 border-l-2 border-cyan-500/30 ml-3 space-y-0.5">
                    {hackathonLinks.map((link) =>
                      link.isLink ? (
                        <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)}
                          className="block text-gray-400 hover:text-cyan-400 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 text-sm">
                          {link.label}
                        </Link>
                      ) : (
                        <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                          className="block text-gray-400 hover:text-cyan-400 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 text-sm">
                          {link.label}
                        </a>
                      )
                    )}
                  </div>
                )}
              </>
            )}
            <Link to="/dolacz" onClick={() => setMobileMenuOpen(false)}
              className="text-pink-400 hover:text-pink-300 transition-colors py-3 px-3 rounded-lg hover:bg-white/5 font-bold">
              Dołącz do koła
            </Link>
            {isPostHackathon && (
              <Link to="/feedback" onClick={() => setMobileMenuOpen(false)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors py-3 px-3 rounded-lg hover:bg-white/5 font-medium">
                Wypełnij ankietę
              </Link>
            )}
            <a href="/#kontakt" onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-cyan-400 transition-colors py-3 px-3 rounded-lg hover:bg-white/5 font-medium">
              Kontakt
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
