import React from 'react';
import { motion } from 'motion/react';
import { SERVICES, Service } from '../constants';
import { ArrowRight, Mic2, Database, Megaphone, CalendarClock, Cpu } from 'lucide-react';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'voice-agent':          <Mic2 className="w-16 h-16" />,
  'rag-agents':           <Database className="w-16 h-16" />,
  'marketing-automation': <Megaphone className="w-16 h-16" />,
  'schedulers':           <CalendarClock className="w-16 h-16" />,
  'custom-solutions':     <Cpu className="w-16 h-16" />,
};

export const HorizontalScroll = () => {
  return (
    <section className="bg-gallery-white py-24 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
      <div className="flex gap-12 px-12 w-max">
        {SERVICES.map((service, index) => (
          <div key={service.id} className="snap-center">
            <ServiceCard service={service} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
};

const ServiceCard = ({ service, index }: { service: Service, index: number }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative h-[450px] w-[450px] overflow-hidden bg-white border-2 border-brutal-black flex flex-col hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300"
    >
      <div className="absolute top-4 left-4 z-10 bg-accent-gold text-brutal-black px-3 py-1 font-mono text-xs font-bold border border-brutal-black">
        0{index + 1}
      </div>

      <div className="relative h-1/2 w-full overflow-hidden border-b-2 border-brutal-black bg-brutal-black flex items-center justify-center">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-accent-gold w-full h-full">
            {SERVICE_ICONS[service.id]}
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent-gold/60">{service.title}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 justify-between">
        <div>
          <h3 className="font-display text-3xl uppercase leading-none mb-2">{service.title}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {service.tags.map(tag => (
              <span key={tag} className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                #{tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-brutal-black/70 line-clamp-3 font-medium leading-relaxed">
            {service.description}
          </p>
        </div>

        <a
          href={service.demoUrl}
          target={service.demoUrl.startsWith('http') ? "_blank" : "_self"}
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-between w-full border-2 border-brutal-black bg-white px-6 py-3 font-display text-lg uppercase transition-all hover:bg-neon-green hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none"
        >
          Live Demo
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </motion.div>
  );
};
