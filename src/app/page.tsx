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
              src="https://res.cloudinary.com/dyux0lw71/image/upload/fl_preserve_transparency/v1744733653/main-text-poster-blacked_0.25x_wkn6tb.jpg?_s=public-apps"
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
          
          <div className={pageStyles.challengeContainer}>
            {/* Block 1: Tramwaje */}
            <div className={pageStyles.challengeBlock + " challenge-block"}>
              <div className={pageStyles.challengeIcon + " challenge-icon"}>
                <FaTrainSubway size={60} color="#00e5ff" />
              </div>
              <h3 className={pageStyles.challengeHeading + " challenge-heading"}>Wyzwanie 1: Zoptymalizuj Krakowską Sieć Tramwajową</h3>
              <p className={pageStyles.paragraphSmall + " challenge-text"}>
                Na czym polega wyzwanie? Wyobraź sobie Kraków z jeszcze płynniejszą komunikacją miejską! Twoim zadaniem będzie analiza danych o ruchu tramwajowym i zaproponowanie optymalizacji tras lub rozkładów jazdy, aby zminimalizować czas podróży i zapewnić jak najlepsze pokrycie potrzeb mieszkańców. Dlaczego warto? Rozwiń kluczowe umiejętności w analizie danych przestrzennych i optymalizacji, pracując nad realnym problemem miejskim i poczuj satysfakcję z tworzenia rozwiązań dla społeczności!
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
                Na czym polega wyzwanie? Koncerty, wystawy, spektakle – Kraków tętni życiem kulturalnym! Stwórz inteligentnego chatbota lub system rekomendacji, który pomoże mieszkańcom i turystom odkrywać najciekawsze wydarzenia, dostarczając spersonalizowane propozycje dopasowane do jego zainteresowań. Dlaczego warto? Zanurz się w NLP i systemach rekomendacyjnych, ucząc się jak przetwarzać tekst, budować modele i tworzyć angażujące interfejsy. To szansa na zbudowanie kompletnego projektu AI – od pozyskania danych po interfejs użytkownika.
              </p>
              <div className={pageStyles.tagContainer}>
                <span className={`${pageStyles.tag} ${pageStyles.tagMagenta} challenge-tag`}>Python</span>
                <span className={`${pageStyles.tag} ${pageStyles.tagMagenta} challenge-tag`}>NLP</span>
                <span className={`${pageStyles.tag} ${pageStyles.tagMagenta} challenge-tag`}>Web Scraping</span>
                <span className={`${pageStyles.tag} ${pageStyles.tagMagenta} challenge-tag`}>Rekomendacje</span>
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
        <h2 className={pageStyles.sectionHeading}>PLAN WYDARZENIA (24-25.05.2025)</h2>
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
                 {/* Ensure partner logos section is styled appropriately */}
                 <div className={pageStyles.partnerLogos}>
                    {/* Placeholders for now */}
                    <div className={pageStyles.partnerPlaceholder}>
                      <FaMapLocationDot size={60} color="var(--white)" />
                    </div>
                    <div className={pageStyles.partnerPlaceholder}>
                      <FaComments size={60} color="var(--white)" />
                    </div>
                    <div className={pageStyles.partnerPlaceholder}>
                      <FaBrain size={60} color="var(--white)" />
                    </div>
                 </div>
            </div>
        </div>
      </section>

      {/* --- Rejestracja Section --- */}
      <section id="rejestracja" className={`${pageStyles.section} ${pageStyles.blackBg}`} ref={rejestracjaSectionRef}>
        <div className={pageStyles.separatorBlue}></div>
        <h2 className={pageStyles.sectionHeading}>ZAREJESTRUJ SWÓJ ZESPÓŁ!</h2>
        <p className={pageStyles.paragraph}>Zbierz ekipę (2-4 osoby) i dołącz do nas! Wypełnij formularz poniżej. Liczba miejsc ograniczona!</p>
        <div className={pageStyles.registrationFormPlaceholder}>
           [ Tu zostanie osadzony formularz Microsoft Forms ]
        </div>
         {/* Parallax Sparkles */}
        <div ref={registrationSparkleRef1} className={`${pageStyles.sparkle} ${pageStyles.registrationSparkle1}`}>
            <Image src="/assets/stars@0.1x.png" alt="Sparkle" width={15} height={15} />
        </div>
        <div ref={registrationSparkleRef2} className={`${pageStyles.sparkle} ${pageStyles.registrationSparkle2}`}>
            <Image src="/assets/stars@0.1x.png" alt="Sparkle" width={22} height={22} />
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
