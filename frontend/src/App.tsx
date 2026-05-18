/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { HorizontalScroll } from './components/HorizontalScroll';
import { Testimonials } from './components/Testimonials';
import { StickyCTA } from './components/StickyCTA';
import { CombinedWidget } from './components/Combinedwidget';
import { ArrowDown, Zap, Globe, Cpu, Sparkles } from 'lucide-react';

const WEBHOOK_URL = 'https://n8n.thinkverseai.ca/webhook/thinkverse-contact';

function ContactForm() {
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
        }),
      });
      if (res.ok) {
        setStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block font-mono text-xs uppercase font-bold mb-2">Full Name</label>
        <input name="name" type="text" required className="w-full bg-white border-2 border-brutal-black p-4 font-mono focus:outline-none focus:bg-gallery-white" placeholder="John Doe" />
      </div>
      <div>
        <label className="block font-mono text-xs uppercase font-bold mb-2">Email Address</label>
        <input name="email" type="email" required className="w-full bg-white border-2 border-brutal-black p-4 font-mono focus:outline-none focus:bg-gallery-white" placeholder="john@company.com" />
      </div>
      <div>
        <label className="block font-mono text-xs uppercase font-bold mb-2">Message</label>
        <textarea name="message" required className="w-full bg-white border-2 border-brutal-black p-4 font-mono focus:outline-none focus:bg-gallery-white h-32" placeholder="Tell us about your project..." />
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-brutal-black text-white py-6 font-display text-2xl uppercase hover:bg-white hover:text-brutal-black transition-colors border-2 border-brutal-black disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending...' : 'Send Inquiry'}
      </button>
      {status === 'success' && (
        <p className="font-mono text-sm text-center font-bold">✓ Message sent! We'll be in touch shortly.</p>
      )}
      {status === 'error' && (
        <p className="font-mono text-sm text-center font-bold text-red-700">✗ Something went wrong. Please try again.</p>
      )}
    </form>
  );
}

export default function App() {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-gallery-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 mix-blend-difference text-white px-8 py-6 flex justify-between items-center">
        <div className="font-display text-2xl tracking-tighter uppercase">ThinkVerse AI</div>
        <div className="hidden md:flex gap-12 font-mono text-xs uppercase tracking-widest">
          <a href="#services" className="hover:text-accent-gold transition-colors">Services</a>
          <a href="#process" className="hover:text-accent-gold transition-colors">Process</a>
          <a href="#contact" className="hover:text-accent-gold transition-colors">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center px-8 md:px-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 noise z-10" />
          <div className="absolute inset-0 scanlines z-10" />
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-gold/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 100, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-brutal-black/5 rounded-full blur-[100px]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(255,255,255,0.8)_100%)]" />
        </div>

        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="grid grid-cols-10 h-full border-l border-brutal-black/20">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="border-r border-brutal-black/20" />
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-brutal-black text-white px-3 py-1 font-mono text-xs uppercase tracking-tighter">Next-Gen Agency</span>
            <div className="h-[1px] w-24 bg-brutal-black" />
          </div>
          
          <h1 className="font-display text-[12vw] md:text-[10vw] leading-[0.85] uppercase mb-8">
            Architecting <br />
            <span className="text-accent-gold uppercase">Intelligence</span>
          </h1>

          <div className="flex flex-col md:flex-row gap-12 items-start md:items-end">
            <p className="max-w-md text-lg font-medium leading-tight">
              We build custom AI agents and automation systems that don't just work—they evolve. From voice synthesis to complex RAG architectures.
            </p>
            
            <button 
              onClick={scrollToContact}
              className="group relative flex items-center justify-center w-48 h-48 rounded-full border-2 border-brutal-black hover:bg-brutal-black hover:text-white transition-all duration-500 overflow-hidden"
            >
              <span className="relative z-10 font-display text-xl uppercase">Start Project</span>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Sparkles className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 text-accent-gold" />
              </motion.div>
            </button>
          </div>
        </motion.div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-8 h-8" />
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-brutal-black py-6 overflow-hidden border-y-2 border-brutal-black">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-8">
              <span className="text-white font-display text-4xl uppercase">Voice Agents</span>
              <Zap className="w-8 h-8 text-accent-gold fill-accent-gold" />
              <span className="text-white font-display text-4xl uppercase">RAG Systems</span>
              <Globe className="w-8 h-8 text-accent-gold" />
              <span className="text-white font-display text-4xl uppercase">Marketing Automation</span>
              <Cpu className="w-8 h-8 text-accent-gold fill-accent-gold" />
            </div>
          ))}
        </div>
      </div>

      {/* Services Section (Horizontal Scroll) */}
      <div id="services" className="bg-gallery-white pt-32 pb-12 px-8">
        <h2 className="font-display text-5xl md:text-7xl text-brutal-black uppercase leading-none">
          Our <br /> <span className="text-accent-gold">Capabilities</span>
        </h2>
      </div>
      <HorizontalScroll />

      <Testimonials />

      {/* Footer / CTA */}
      <section className="bg-gallery-white py-32 px-8 border-t-2 border-brutal-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24">
          <div id="process">
            <h3 className="font-display text-4xl md:text-5xl uppercase mb-8">Ready to scale?</h3>
            <p className="text-xl font-medium mb-12 opacity-70">
              Join 50+ companies leveraging our AI expertise to automate their workflows and dominate their niche.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 border-b border-brutal-black pb-4">
                <span className="font-mono text-sm opacity-50">01</span>
                <span className="font-display text-2xl uppercase">Consultation</span>
              </div>
              <div className="flex items-center gap-4 border-b border-brutal-black pb-4">
                <span className="font-mono text-sm opacity-50">02</span>
                <span className="font-display text-2xl uppercase">Architecture</span>
              </div>
              <div className="flex items-center gap-4 border-b border-brutal-black pb-4">
                <span className="font-mono text-sm opacity-50">03</span>
                <span className="font-display text-2xl uppercase">Deployment</span>
              </div>
            </div>
          </div>
          
          <div id="contact" className="bg-accent-gold p-12 border-4 border-brutal-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="bg-brutal-black text-white py-12 px-8 border-t-2 border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-display text-3xl uppercase">ThinkVerse AI</div>            
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">
            © 2024 ThinkVerse AI Agency. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-accent-gold transition-colors">TW</a>
            <a href="#" className="hover:text-accent-gold transition-colors">LI</a>
            <a href="#" className="hover:text-accent-gold transition-colors">GH</a>
          </div>
        </div>
      </footer>

      {/* Widgets — ChatWidget bottom-right, VoiceWidget bottom-left */}
      <CombinedWidget />
      <StickyCTA />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
          pointer-events: none;
        }
        .scanlines {
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(0, 0, 0, 0.05) 50%
          );
          background-size: 100% 4px;
          pointer-events: none;
        }
      `}</style>
    </main>
  );
}