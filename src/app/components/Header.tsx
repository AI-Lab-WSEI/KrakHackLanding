import { Link, useLocation } from 'react-router';
import { ChevronDown, ChevronLeft, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const [showHackathonNav, setShowHackathonNav] = useState(false);
  const [editionDropdownOpen, setEditionDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileHackathonOpen, setMobileHackathonOpen] = useState(false);
  const editionRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const currentEdition = location.pathname === '/2025' ? '2025' : '2026';
  const isHackathonPage = location.pathname === '/' || location.pathname === '/2025' || location.pathname.startsWith('/zadania') || location.pathname === '/forms';

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
          <div className="text-xl font-bold">
            <span className="text-white">AI </span>
            <span className="text-cyan-400">KRAK</span>
            <span className="text-pink-400"> HACK</span>
          </div>
        </Link>

        {/* Desktop Navigation — no AnimatePresence, simple conditional render */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {showHackathonNav ? (
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
              <a href="/#kontakt" className={linkClass}>Kontakt</a>
            </div>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Edition switcher — only on hackathon pages */}
          {(isHackathonPage || showHackathonNav) && (
            <div className="relative" ref={editionRef}>
              <button
                onClick={() => setEditionDropdownOpen(!editionDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs"
              >
                {currentEdition}
                <ChevronDown className={`w-3 h-3 transition-transform ${editionDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {editionDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                  <Link to="/" onClick={() => setEditionDropdownOpen(false)}
                    className="block px-4 py-2.5 hover:bg-gray-700 text-white transition-colors border-b border-gray-700">
                    <div className="font-medium text-sm">2026</div>
                    <div className="text-xs text-gray-400">Aktualna edycja</div>
                  </Link>
                  <Link to="/2025" onClick={() => setEditionDropdownOpen(false)}
                    className="block px-4 py-2.5 hover:bg-gray-700 text-white transition-colors">
                    <div className="font-medium text-sm">2025</div>
                    <div className="text-xs text-gray-400">Archiwum</div>
                  </Link>
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
            <Link to="/o-nas" onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-cyan-400 transition-colors py-3 px-3 rounded-lg hover:bg-white/5 font-medium">
              O nas
            </Link>
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
            <Link to="/dolacz" onClick={() => setMobileMenuOpen(false)}
              className="text-pink-400 hover:text-pink-300 transition-colors py-3 px-3 rounded-lg hover:bg-white/5 font-bold">
              Dołącz do koła
            </Link>
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
