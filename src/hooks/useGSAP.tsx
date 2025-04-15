import { useEffect } from 'react';

// Define the type for the refs object
interface AnimationRefs {
  navbarRef: React.RefObject<HTMLDivElement | null>;
  heroSectionRef: React.RefObject<HTMLElement | null>;
  heroSparkleRef1: React.RefObject<HTMLDivElement | null>;
  heroSparkleRef2: React.RefObject<HTMLDivElement | null>;
  heroSliderRef: React.RefObject<HTMLDivElement | null>;
  posterRef: React.RefObject<HTMLDivElement | null>;
  hackathonSectionRef: React.RefObject<HTMLElement | null>;
  wyzwaniaSectionRef: React.RefObject<HTMLElement | null>;
  oNasSectionRef: React.RefObject<HTMLElement | null>;
  harmonogramSectionRef: React.RefObject<HTMLElement | null>;
  nagrodyPartnerzyRef: React.RefObject<HTMLElement | null>;
  rejestracjaSectionRef: React.RefObject<HTMLElement | null>;
  footerRef: React.RefObject<HTMLElement | null>;
  parallaxElements: React.RefObject<any[]>;
}

export function useGSAP(isClient: boolean, refs: AnimationRefs) {
  useEffect(() => {
    // Only run on client and when ready
    if (!isClient) return;

    // Dynamically import GSAP and ScrollTrigger
    const initGSAP = async () => {
      const gsapModule = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      
      const gsap = gsapModule.default;
      
      // Register the plugin
      gsap.registerPlugin(ScrollTrigger);
      
      // Performance optimizations
      gsap.config({
        autoSleep: 60,
        force3D: true,
        nullTargetWarn: false,
      });
      
      // Global defaults
      gsap.defaults({
        ease: "power3.out",
        duration: 0.8,
      });
      
      // Create a timeline for initial animations
      const masterTl = gsap.timeline({
        defaults: {
          ease: "power3.out",
          duration: 0.8,
        }
      });
      
      // Destructure refs for easier use
      const {
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
        footerRef
      } = refs;
      
      // Navbar animation
      if (navbarRef.current) {
        masterTl.fromTo(navbarRef.current, 
          { y: -100, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          0
        );
        
        // Navbar links stagger
        masterTl.fromTo(
          ".navLink",
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.4 },
          0.3
        );
      }
      
      // Hero section animation
      if (heroSectionRef.current) {
        // Background
        masterTl.fromTo(
          ".heroBackground",
          { opacity: 0 },
          { opacity: 1, duration: 1.2 },
          0.8
        );
        
        // Hero content
        masterTl.fromTo(
          [heroSliderRef.current, posterRef.current],
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.2 },
          0.4
        );
        
        // Sparkles
        masterTl.fromTo(
          [heroSparkleRef1.current, heroSparkleRef2.current],
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.3, duration: 1 },
          0.8
        );
        
        // CTA button
        masterTl.fromTo(
          ".ctaButton",
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5 },
          1.2
        );
      }
      
      // Section animations on scroll
      const sections = [
        { ref: hackathonSectionRef, selector: "#o-hackathonie" },
        { ref: wyzwaniaSectionRef, selector: "#wyzwania" },
        { ref: oNasSectionRef, selector: "#o-nas" },
        { ref: harmonogramSectionRef, selector: "#harmonogram" },
        { ref: nagrodyPartnerzyRef, selector: "#nagrody-partnerzy" },
        { ref: rejestracjaSectionRef, selector: "#rejestracja" },
      ];
      
      sections.forEach(section => {
        if (!section.ref.current) return;
        
        // Section heading animation
        gsap.fromTo(
          `${section.selector} .sectionHeading, ${section.selector} .sectionHeadingAlt, ${section.selector} .challengeMainHeading`,
          { y: 50, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.7,
            scrollTrigger: {
              trigger: section.ref.current,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          }
        );
        
        // Separator animation
        gsap.fromTo(
          `${section.selector} .separatorCyan, ${section.selector} .separatorMagenta, ${section.selector} .separatorBlue`,
          { width: 0 },
          { 
            width: "100%", 
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section.ref.current,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
        
        // Content animations based on section type
        if (section.selector === "#o-hackathonie") {
          // Bullet points
          gsap.fromTo(
            `${section.selector} .bulletItem`,
            { y: 30, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              stagger: 0.1,
              duration: 0.5,
              scrollTrigger: {
                trigger: section.ref.current,
                start: "top 75%",
                toggleActions: "play none none none"
              }
            }
          );
          
          // Add text reveal animation for paragraphs
          const paragraphs = document.querySelectorAll(`${section.selector} .paragraph`);
          paragraphs.forEach(paragraph => {
            // Create a clip-path reveal animation
            gsap.fromTo(
              paragraph,
              { 
                clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
                opacity: 0.3
              },
              { 
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                opacity: 1,
                duration: 1.2,
                ease: "power4.inOut",
                scrollTrigger: {
                  trigger: paragraph,
                  start: "top 85%",
                  toggleActions: "play none none none"
                }
              }
            );
          });
        }
        
        if (section.selector === "#wyzwania") {
          // Animate the background map first
          gsap.fromTo(
            `${section.selector} .mapBackground img`,
            { opacity: 0 },
            { 
              opacity: 0.7, 
              duration: 1.5,
              ease: "power2.inOut",
              scrollTrigger: {
                trigger: section.ref.current,
                start: "top 80%",
                toggleActions: "play none none none"
              }
            }
          );
          
          // Challenge blocks - staggered appearance with a more dramatic effect
          gsap.fromTo(
            `${section.selector} .challenge-block`,
            { y: 80, opacity: 0, scale: 0.9 },
            { 
              y: 0, 
              opacity: 1,
              scale: 1, 
              stagger: 0.2,
              duration: 0.8,
              ease: "back.out(1.2)",
              scrollTrigger: {
                trigger: section.ref.current,
                start: "top 70%",
                toggleActions: "play none none none"
              }
            }
          );
          
          // Challenge icons with bounce effect
          gsap.fromTo(
            `${section.selector} .challenge-icon`,
            { y: -30, opacity: 0, scale: 0.5 },
            { 
              y: 0, 
              opacity: 1,
              scale: 1, 
              stagger: 0.2,
              duration: 0.6,
              delay: 0.3,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section.ref.current,
                start: "top 70%",
                toggleActions: "play none none none"
              }
            }
          );
          
          // Challenge headings with fade effect
          gsap.fromTo(
            `${section.selector} .challenge-heading`,
            { y: -20, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              stagger: 0.2,
              delay: 0.5,
              duration: 0.5,
              scrollTrigger: {
                trigger: section.ref.current,
                start: "top 70%",
                toggleActions: "play none none none"
              }
            }
          );
          
          // Challenge text paragraphs with fade effect
          gsap.fromTo(
            `${section.selector} .challenge-text`,
            { opacity: 0 },
            { 
              opacity: 1, 
              stagger: 0.2,
              delay: 0.6,
              duration: 0.7,
              scrollTrigger: {
                trigger: section.ref.current,
                start: "top 70%",
                toggleActions: "play none none none"
              }
            }
          );
          
          // Tags with pop effect
          gsap.fromTo(
            `${section.selector} .challenge-tag`,
            { scale: 0, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1, 
              stagger: 0.03,
              delay: 0.8,
              duration: 0.4,
              ease: "back.out(3)",
              scrollTrigger: {
                trigger: section.ref.current,
                start: "top 70%",
                toggleActions: "play none none none"
              }
            }
          );
          
          // Sparkle elements with custom animation
          gsap.fromTo(
            `${section.selector} .sparkle`,
            { scale: 0, opacity: 0, rotation: -45 },
            { 
              scale: 1, 
              opacity: 1, 
              rotation: 0,
              stagger: 0.3,
              duration: 1,
              ease: "elastic.out(1, 0.3)",
              scrollTrigger: {
                trigger: section.ref.current,
                start: "top 70%",
                toggleActions: "play none none none"
              }
            }
          );
        }
        
        if (section.selector === "#harmonogram") {
          // Timeline items
          gsap.fromTo(
            `${section.selector} .timelineItem`,
            { x: -50, opacity: 0 },
            { 
              x: 0, 
              opacity: 1, 
              stagger: 0.15,
              duration: 0.6,
              scrollTrigger: {
                trigger: section.ref.current,
                start: "top 75%",
                toggleActions: "play none none none"
              }
            }
          );
        }
        
        if (section.selector === "#nagrody-partnerzy") {
          // Awards and partners
          gsap.fromTo(
            `${section.selector} .awardItem, ${section.selector} .partnerPlaceholder`,
            { y: 30, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              stagger: 0.15,
              duration: 0.5,
              scrollTrigger: {
                trigger: section.ref.current,
                start: "top 75%",
                toggleActions: "play none none none"
              }
            }
          );
        }
      });
      
      // Footer animation
      if (footerRef.current) {
        gsap.fromTo(
          footerRef.current,
          { y: 20, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.5,
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 95%",
              toggleActions: "play none none none"
            }
          }
        );
      }
      
      // Create a dynamic navbar behavior
      const navbarAnimation = gsap.to(navbarRef.current, {
        backgroundColor: 'rgba(10, 10, 15, 0.95)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        height: '68px',
        paddingTop: '5px',
        paddingBottom: '5px',
        duration: 0.3,
        paused: true,
        ease: "power2.out"
      });
      
      // Function to handle scroll
      const handleScroll = () => {
        if (window.scrollY > 80) {
          navbarAnimation.play();
        } else {
          navbarAnimation.reverse();
        }
      };
      
      // Add scroll listener
      window.addEventListener('scroll', handleScroll);
      
      // Return cleanup function
      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        window.removeEventListener('scroll', handleScroll);
      };
    };
    
    // Initialize
    initGSAP();
    
  }, [isClient, refs]); // Only re-run if isClient changes
} 