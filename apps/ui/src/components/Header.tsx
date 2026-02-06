import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  isFooterMode?: boolean;
}

export function Header({ isFooterMode = false }: HeaderProps) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/demo', label: 'Demo' },
    { href: '/#accessibility', label: 'Accessibility' },
    { href: '/privacy', label: 'Privacy' },
  ];

  const containerClasses = isFooterMode
    ? 'bg-background border-t border-border py-8'
    : `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`;

  const innerClasses = isFooterMode
    ? 'flex flex-col md:flex-row items-center justify-between gap-6'
    : 'flex items-center justify-between h-16 md:h-20';

  return (
    <header className={containerClasses}>
      <div className={`container mx-auto px-4 md:px-6 ${innerClasses}`}>
        {/* Logo */}
        <Link 
          to="/" 
          className="text-xl md:text-2xl font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          NavAI
        </Link>

        {/* Nav Links */}
        <nav className={`flex items-center ${isFooterMode ? 'flex-wrap justify-center' : ''} gap-1 md:gap-2`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                location.pathname === link.href ? 'text-foreground' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className={`flex items-center gap-3 ${isFooterMode ? 'mt-4 md:mt-0' : ''}`}>
          <Link
            to="/demo"
            className="btn-pill-primary text-sm"
          >
            Try Demo
          </Link>
          <a
            href="#"
            className="btn-pill-secondary text-sm hidden sm:inline-flex"
            onClick={(e) => {
              e.preventDefault();
              alert('Extension coming soon!');
            }}
          >
            Install Extension
          </a>
        </div>
      </div>
    </header>
  );
}

export function MorphingHeader() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;
      
      // Check if we're near the bottom (within 100px)
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Header />
          </motion.div>
        )}
      </AnimatePresence>
      
      {isAtBottom && <Header isFooterMode />}
    </>
  );
}
