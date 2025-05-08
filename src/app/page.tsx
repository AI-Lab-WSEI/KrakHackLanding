'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import pageStyles from './page.module.css';
import sliderStyles from '../components/TextSlider.module.css';
// Import GSAP
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Import React Icons
import { FaBrain, FaDatabase, FaCode, FaChartLine, FaUsers, FaTrophy } from 'react-icons/fa';
import { FaMapLocationDot, FaTrainSubway, FaComments } from 'react-icons/fa6';
// Import hamburger menu icons
import { FaBars, FaTimes } from 'react-icons/fa';
// Import arrow icon for collapsible section
import { FaChevronDown } from 'react-icons/fa';
// Import timeline data
import timelineEvents from '../data/timelineEvents.json';
// Import parallax background component
import ParallaxBackground from '../components/ParallaxBackground';
import TextSlider from '../components/TextSlider'; // Import the slider
// Import GSAP with dynamic imports
import { useGSAP } from '../hooks/useGSAP'; // We'll create this hook
import { useLenis } from '../hooks/useSmoothScroll'; // Import our custom useLenis hook

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const sliderSentences = [
  "Dołącz do AI Krak Hack – hackathonu, gdzie Twoje umiejętności w dziedzinie sztucznej inteligencji przełożą się na realne rozwiązania dla Krakowa!",
  "Zmierz się z prawdziwymi wyzwaniami lokalnej społeczności – od optymalizacji transportu miejskiego po ułatwienie dostępu do kultury. Czekają na Ciebie ciekawe zadania, wsparcie mentorów i atrakcyjne nagrody.",
  "Szukamy pasjonatów AI, studentów i entuzjastów technologii gotowych do współpracy w zespołach (2-4 osoby). To niepowtarzalna okazja do nauki, networkingu i stworzenia czegoś znaczącego.",
  "AI Krak Hack to więcej niż konkurs – to szansa, by Twoje pomysły wpłynęły na codzienne życie mieszkańców Krakowa. Zarejestruj swój zespół już dziś!"
];

const sliderColors = [
  "var(--bright-cyan)",
  "var(--white)", // Use white for contrast
  "var(--vibrant-magenta)",
  "var(--electric-blue)",
];

// Define a type for parallax element
interface ParallaxElement {
  el: HTMLDivElement | null;
  speed: number;
}

