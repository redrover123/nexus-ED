import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { GoArrowUpRight } from 'react-icons/go';
import { LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import './CardNav.css';

interface NavItem {
  label: string;
  href: string;
}

interface NavCard {
  title: string;
  items: NavItem[];
}

interface CardNavProps {
  items: NavCard[];
  className?: string;
}

export const CardNav = ({ items, className = '' }: CardNavProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [, setLocation] = useLocation();

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
    if (contentEl) {
      const topBar = 60;
      const padding = 16;
      const contentHeight = contentEl.scrollHeight;
      return topBar + contentHeight + padding;
    }

    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease: 'power3.out' });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.08 }, '-=0.1');

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) tlRef.current = newTl;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;

    if (!isExpanded) {
      setIsExpanded(true);
      tl.play(0);
    } else {
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const handleLinkClick = (href: string) => {
    setLocation(href);
    toggleMenu();
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? 'open' : ''}`}
      >
        <div className="card-nav-top">
          <div className="card-nav-hamburger" onClick={toggleMenu} data-testid="button-nav-toggle">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor">
              {isExpanded ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" strokeWidth="2" />
                  <line x1="16" y1="4" x2="4" y2="16" strokeWidth="2" />
                </>
              ) : (
                <>
                  <line x1="3" y1="5" x2="17" y2="5" strokeWidth="2" />
                  <line x1="3" y1="10" x2="17" y2="10" strokeWidth="2" />
                  <line x1="3" y1="15" x2="17" y2="15" strokeWidth="2" />
                </>
              )}
            </svg>
          </div>
          <button 
            onClick={handleLogout}
            className="card-nav-logout"
            data-testid="button-logout"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="card-nav-content">
          {items.map((card, cardIndex) => (
            <div
              key={cardIndex}
              ref={(el) => {
                if (el) cardsRef.current[cardIndex] = el;
              }}
              className="nav-card"
            >
              <div className="nav-card-title">{card.title}</div>
              <div className="nav-card-links">
                {card.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleLinkClick(item.href)}
                    className="nav-link"
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span>{item.label}</span>
                    <GoArrowUpRight className="nav-link-arrow" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};
