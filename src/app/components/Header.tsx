import { Link, useLocation } from 'react-router';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const currentEdition = location.pathname === '/2025' ? '2025 (Archiwum)' : '2026 (Aktualna)';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-cyan-500/30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4">
          {/* AI Possibilities Lab Logo */}
          <img 
            src="https://res.cloudinary.com/dyux0lw71/image/upload/v1770831902/ai-possibilities-lab-logo_v0flns.svg"
            alt="AI Possibilities Lab"
            className="h-8 w-auto"
          />
          <div className="text-2xl font-bold">
            <span className="text-white">AI </span>
            <span className="text-cyan-400">KRAK</span>
            <span className="text-pink-400"> HACK</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#o-nas" className="text-gray-300 hover:text-cyan-400 transition-colors">
            O nas
          </a>
          <a href="#kategorie" className="text-gray-300 hover:text-cyan-400 transition-colors">
            Kategorie
          </a>
          <a href="#wyzwania" className="text-gray-300 hover:text-cyan-400 transition-colors">
            Wyzwania
          </a>
          <a href="#harmonogram" className="text-gray-300 hover:text-cyan-400 transition-colors">
            Harmonogram
          </a>
          <a href="#program" className="text-gray-300 hover:text-cyan-400 transition-colors">
            Program
          </a>
          <a href="#zostanSponsorom" className="text-gray-300 hover:text-cyan-400 transition-colors">
            Zostań sponsorem
          </a>
          <a href="#zostanMentorem" className="text-gray-300 hover:text-pink-400 transition-colors">
            Zostań mentorem
          </a>
          {location.pathname === '/2025' && (
            <a href="#galeria" className="text-gray-300 hover:text-cyan-400 transition-colors">
              Galeria
            </a>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {/* Admin link - hidden by default, accessible via URL */}
          {location.pathname === '/admin' && (
            <Link
              to="/admin"
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Admin
            </Link>
          )}
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
            >
              <span className="hidden sm:inline">{currentEdition}</span>
              <span className="sm:hidden">{location.pathname === '/2025' ? '2025' : '2026'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                <Link
                  to="/"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-700 text-white transition-colors border-b border-gray-700"
                >
                  <div className="font-medium">2026</div>
                  <div className="text-xs text-gray-400">Aktualna edycja</div>
                </Link>
                <Link
                  to="/2025"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-3 hover:bg-gray-700 text-white transition-colors"
                >
                  <div className="font-medium">2025</div>
                  <div className="text-xs text-gray-400">Archiwum</div>
                </Link>
              </div>
            )}
          </div>

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
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <a 
              href="#o-nas" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
            >
              O nas
            </a>
            <a 
              href="#kategorie" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
            >
              Kategorie
            </a>
            <a 
              href="#wyzwania" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
            >
              Wyzwania
            </a>
            <a 
              href="#harmonogram" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
            >
              Harmonogram
            </a>
            <a 
              href="#program" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
            >
              Program
            </a>
            <a 
              href="#zostanSponsorom" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
            >
              Zostań sponsorem
            </a>
            <a 
              href="#zostanMentorem" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-pink-400 transition-colors py-2"
            >
              Zostań mentorem
            </a>
            {location.pathname === '/2025' && (
              <a 
                href="#galeria" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-cyan-400 transition-colors py-2"
              >
                Galeria
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}