export default function Home() {
  // State to track client-side rendering
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Add state for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Add state for collapsible challenges section
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Refs for parallax elements
  const heroSparkleRef1 = useRef<HTMLDivElement>(null);
  const heroBackgroundRef = useRef<HTMLDivElement>(null);
  const heroSparkleRef2 = useRef<HTMLDivElement>(null);
  const heroSliderRef = useRef<HTMLDivElement>(null);
  const challengeSparkleRef1 = useRef<HTMLDivElement>(null);
  const challengeSparkleRef2 = useRef<HTMLDivElement>(null);
  const registrationSparkleRef1 = useRef<HTMLDivElement>(null);
  const registrationSparkleRef2 = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const mapBackgroundRef = useRef<HTMLDivElement>(null);
  
  // Collection of elements for dynamic parallax
  const parallaxElements = useRef<ParallaxElement[]>([]);
  
  // Refs for GSAP animations
  const navbarRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const hackathonSectionRef = useRef<HTMLElement>(null);
  const wyzwaniaSectionRef = useRef<HTMLElement>(null);
  const oNasSectionRef = useRef<HTMLElement>(null);
  const harmonogramSectionRef = useRef<HTMLElement>(null);
  const nagrodyPartnerzyRef = useRef<HTMLElement>(null);
  const rejestracjaSectionRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  
  // Get reference to lenis for use in component
  const lenis = useLenis();
  
  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Use our custom GSAP hook that only runs on the client
  useGSAP(isClient, {
    navbarRef,
    heroSectionRef,
    heroSparkleRef1,
    heroSparkleRef2,
    heroSliderRef,
    posterRef,
    hackathonSectionRef,
    wyzwaniaSectionRef,
    oNasSectionRef,
    harmonogramSectionRef,
    nagrodyPartnerzyRef,
    rejestracjaSectionRef,
    footerRef,
    parallaxElements
  });
  
  // Parallax effect using useLenis
  useLenis((params: { scroll: number }) => {
    if (!isClient) return; // Skip on server
    
    const { scroll } = params;
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Apply parallax effect (adjust multiplier for different speeds)
    const applyParallax = (ref: React.RefObject<HTMLDivElement | null>, multiplier: number) => {
      if (!ref.current) return;
      
      // Use lighter parallax effect on mobile
      const effectMultiplier = isMobile ? multiplier * 0.3 : multiplier;
      ref.current.style.transform = `translateY(${scroll * effectMultiplier}px)`;
    };

    // Apply parallax to elements with reduced intensity on mobile
    applyParallax(heroSparkleRef1, 0.2);
    applyParallax(heroSparkleRef2, -0.15);
    applyParallax(challengeSparkleRef1, 0.1);
    applyParallax(challengeSparkleRef2, -0.1);
    applyParallax(registrationSparkleRef1, 0.05);
    applyParallax(registrationSparkleRef2, -0.08);
    
    // Only apply these effects on desktop or use very minimal effect on mobile
    if (!isMobile) {
      applyParallax(heroSliderRef, 0.25);
      applyParallax(posterRef, -0.1);
      applyParallax(mapBackgroundRef, 0.2);
      applyParallax(heroBackgroundRef, 0.2);
    } else {
      // Very minimal effect for content elements on mobile
      applyParallax(heroSliderRef, 0.05);
      applyParallax(posterRef, -0.02);
      applyParallax(mapBackgroundRef, 0.04);
      applyParallax(heroBackgroundRef, 0.04);
    }
    
    // Apply parallax to dynamic elements with reduced intensity on mobile
    parallaxElements.current.forEach(item => {
      if (item.el) {
        const effectSpeed = isMobile ? item.speed * 0.3 : item.speed;
        item.el.style.transform = `translateY(${scroll * effectSpeed}px)`;
      }
    });
  });

  // Function to scroll to a specific section with native scrolling on mobile
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Use smooth scrollIntoView only on desktop
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        // Simple scroll for mobile devices
        window.scrollTo(0, element.offsetTop);
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Close mobile menu after clicking a link
  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setMobileMenuOpen(false);
  };

  // Function to toggle details section
  const toggleDetails = () => {
    setDetailsOpen(!detailsOpen);
  };

  return (
    <div className={pageStyles.pageWrapper}>
      {/* --- Sticky Navbar --- */}
      <nav className={pageStyles.navbar} ref={navbarRef}>
        <div className={pageStyles.navbarContent}>
          <Image
            src="https://res.cloudinary.com/dyux0lw71/image/upload/fl_preserve_transparency/v1744733652/krak-hack-text_leuvjp.jpg?_s=public-apps"
            alt="AI Krak Hack Logo"
            width={150}
            height={30}
            className={pageStyles.navbarLogo}
          />
          <div className={pageStyles.navbarLinks}>
            <button onClick={() => scrollToSection('o-hackathonie')}>O Hackathonie</button>
            <button onClick={() => scrollToSection('wyzwania')}>Wyzwania</button>
            <button onClick={() => scrollToSection('o-nas')}>O Nas</button>
            <button onClick={() => scrollToSection('harmonogram')}>Harmonogram</button>
            <button onClick={() => scrollToSection('rejestracja')}>Rejestracja</button>
          </div>
          
          {/* Mobile Menu Toggle Button */}
          <div className={pageStyles.mobileMenuToggle} onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <FaTimes size={24} color="white" /> : <FaBars size={24} color="white" />}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={pageStyles.mobileMenu}>
            <button onClick={() => handleNavClick('o-hackathonie')}>O Hackathonie</button>
            <button onClick={() => handleNavClick('wyzwania')}>Wyzwania</button>
            <button onClick={() => handleNavClick('o-nas')}>O Nas</button>
            <button onClick={() => handleNavClick('harmonogram')}>Harmonogram</button>
            <button onClick={() => handleNavClick('rejestracja')}>Rejestracja</button>
          </div>
        )}
      </nav>

      {/* --- Hero Section --- */}
      <header id="hero" className={pageStyles.heroSection} ref={heroSectionRef}>
        {/* Use Image Background with Parallax */}

        <div className="heroBackgroundMap">
          <div className={pageStyles.heroBackgroundMap} ref={heroBackgroundRef}>
            <Image 
              src="https://res.cloudinary.com/dyux0lw71/image/upload/fl_preserve_transparency/v1744733653/map-track-background_bav3wh.jpg?_s=public-apps"
              alt="Hero Background"
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              priority
            />
          </div>
        </div>
        
        <div className={pageStyles.heroContent}>
          {/* Slider with Background */}
          <div className={sliderStyles.sliderBackground} ref={heroSliderRef}> 
            <TextSlider 
              sentences={sliderSentences} 
              colors={sliderColors} 
              interval={8000}
            />
          </div>

          {/* Main Visual - Using heroVisualContainer class instead of inline styles */}
          <div className={pageStyles.heroVisualContainer} ref={posterRef}> 
            <Image
              src="https://res.cloudinary.com/dyux0lw71/image/upload/v1746697001/main-text.png_0.3x_tinjf3.png"
              alt="AI Krak Hack Main Visual"
              width={700} 
              height={500}
              className={pageStyles.heroVisual}
              priority
            />
          </div>
          
          {/* Parallax Sparkles - Larger and repositioned */}
          {!isMobile && (
          <div ref={heroSparkleRef1} className={`${pageStyles.sparkle} ${pageStyles.heroSparkle1Large}`}>
            <Image src="https://res.cloudinary.com/dyux0lw71/image/upload/fl_preserve_transparency/v1744733653/stars_0.1x_fy3net.jpg?_s=public-apps" alt="Sparkle" width={150} height={150} /> 
          </div>
          )}
          {!isMobile && (
          <div ref={heroSparkleRef2} className={`${pageStyles.sparkle} ${pageStyles.heroSparkle2Large}`}>
            <Image src="https://res.cloudinary.com/dyux0lw71/image/upload/fl_preserve_transparency/v1744733654/talks-1_0.1x_lnuvpd.jpg?_s=public-apps" alt="Talks" width={180} height={180} /> 
          </div>
          )}
          

          {/* CTA Button - Centered relative to hero content */} 
          <div className={pageStyles.ctaContainer}> 
            <button className={pageStyles.ctaButton} onClick={() => scrollToSection('rejestracja')}>
              ZAREJESTRUJ SIĘ!
            </button>
          </div>
        </div>
      </header>

      {/* --- O Hackathonie Section --- */}
      <section id="o-hackathonie" className={`${pageStyles.section} ${pageStyles.darkGreyBg}`} ref={hackathonSectionRef}>
        <div className={pageStyles.separatorMagenta}></div>
        <div className={pageStyles.sectionContent}>
          <h2 className={pageStyles.sectionHeading}>CZYM JEST AI KRAK HACK?</h2>
          <p className={pageStyles.paragraph}>
            Cześć! Jesteśmy Kołem Naukowym AI Possibilities Lab z WSEI w Krakowie. Naszą misją jest eksploracja możliwości sztucznej inteligencji i przekuwanie jej potencjału w praktyczne rozwiązania. Wierzymy, że technologia może realnie przyczynić się do ulepszenia naszego miasta! AI Krak Hack to Twoja szansa, by wyjść poza teorię i zmierzyć się z realnymi wyzwaniami Krakowa, wykorzystując najnowsze narzędzia AI. To nie tylko konkurs – to okazja do nauki, networkingu i stworzenia czegoś, co będzie świetnie wyglądać w Twoim portfolio!
          </p>
          <h3 className={pageStyles.subHeading}>DLACZEGO WARTO?</h3>
          <div className={pageStyles.bulletGrid}>
            <div className={pageStyles.bulletItem}>
              <FaBrain className={pageStyles.icon} color="#00a4ff" size={24} />
              <span>Rozwój Umiejętności AI</span>
            </div>
            <div className={pageStyles.bulletItem}>
              <FaDatabase className={pageStyles.icon} color="#00e5ff" size={24} />
              <span>Realne Dane Miejskie</span>
            </div>
            <div className={pageStyles.bulletItem}>
              <FaCode className={pageStyles.icon} color="#ff00ff" size={24} />
              <span>Projekt do Portfolio</span>
            </div>
            <div className={pageStyles.bulletItem}>
              <FaChartLine className={pageStyles.icon} color="#00a4ff" size={24} />
              <span>Realny Wpływ</span>
            </div>
            <div className={pageStyles.bulletItem}>
              <FaUsers className={pageStyles.icon} color="#00e5ff" size={24} />
              <span>Networking</span>
            </div>
             <div className={pageStyles.bulletItem}>
              <FaTrophy className={pageStyles.icon} color="#ff00ff" size={24} />
              <span>Nagrody</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Wyzwania Section --- */}
      <section id="wyzwania" className={pageStyles.section + " " + pageStyles.blackBg} ref={wyzwaniaSectionRef}>
        <div className={pageStyles.separatorCyan}></div>
        
        <div className="mapBackground">
          <div className={pageStyles.challengeBackgroundMap} ref={mapBackgroundRef}>
            <Image 
              src="https://res.cloudinary.com/dyux0lw71/image/upload/fl_preserve_transparency/v1744733653/map-background_hejf6y.jpg?_s=public-apps"
              alt="Krakow Map Background"
              fill
              style={{ opacity: 0, filter: 'blur(2px)' }} // Start with opacity 0 for animation
            />
          </div>
        </div>
        
        <div className={pageStyles.sectionContent}>
          <h2 className={pageStyles.challengeMainHeading}>PODEJMIJ WYZWANIE</h2>
          
          <div className={pageStyles.challengeDescription}>
            <p className={pageStyles.paragraph}>
              Dziesięcioletnia Ania niesie trzy ananasy. Z jaką prędkością obraca się Saturn, kiedy pociąg relacji Pcim-Moskwa staranował jej chomika?" - Kojarzysz ten klimat? Ile razy na studiach mierzyliśmy się z problemami, które wydawały się istnieć tylko po to, by przetestować naszą zdolność do żonglowania wzorami? Tworzenie symulacji dla samej symulacji może być ciekawe, ale my, jako Koło Naukowe AI Possibilities Lab, postawiliśmy sobie inny cel. Chcieliśmy stworzyć wyzwania, które wykorzystują najnowsze możliwości AI, ale jednocześnie mocno stąpają po ziemi – tej krakowskiej. Naszą główną motywacją jest budowanie narzędzi, które mają realne znaczenie, odnoszą się do naszego najbliższego kontekstu i są na tyle praktyczne i użyteczne, że sami chcielibyśmy z nich korzystać na co dzień. Dlatego nie rzucamy Was na głęboką wodę z czystą abstrakcją. Przygotowaliśmy konkretne dane dotyczące naszego miasta i mamy przemyślane pomysły na zadania, które pozwolą Wam te dane przekuć w coś wartościowego. Co więcej, najlepsze rezultaty hackathonu postaramy się przedstawić decydentom w Krakowie – kto wie, może właśnie Wasz projekt będzie miał szansę na dalszy rozwój i realne wdrożenie?
            </p>
            <p className={pageStyles.paragraph}>
             Żyjemy w fascynujących czasach. Modele językowe i narzędzia AI rewolucjonizują sposób, w jaki wchodzimy w interakcje z technologią i jak tworzymy oprogramowanie. Jesteśmy u progu ery, w której interakcje ze światem cyfrowym zmienią się nie do poznania. Nie jesteśmy alfą i omegą – uczymy się tej rewolucji razem z Wami. Dlatego zadania, które proponujemy, odzwierciedlają obszary bliskie naszym projektom i doświadczeniom w Kole.
            </p>
            <p className={pageStyles.paragraph}>
              Nasza główna motywacja? Stworzyć coś, co ma realne znaczenie, rozwija praktyczne umiejętności i – co najważniejsze – jest na tyle użyteczne, że sami chcielibyśmy z tego korzystać. Dlatego przygotowaliśmy dwa różne wyzwania:
            </p>
          </div>
          
          <div className={pageStyles.challengeContainer}>
            {/* Block 1: Tramwaje */}
            <div className={pageStyles.challengeBlock + " challenge-block"}>
              <div className={pageStyles.challengeIcon + " challenge-icon"}>
                <FaTrainSubway size={60} color="#00e5ff" />
              </div>
              <h3 className={pageStyles.challengeHeading + " challenge-heading"}>Wyzwanie 1: Zoptymalizuj Krakowską Sieć Tramwajową</h3>
              <p className={pageStyles.paragraphSmall + " challenge-text"}>
                Bardziej algorytmiczne i optymalizacyjne, które pozwoli Ci zmierzyć się z realnymi danymi miejskimi dotyczącymi transportu publicznego. To szansa na pogłębienie wiedzy z analizy danych przestrzennych, algorytmów grafowych i technik optymalizacji (np. programowania liniowego, heurystyk). Zapewniamy solidny, przemyślany punkt startowy w postaci danych – reszta w Waszych rękach!
              </p>
              <div className={pageStyles.tagContainer}>
                <span className={`${pageStyles.tag} ${pageStyles.tagCyan} challenge-tag`}>Python</span>
                <span className={`${pageStyles.tag} ${pageStyles.tagCyan} challenge-tag`}>GeoPandas</span>
                <span className={`${pageStyles.tag} ${pageStyles.tagCyan} challenge-tag`}>Optymalizacja</span>
                <span className={`${pageStyles.tag} ${pageStyles.tagCyan} challenge-tag`}>Dane Miejskie</span>
              </div>
            </div>
            
            {/* Block 2: Asystent Kulturalny */}
            <div className={pageStyles.challengeBlock + " challenge-block"}>
              <div className={pageStyles.challengeIcon + " challenge-icon"}>
                <FaComments size={60} color="#ff00ff" />
              </div>
              <h3 className={pageStyles.challengeHeading + " challenge-heading"}>Wyzwanie 2: Zbuduj Inteligentnego Asystenta Kulturalnego Krakowa</h3>
              <p className={pageStyles.paragraphSmall + " challenge-text"}>
                Bardziej otwarte, skupione na interakcji człowiek-AI i przetwarzaniu informacji, gdzie możecie zbudować inteligentnego asystenta pomagającego odkrywać kulturalne życie Krakowa. To pole do popisu dla umiejętności z zakresu NLP, systemów rekomendacyjnych, web scrapingu i budowy aplikacji AI. Udostępniamy startowy zestaw danych z kalendarza wydarzeń (ponad 700 pozycji!).
              </p>
              <div className={pageStyles.tagContainer}>
                <span className={`${pageStyles.tag} ${pageStyles.tagMagenta} challenge-tag`}>Python</span>
                <span className={`${pageStyles.tag} ${pageStyles.tagMagenta} challenge-tag`}>NLP</span>
                <span className={`${pageStyles.tag} ${pageStyles.tagMagenta} challenge-tag`}>Web Scraping</span>
                <span className={`${pageStyles.tag} ${pageStyles.tagMagenta} challenge-tag`}>Rekomendacje</span>
              </div>
            </div>
          </div>
          
          <div className={pageStyles.challengeConclusion}>
            <p className={pageStyles.paragraph}>
              Opanowanie tych technik to nie tylko świetny wpis do CV, ale realna inwestycja w umiejętności, które będą kształtować przyszłość technologii.
            </p>
          </div>
          
          {/* Collapsible Details Section */}
          <div className={pageStyles.detailsSection}>
            <button 
              className={`${pageStyles.detailsToggleBtn} ${detailsOpen ? pageStyles.detailsOpen : ''}`}
              onClick={toggleDetails}
            >
              <span>Dokładniejszy opis zadań</span>
              <FaChevronDown className={pageStyles.toggleIcon} />
            </button>
            
            <div className={`${pageStyles.detailsContent} ${detailsOpen ? pageStyles.detailsContentOpen : ''}`}>
              {/* Challenge 1 Details */}
              <div className={pageStyles.detailsChallenge}>
                <h3 className={pageStyles.detailsHeading}>Wyzwanie 1: Zoptymalizuj Krakowską Sieć Tramwajową – zostań architektem miejskiej mobilności!</h3>
                <p className={pageStyles.paragraph}>
                  <strong>Na czym polega wyzwanie?</strong> Wyobraź sobie, że możesz przeprojektować trasy tramwajowe w Krakowie, by były szybsze, wygodniejsze i docierały tam, gdzie są najbardziej potrzebne. Otrzymasz realne dane o torach, przystankach (z OpenStreetMap) i gęstości zaludnienia. Twoim zadaniem będzie użycie zaawansowanych technik AI i optymalizacji (programowanie liniowe, heurystyki, algorytmy ewolucyjne – wybór należy do Ciebie!), aby zaproponować najlepsze możliwe trasy dla istniejących lub nawet nowych linii, minimalizując np. czas przejazdu i maksymalizując pokrycie potrzeb mieszkańców.
                </p>
                <p className={pageStyles.paragraph}><strong>Dlaczego warto podjąć to wyzwanie?</strong></p>
                <ul className={pageStyles.detailsList}>
                  <li><strong>Rozwiń kluczowe umiejętności AI:</strong> Zmierzysz się z klasycznym, ale złożonym problemem optymalizacyjnym. To idealna okazja, by w praktyce zastosować i pogłębić wiedzę z zakresu algorytmów przeszukiwania grafów, programowania matematycznego (np. ILP), metaheurystyk czy analizy danych przestrzenznych.</li>
                  <li><strong>Pracuj z realnymi danymi miejskimi:</strong> Zapomnij o sztucznych datasetach. Tutaj dostaniesz prawdziwe dane dotyczące infrastruktury Krakowa – nauczysz się je przetwarzać, analizować i wizualizować.</li>
                  <li><strong>Stwórz imponujący projekt do portfolio:</strong> Rozwiązanie problemu optymalizacji trasy tramwajowej z wykorzystaniem AI to konkretny, zaawansowany technicznie projekt, który zaimponuje przyszłym pracodawcom.</li>
                  <li><strong>Miej realny wpływ:</strong> Twoje pomysły i kod mogą stać się inspiracją dla realnych ulepszeń w systemie transportu publicznego Krakowa. Poczuj satysfakcję z tworzenia rozwiązań dla społeczności!</li>
                </ul>
                <p className={pageStyles.paragraph}>
                  <strong>Technologie:</strong> Szansa na pracę z Pythonem, bibliotekami do analizy danych (Pandas, GeoPandas), wizualizacji (Matplotlib, Folium) oraz specjalistycznymi narzędziami do optymalizacji (np. PuLP, OR-Tools, Scipy).
                </p>
              </div>
              
              {/* Challenge 2 Details */}
              <div className={pageStyles.detailsChallenge}>
                <h3 className={pageStyles.detailsHeading}>Wyzwanie 2: Zbuduj Inteligentnego Asystenta Kulturalnego Krakowa – Pogadaj z miastem o swoich planach!</h3>
                <p className={pageStyles.paragraph}>
                  <strong>Problem:</strong> Kraków kipi od wydarzeń kulturalnych, naukowych i rozrywkowych! Jednak znalezienie wydarzeń, które naprawdę nas interesują, często wymaga przeszukiwania wielu różnych stron i kalendarzy. Jak ułatwić mieszkańcom (i sobie!) odkrywanie perełek dopasowanych do ich gustu? Chcemy odwrócić konwencję – niech to wydarzenia, dopasowane do Ciebie, znajdą drogę do Twojego kalendarza!
                </p>
                <p className={pageStyles.paragraph}>
                  <strong>Twoje Wyzwanie (Cel):</strong> Stwórz proaktywnego, inteligentnego Asystenta Kulturalnego Krakowa. Twoim celem jest zaprojektowanie narzędzia, które nie tylko agreguje informacje o wydarzeniach, ale przede wszystkim rozumie indywidualne preferencje użytkownika i w nienachalny, konwersacyjny sposób proponuje mu trafione wydarzenia z bazy, zanim ten zdąży o nie intensywnie szukać.
                </p>
                <p className={pageStyles.paragraph}><strong>Jak możesz do tego podejść? (Przykładowe kierunki):</strong></p>
                <ul className={pageStyles.detailsList}>
                  <li>Zaprojektuj innowacyjny sposób budowania profilu użytkownika (inteligentny formularz, quiz, analiza historii?).</li>
                  <li>Zbuduj interfejs konwersacyjny (chatbota), z którym można 'pogadać' o planach i uzyskać spersonalizowane propozycje.</li>
                  <li>Opracuj algorytmy rekomendacyjne trafnie dopasowujące wydarzenia do profilu.</li>
                  <li>Skup się na efektywnym pozyskiwaniu i unifikacji danych o wydarzeniach.</li>
                  <li>Pomyśl o mechanizmie proaktywnego powiadamiania.</li>
                </ul>
                <p className={pageStyles.paragraph}>
                  <strong>Opcjonalny Punkt Startowy (Nasz Dataset):</strong> Aby ułatwić Wam szybki start, przygotowaliśmy bazowy zestaw danych zawierający ponad 700 wydarzeń z portalu kulturalnego Krakowa. Możecie go użyć, ale równie dobrze możecie bazować na innych danych lub stworzyć własny mechanizm ich zbierania. Najważniejszy jest Wasz pomysł!
                </p>
                <p className={pageStyles.paragraph}>
                  <strong>Unleash Your Creativity!</strong> Kluczowa jest Wasza wizja odwrócenia konwencji – jak sprawić, by to wydarzenia znajdowały odbiorcę? Skupcie się na personalizacji, proaktywności i intuicyjnym interfejsie.
                </p>
                <p className={pageStyles.paragraph}>
                  <strong>Kluczowe umiejętności:</strong> Przetwarzanie Języka Naturalnego (NLP), Budowa Chatbotów, Systemy Rekomendacyjne, Projektowanie Profili Użytkownika, Web Scraping/API, Analiza Danych, Budowa Aplikacji AI.
                </p>
                <p className={pageStyles.paragraph}>
                  <strong>Technologie (Przykłady):</strong> Python, spaCy, NLTK, Transformers, Rasa/Dialogflow, Scikit-learn, Pandas, Beautiful Soup, Scrapy, Flask/FastAPI, bazy danych.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Parallax Sparkles */}
        <div
          className={`${pageStyles.sparkle} ${pageStyles.challengeSparkle1}`}
          ref={(el: HTMLDivElement | null) => {
            if (el) parallaxElements.current.push({ el, speed: 0.2 });
            return undefined;
          }}
        >
          <Image src="/assets/sparkle-blue.svg" alt="Sparkle" width={120} height={120} />
        </div>
        <div
          className={`${pageStyles.sparkle} ${pageStyles.challengeSparkle2}`}
          ref={(el: HTMLDivElement | null) => {
            if (el) parallaxElements.current.push({ el, speed: -0.3 });
            return undefined;
          }}
        >
          <Image src="/assets/sparkle-magenta.svg" alt="Sparkle" width={100} height={100} />
        </div>
      </section>

      {/* --- O Nas Section --- */}
      <section id="o-nas" className={`${pageStyles.section} ${pageStyles.darkGreyBg}`} ref={oNasSectionRef}>
        <div className={pageStyles.separatorBlue}></div>
        <div className={pageStyles.oNasContainer}>
            <div className={pageStyles.oNasLeft}>
                 <h2 className={pageStyles.sectionHeadingAlt}>POZNAJ ORGANIZATORÓW</h2>
                 <Image
                    src="https://res.cloudinary.com/dyux0lw71/image/upload/fl_preserve_transparency/v1744733653/logo_0.5x_o34a4o.jpg?_s=public-apps"
                    alt="AI Possibilities Lab Logo"
                    width={200}
                    height={200}
                    className={pageStyles.oNasLogo}
                 />
            </div>
            <div className={pageStyles.oNasRight}>
                 <h2 className={pageStyles.sectionHeadingAlt}>AI POSSIBILITIES LAB</h2>
                 <p className={pageStyles.projectDescriptions}>
                    Koło AI Possibilities Lab skupia osoby zafascynowane sztuczną inteligencją - studentów, absolwentów i entuzjastów technologii z WSEI i nie tylko. Działamy projektowo, rozwijając praktyczne umiejętności i realizując ambitne pomysły. Od narzędzi wspierających rynek pracy, przez platformy edukacyjne, po eksperymenty z przetwarzaniem języka - stale poszukujemy nowych wyzwań. Nasza struktura i zakres działania dynamicznie się rozwijają, a wizja kolejnych projektów klaruje się z tygodnia na tydzień.
                 </p>
                 <h3 className={pageStyles.subHeadingAlt}>Nasze Projekty</h3>
                 <div className={pageStyles.projectDescriptions}>
                    <p><strong>Jobs Project:</strong> Projekt narzędzia do zbierania i analizy danych z portali pracy w celu identyfikacji trendów i potrzeb rynku.</p>
                    <p><strong>ClassMade:</strong> Celem projektu jest zbadanie możliwości wykorzystania AI do automatyzacji i usprawnienia procesów edukacyjnych.</p>
                    <p><strong>KorpoTłumacz:</strong> Projekt KorpoTłumacza to narzędzie oparte na LLM, które ma na celu tłumaczenie języka korporacyjnego na bardziej zrozumiały.</p>
                 </div>
            </div>
        </div>
      </section>

      {/* --- Harmonogram Section --- */}
      <section id="harmonogram" className={`${pageStyles.section} ${pageStyles.blackBg}`} ref={harmonogramSectionRef}>
        <div className={pageStyles.separatorMagenta}></div>
        <h2 className={pageStyles.sectionHeading}>PLAN WYDARZENIA (30-31.05.2025)</h2>
        <ul className={pageStyles.timeline}>
          {timelineEvents.map((event, index) => (
            <li key={index} className={pageStyles.timelineItem}>
               {/* Add the node inside the item */}
              <div className={`${pageStyles.timelineNode} ${pageStyles[`node${event.nodeColor.charAt(0).toUpperCase() + event.nodeColor.slice(1)}`]}`}></div>
              <div className={pageStyles.timelineContent}>
                <span className={pageStyles.timelineTime}>{event.time}</span>
                <p>{event.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Nagrody & Partnerzy Section --- */}
      <section id="nagrody-partnerzy" className={`${pageStyles.section} ${pageStyles.darkGreyBg}`} ref={nagrodyPartnerzyRef}>
        <div className={pageStyles.separatorCyan}></div>
        <div className={`${pageStyles.nagrodyPartnerzyContainer} ${pageStyles.sectionContent}`}> 
            <div className={pageStyles.nagrodyColumn}>
                <h2 className={pageStyles.sectionHeadingAlt}>NAGRODY</h2>
                <div className={pageStyles.awardsList}> {/* New container for awards */}
                  <div className={pageStyles.awardItem}>
                    <h3>Zniżki na Czesne WSEI</h3>
                    <p>Znaczące zniżki dla najlepszych zespołów.</p>
                  </div>
                  <div className={pageStyles.awardItem}>
                    <h3>Nagrody Rzeczowe</h3>
                    <p>Atrakcyjne nagrody od partnerów.</p>
                  </div>
                  <div className={pageStyles.awardItem}>
                    <h3>Vouchery</h3>
                    <p>Ufundowane przez naszych partnerów.</p>
                  </div>
                </div>
            </div>
            <div className={pageStyles.partnerzyColumn}>
                 <h2 className={pageStyles.sectionHeadingAlt}>PARTNERZY</h2>
                 {/* Replace placeholder icons with actual partner logos */}
                 <div className={pageStyles.partnerLogos}>

                    <a href="https://wsei.edu.pl" target="_blank" rel="noopener noreferrer" className={pageStyles.partnerLogo}>
                      <Image
                        src="https://salewkrakowie.pl/wp-content/uploads/2017/02/logo-wsei-big.png"
                        alt="WSEI Logo"
                        width={180}
                        height={100}
                        className={pageStyles.partnerImage}
                      />
                    </a>
                    <a href="https://www.uber.com" target="_blank" rel="noopener noreferrer" className={pageStyles.partnerLogo}>
                      <Image
                        src="https://s23.q4cdn.com/407969754/files/doc_multimedia/Uber_Logo_Black_RGB.jpg"
                        alt="Uber Logo"
                        width={180}
                        height={100}
                        className={pageStyles.partnerImage}
                      />
                    </a>
                    <div className={pageStyles.contactPartner}>
                      <div className={pageStyles.contactPartnerContent}>
                        <h3>Chciałbyś wspomóc naszą inicjatywę?</h3>
                        <p>Napisz do nas!</p>
                        <a href="mailto:knai@wsei.edu.pl" className={pageStyles.contactEmail}>knai@wsei.edu.pl</a>
                      </div>
                    </div>
                 </div>
            </div>
        </div>
      </section>

      {/* --- Registration Form Section */}
      <section id="rejestracja" className={`${pageStyles.sectionPadding} ${pageStyles.registrationFormSection}`}>
        <div className={pageStyles.sectionContent}>
          <div className={pageStyles.registrationFormContainer}>
            <div className={pageStyles.formBackground}></div>
            <div className={pageStyles.formContent}>
              <h1 className={pageStyles.formHeading}>FORMULARZ REJESTRACYJNY</h1>
              <h2 className={pageStyles.formSubheading}>AI-KRAKHACK</h2>
              <p className={pageStyles.formDescription}>
                Wypełnij formularz rejestracyjny, aby wziąć udział w wydarzeniu! Stwórz super projekt, poznaj nowych ludzi.
              </p>
              <a 
                href="https://forms.office.com/Pages/ResponsePage.aspx?id=SmTtt7PRRkmF-TCjOAwmGF8O7yJ9tqJGvDUoXb8MCbxUMkFNRTYySFo1V1ZPRjg0TFFPTjQxN0Y2NC4u" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={pageStyles.formCtaButton}
              >
                WYPEŁNIJ FORMULARZ
              </a>
             
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className={pageStyles.footer} ref={footerRef}>
          <p className={pageStyles.footerText}>© 2025 AI Possibilities Lab, WSEI Krakow.</p>
          <Image
            src="https://res.cloudinary.com/dyux0lw71/image/upload/fl_preserve_transparency/v1744733653/logo_0.5x_o34a4o.jpg?_s=public-apps"
            alt="AI Possibilities Lab Logo Small"
            width={30}
            height={30}
            className={pageStyles.footerLogo}
          />
      </footer>
    </div>
  );
}
