import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TESTIMONIALS } from '../constants';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    const interval = setInterval(next, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gallery-white py-32 px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <h2 className="font-display text-5xl md:text-7xl text-brutal-black uppercase leading-none">
            Client <br /> <span className="text-accent-gold">Success</span>
          </h2>
          <div className="flex gap-4">
            <button 
              onClick={prev}
              className="w-16 h-16 bg-white border-2 border-brutal-black flex items-center justify-center hover:bg-accent-gold group transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
              <ChevronLeft className="w-8 h-8 text-accent-gold group-hover:text-brutal-black transition-colors" />
            </button>
            <button 
              onClick={next}
              className="w-16 h-16 bg-white border-2 border-brutal-black flex items-center justify-center hover:bg-accent-gold group transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
              <ChevronRight className="w-8 h-8 text-accent-gold group-hover:text-brutal-black transition-colors" />
            </button>
          </div>
        </div>

        <div className="relative h-[400px] md:h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col md:flex-row gap-12 items-center md:items-start"
            >
              <div className="relative shrink-0">
                <div className="w-32 h-32 border-4 border-accent-gold overflow-hidden shadow-[8px_8px_0px_0px_rgba(235,207,52,0.3)]">
                  <img 
                    src={TESTIMONIALS[currentIndex].avatar} 
                    alt={TESTIMONIALS[currentIndex].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Quote className="absolute -bottom-4 -right-4 w-12 h-12 text-accent-gold fill-accent-gold" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <p className="text-2xl md:text-4xl text-brutal-black font-medium leading-tight mb-8 italic">
                  "{TESTIMONIALS[currentIndex].quote}"
                </p>
                <div>
                  <h4 className="font-display text-2xl text-accent-gold uppercase tracking-wider">
                    {TESTIMONIALS[currentIndex].name}
                  </h4>
                  <p className="font-mono text-sm text-brutal-black/50 uppercase tracking-widest">
                    {TESTIMONIALS[currentIndex].company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress indicators */}
        <div className="flex gap-2 mt-12 justify-center md:justify-start">
          {TESTIMONIALS.map((_, i) => (
            <div 
              key={i}
              className={`h-1 transition-all duration-500 ${i === currentIndex ? 'w-12 bg-accent-gold' : 'w-4 bg-brutal-black/20'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
