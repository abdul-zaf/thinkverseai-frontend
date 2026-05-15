import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        const rect = servicesSection.getBoundingClientRect();
        // Show button if the top of the services section has passed (is above the viewport)
        // or if we want to show it after the section is fully passed.
        // Let's show it once the user has scrolled past the start of services.
        setIsVisible(rect.top < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          onClick={scrollToContact}
          className="fixed bottom-28 right-8 z-[90] bg-brutal-black text-white px-6 py-4 border-4 border-brutal-black shadow-[6px_6px_0px_0px_rgba(235,207,52,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3 group"
        >
          <Sparkles className="w-5 h-5 text-accent-gold group-hover:animate-pulse" />
          <span className="font-display uppercase text-sm tracking-wider">Start Your Project</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
