'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { useLenis } from '@studio-freight/react-lenis';
import styles from './page.module.css';
// Import React Icons
import { FaBrain, FaDatabase, FaCode, FaChartLine, FaUsers, FaTrophy } from 'react-icons/fa';
import { FaMapLocationDot, FaTrainSubway, FaComments } from 'react-icons/fa6';
// Import timeline data
import timelineEvents from '../data/timelineEvents.json';
// Import parallax background component
import ParallaxBackground from '../components/ParallaxBackground';

export default function Home() {
  // Refs for parallax elements
  const heroSparkleRef1 = useRef<HTMLDivElement>(null);
  const heroSparkleRef2 = useRef<HTMLDivElement>(null);
  const challengeSparkleRef1 = useRef<HTMLDivElement>(null);
  const challengeSparkleRef2 = useRef<HTMLDivElement>(null);
  const registrationSparkleRef1 = useRef<HTMLDivElement>(null);
  const registrationSparkleRef2 = useRef<HTMLDivElement>(null);

  // Parallax effect using useLenis
  useLenis(({ scroll }) => {
    // Apply parallax effect (adjust multiplier for different speeds)
    const applyParallax = (ref: React.RefObject<HTMLDivElement | null>, multiplier: number) => {
      if (ref.current) {
        ref.current.style.transform = `translateY(${scroll * multiplier}px)`;
      }
    };

    applyParallax(heroSparkleRef1, 0.2);
    applyParallax(heroSparkleRef2, -0.15);
    applyParallax(challengeSparkleRef1, 0.1);
    applyParallax(challengeSparkleRef2, -0.1);
    applyParallax(registrationSparkleRef1, 0.05);
    applyParallax(registrationSparkleRef2, -0.08);
  });

  // Function to scroll to a specific section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* --- Sticky Navbar --- */}
      <nav className={styles.navbar}>
        <div className={styles.navbarContent}>
          <Image
            src="/assets/krak-hack-text.png"
            alt="AI Krak Hack Logo"
            width={150}
            height={30}
            className={styles.navbarLogo}
          />
          <div className={styles.navbarLinks}>
            <button onClick={() => scrollToSection('o-hackathonie')}>O Hackathonie</button>
            <button onClick={() => scrollToSection('wyzwania')}>Wyzwania</button>
            <button onClick={() => scrollToSection('o-nas')}>O Nas</button>
            <button onClick={() => scrollToSection('harmonogram')}>Harmonogram</button>
            <button onClick={() => scrollToSection('rejestracja')}>Rejestracja</button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header id="hero" className={styles.heroSection}>
        {/* Use Image Background with Parallax */}
        <ParallaxBackground 
          imageSrc="/assets/map-track-background.png" 
          alt="Krakow Map Background" 
          verticalSpeed={0.1}
          opacity={0.15}
          blurAmount={2}
        />
        
        <div className={styles.heroContent}>
          <Image
            src="/assets/main-text-poster-blacked@0.25x.png"
            alt="AI Krak Hack Main Visual"
            width={600}
            height={450}
            className={styles.heroVisual}
            priority
          />
          {/* Parallax Sparkles */}
          <div ref={heroSparkleRef1} className={`${styles.sparkle} ${styles.heroSparkle1}`}>
            <Image src="/assets/stars@0.1x.png" alt="Sparkle" width={100} height={100} />
          </div>
          <div ref={heroSparkleRef2} className={`${styles.sparkle} ${styles.heroSparkle2}`}>
            <Image src="/assets/talks-1@0.1x.png" alt="Talks" width={120} height={120} />
          </div>

          <button className={styles.ctaButton} onClick={() => scrollToSection('rejestracja')}>
            ZAREJESTRUJ SIĘ!
          </button>
        </div>
      </header>

      {/* --- O Hackathonie Section --- */}
      <section id="o-hackathonie" className={`${styles.section} ${styles.darkGreyBg}`}>
        <div className={styles.separatorMagenta}></div>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionHeading}>CZYM JEST AI KRAK HACK?</h2>
          <p className={styles.paragraph}>
            Cześć! Jesteśmy Kołem Naukowym AI Possibilities Lab z WSEI w Krakowie. Naszą misją jest eksploracja możliwości sztucznej inteligencji i przekuwanie jej potencjału w praktyczne rozwiązania. Wierzymy, że technologia może realnie przyczynić się do ulepszenia naszego miasta! AI Krak Hack to Twoja szansa, by wyjść poza teorię i zmierzyć się z realnymi wyzwaniami Krakowa, wykorzystując najnowsze narzędzia AI. To nie tylko konkurs – to okazja do nauki, networkingu i stworzenia czegoś, co będzie świetnie wyglądać w Twoim portfolio!
          </p>
          <h3 className={styles.subHeading}>DLACZEGO WARTO?</h3>
          <div className={styles.bulletGrid}>
            <div className={styles.bulletItem}>
              <FaBrain className={styles.icon} color="#00a4ff" size={24} />
              <span>Rozwój Umiejętności AI</span>
            </div>
            <div className={styles.bulletItem}>
              <FaDatabase className={styles.icon} color="#00e5ff" size={24} />
              <span>Realne Dane Miejskie</span>
            </div>
            <div className={styles.bulletItem}>
              <FaCode className={styles.icon} color="#ff00ff" size={24} />
              <span>Projekt do Portfolio</span>
            </div>
            <div className={styles.bulletItem}>
              <FaChartLine className={styles.icon} color="#00a4ff" size={24} />
              <span>Realny Wpływ</span>
            </div>
            <div className={styles.bulletItem}>
              <FaUsers className={styles.icon} color="#00e5ff" size={24} />
              <span>Networking</span>
            </div>
             <div className={styles.bulletItem}>
              <FaTrophy className={styles.icon} color="#ff00ff" size={24} />
              <span>Nagrody</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Wyzwania Section --- */}
      <section id="wyzwania" className={`${styles.section} ${styles.blackBg}`}>
        <div className={styles.separatorCyan}></div>
        <h2 className={styles.sectionHeading}>PODEJMIJ WYZWANIE</h2>
        <div className={styles.challengeContainer}>
          {/* Block 1: Tramwaje */}
          <div className={styles.challengeBlock}>
             <div className={styles.challengeBackgroundMap}>
               <Image 
                 src="/assets/map-track-background.png"
                 alt="Krakow Routes Map"
                 fill
                 style={{ objectFit: 'cover', opacity: 0.1 }}
               />
             </div>
             <div className={styles.challengeIcon}>
                <FaTrainSubway size={60} color="#00e5ff" />
             </div>
             <h3 className={styles.challengeHeading}>Wyzwanie 1: Zoptymalizuj Krakowską Sieć Tramwajową</h3>
             <p className={styles.paragraphSmall}>
               Na czym polega wyzwanie? Wyobraź sobie Kraków z jeszcze płynniejszą komunikacją miejską! Twoim zadaniem będzie analiza danych o ruchu tramwajowym i zaproponowanie optymalizacji tras lub rozkładów jazdy, aby zminimalizować czas podróży i zapewnić jak najlepsze pokrycie potrzeb mieszkańców. Dlaczego warto? Rozwiń kluczowe umiejętności w analizie danych przestrzennych i optymalizacji, pracując nad realnym problemem miejskim i poczuj satysfakcję z tworzenia rozwiązań dla społeczności!
             </p>
             <div className={styles.tagContainer}>
                <span className={`${styles.tag} ${styles.tagCyan}`}>Python</span>
                <span className={`${styles.tag} ${styles.tagCyan}`}>GeoPandas</span>
                <span className={`${styles.tag} ${styles.tagCyan}`}>Optymalizacja</span>
                <span className={`${styles.tag} ${styles.tagCyan}`}>Dane Miejskie</span>
             </div>
          </div>
          {/* Block 2: Asystent Kulturalny */}
           <div className={styles.challengeBlock}>
             <div className={styles.challengeBackgroundMap}>
               <Image 
                 src="/assets/map-background.png"
                 alt="Krakow Map Background"
                 fill
                 style={{ objectFit: 'cover', opacity: 0.1 }}
               />
             </div>
             <div className={styles.challengeIcon}>
                <FaComments size={60} color="#ff00ff" />
             </div>
             <h3 className={styles.challengeHeading}>Wyzwanie 2: Zbuduj Inteligentnego Asystenta Kulturalnego Krakowa</h3>
             <p className={styles.paragraphSmall}>
               Na czym polega wyzwanie? Koncerty, wystawy, spektakle – Kraków tętni życiem kulturalnym! Stwórz inteligentnego chatbota lub system rekomendacji, który pomoże mieszkańcom i turystom odkrywać najciekawsze wydarzenia, dostarczając spersonalizowane propozycje dopasowane do jego zainteresowań. Dlaczego warto? Zanurz się w NLP i systemach rekomendacyjnych, ucząc się jak przetwarzać tekst, budować modele i tworzyć angażujące interfejsy. To szansa na zbudowanie kompletnego projektu AI – od pozyskania danych po interfejs użytkownika.
             </p>
             <div className={styles.tagContainer}>
               <span className={`${styles.tag} ${styles.tagMagenta}`}>Python</span>
               <span className={`${styles.tag} ${styles.tagMagenta}`}>NLP</span>
               <span className={`${styles.tag} ${styles.tagMagenta}`}>Web Scraping</span>
               <span className={`${styles.tag} ${styles.tagMagenta}`}>Rekomendacje</span>
             </div>
           </div>
        </div>
        <div ref={challengeSparkleRef1} className={`${styles.sparkle} ${styles.challengeSparkle1}`}>
            <Image src="/assets/stars@0.1x.png" alt="Sparkle" width={20} height={20} />
        </div>
        <div ref={challengeSparkleRef2} className={`${styles.sparkle} ${styles.challengeSparkle2}`}>
            <Image src="/assets/stars@0.1x.png" alt="Sparkle" width={18} height={18} />
        </div>
      </section>

      {/* --- O Nas Section --- */}
      <section id="o-nas" className={`${styles.section} ${styles.darkGreyBg}`}>
        <div className={styles.separatorBlue}></div>
        <div className={styles.oNasContainer}>
            <div className={styles.oNasLeft}>
                 <h2 className={styles.sectionHeadingAlt}>POZNAJ ORGANIZATORÓW</h2>
                 <Image
                    src="/assets/logo@0.25x.png"
                    alt="AI Possibilities Lab Logo"
                    width={200}
                    height={200}
                    className={styles.oNasLogo}
                 />
            </div>
            <div className={styles.oNasRight}>
                 <h2 className={styles.sectionHeadingAlt}>AI POSSIBILITIES LAB</h2>
                 <p className={styles.paragraph}>
                    Koło AI Possibilities Lab skupia osoby zafascynowane sztuczną inteligencją - studentów, absolwentów i entuzjastów technologii z WSEI i nie tylko. Działamy projektowo, rozwijając praktyczne umiejętności i realizując ambitne pomysły. Od narzędzi wspierających rynek pracy, przez platformy edukacyjne, po eksperymenty z przetwarzaniem języka - stale poszukujemy nowych wyzwań. Nasza struktura i zakres działania dynamicznie się rozwijają, a wizja kolejnych projektów klaruje się z tygodnia na tydzień.
                 </p>
                 <h3 className={styles.subHeadingAlt}>Nasze Projekty</h3>
                 <div className={styles.projectDescriptions}>
                    <p><strong>Jobs Project:</strong> Projekt narzędzia do zbierania i analizy danych z portali pracy w celu identyfikacji trendów i potrzeb rynku.</p>
                    <p><strong>ClassMade:</strong> Celem projektu jest zbadanie możliwości wykorzystania AI do automatyzacji i usprawnienia procesów edukacyjnych.</p>
                    <p><strong>KorpoTłumacz:</strong> Projekt KorpoTłumacza to narzędzie oparte na LLM, które ma na celu tłumaczenie języka korporacyjnego na bardziej zrozumiały.</p>
                 </div>
            </div>
        </div>
      </section>

      {/* --- Harmonogram Section --- */}
      <section id="harmonogram" className={`${styles.section} ${styles.blackBg}`}>
        <div className={styles.separatorMagenta}></div>
        <h2 className={styles.sectionHeading}>PLAN WYDARZENIA (24-25.05.2025)</h2>
        <ul className={styles.timeline}>
          {timelineEvents.map((event, index) => (
            <li key={index} className={styles.timelineItem}>
               {/* Add the node inside the item */}
              <div className={`${styles.timelineNode} ${styles[`node${event.nodeColor.charAt(0).toUpperCase() + event.nodeColor.slice(1)}`]}`}></div>
              <div className={styles.timelineContent}>
                <span className={styles.timelineTime}>{event.time}</span>
                <p>{event.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Nagrody & Partnerzy Section --- */}
      <section id="nagrody-partnerzy" className={`${styles.section} ${styles.darkGreyBg}`}>
        <div className={styles.separatorCyan}></div>
        <div className={`${styles.nagrodyPartnerzyContainer} ${styles.sectionContent}`}> 
            <div className={styles.nagrodyColumn}>
                <h2 className={styles.sectionHeadingAlt}>NAGRODY</h2>
                <div className={styles.awardsList}> {/* New container for awards */}
                  <div className={styles.awardItem}>
                    <h3>Zniżki na Czesne WSEI</h3>
                    <p>Znaczące zniżki dla najlepszych zespołów.</p>
                  </div>
                  <div className={styles.awardItem}>
                    <h3>Nagrody Rzeczowe</h3>
                    <p>Atrakcyjne nagrody od partnerów.</p>
                  </div>
                  <div className={styles.awardItem}>
                    <h3>Vouchery</h3>
                    <p>Ufundowane przez naszych partnerów.</p>
                  </div>
                </div>
            </div>
            <div className={styles.partnerzyColumn}>
                 <h2 className={styles.sectionHeadingAlt}>PARTNERZY</h2>
                 {/* Ensure partner logos section is styled appropriately */}
                 <div className={styles.partnerLogos}>
                    {/* Placeholders for now */}
                    <div className={styles.partnerPlaceholder}>
                      <FaMapLocationDot size={60} color="var(--white)" />
                    </div>
                    <div className={styles.partnerPlaceholder}>
                      <FaComments size={60} color="var(--white)" />
                    </div>
                    <div className={styles.partnerPlaceholder}>
                      <FaBrain size={60} color="var(--white)" />
                    </div>
                 </div>
            </div>
        </div>
      </section>

      {/* --- Rejestracja Section --- */}
      <section id="rejestracja" className={`${styles.section} ${styles.blackBg}`}>
        <div className={styles.separatorBlue}></div>
        <h2 className={styles.sectionHeading}>ZAREJESTRUJ SWÓJ ZESPÓŁ!</h2>
        <p className={styles.paragraph}>Zbierz ekipę (2-4 osoby) i dołącz do nas! Wypełnij formularz poniżej. Liczba miejsc ograniczona!</p>
        <div className={styles.registrationFormPlaceholder}>
           [ Tu zostanie osadzony formularz Microsoft Forms ]
        </div>
         {/* Parallax Sparkles */}
        <div ref={registrationSparkleRef1} className={`${styles.sparkle} ${styles.registrationSparkle1}`}>
            <Image src="/assets/stars@0.1x.png" alt="Sparkle" width={15} height={15} />
        </div>
        <div ref={registrationSparkleRef2} className={`${styles.sparkle} ${styles.registrationSparkle2}`}>
            <Image src="/assets/stars@0.1x.png" alt="Sparkle" width={22} height={22} />
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className={styles.footer}>
          <p className={styles.footerText}>© 2025 AI Possibilities Lab, WSEI Krakow.</p>
          <Image
            src="/assets/logo@0.25x.png"
            alt="AI Possibilities Lab Logo Small"
            width={30}
            height={30}
            className={styles.footerLogo}
          />
      </footer>
    </div>
  );
}
