/**
 * CombinedWidget.tsx
 * Unified chat + voice widget for ThinkVerse AI.
 * Single FAB bottom-right; opens a panel where the user picks Text or Voice mode.
 * Drop-in replacement for both <ChatWidget /> and <VoiceWidget /> in App.tsx.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Mic, MicOff, PhoneOff, X,
  Send, Loader2, MessagesSquare, Radio, Volume2,
} from 'lucide-react';

//Types

type Mode = 'select' | 'chat' | 'voice';
type VoiceState = 'idle' | 'connecting' | 'connected' | 'error';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

//Constants

const SYSTEM_PROMPT =
  "You are Aria, a professional AI assistant for ThinkVerse AI Agency (thinkverseai.ca). " +
  "Keep responses concise, professional, and slightly tech-forward. " +
  "Answer questions using only the knowledge base below. " +
  "If asked about pricing, explain all pricing is custom and suggest booking a consultation via the contact form on thinkverseai.ca.\n\n" +
  "## Services\n" +
  "**Voice Agents** — Human-like conversational AI for customer support and sales. Bilingual English/Arabic. Built on LiveKit + D-ID avatar. Demo: https://pizzadelivery.thinkverseai.ca\n\n" +
  "**RAG Agents** — Retrieval-Augmented Generation connecting private business data (PDFs, wikis, databases) to LLMs for accurate, grounded answers. Demo: https://windmason.thinkverseai.ca\n\n" +
  "**Digital Marketing Automation** — AI-driven Facebook/Instagram ad workflows. Clients report 3x lead generation improvement. Demo: https://adautomation.thinkverseai.ca\n\n" +
  "**AI Schedulers** — Intelligent multi-timezone booking and appointment systems with automated reminders. Demo: https://luxsaloon.thinkverseai.ca\n\n" +
  "**Custom AI Solutions** — Bespoke AI: computer vision, predictive analytics, workflow automation. Enterprise-grade from prototype to production.\n\n" +
  "## Pricing\n" +
  "All pricing is custom based on scope. No fixed tiers. Book a consultation at thinkverseai.ca — team responds within 24 hours.\n\n" +
  "## Why ThinkVerse AI?\n" +
  "Rapid deployment (days not months), bilingual English/Arabic, proven results (70% faster response times, 3x lead generation), nothing off-the-shelf — every solution is custom-built.";

//Utility

function cn(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

//Mode Selector Panel

function ModeSelector({ onSelect }: { onSelect: (m: 'chat' | 'voice') => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Intro copy */}
      <div className="px-6 pt-6 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">
          How would you like to connect?
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 px-4 pb-6 flex-1 justify-center">
        {/* Text chat */}
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect('chat')}
          className="group flex items-center gap-4 p-5 border-2 border-brutal-black bg-gallery-white hover:bg-brutal-black hover:text-white transition-colors duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
        >
          <div className="w-10 h-10 border-2 border-brutal-black group-hover:border-accent-gold flex items-center justify-center shrink-0 bg-accent-gold group-hover:bg-transparent transition-colors">
            <MessagesSquare className="w-5 h-5 text-brutal-black group-hover:text-accent-gold" />
          </div>
          <div className="text-left">
            <div className="font-display text-lg uppercase tracking-tight leading-none mb-1">
              Text Chat
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 group-hover:opacity-80">
              Ask questions, get instant answers
            </div>
          </div>
          <div className="ml-auto font-mono text-xs opacity-30 group-hover:opacity-60">→</div>
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1 h-px bg-brutal-black/20" />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-40">or</span>
          <div className="flex-1 h-px bg-brutal-black/20" />
        </div>

        {/* Voice agent */}
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect('voice')}
          className="group flex items-center gap-4 p-5 border-2 border-brutal-black bg-gallery-white hover:bg-brutal-black hover:text-white transition-colors duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
        >
          <div className="w-10 h-10 border-2 border-brutal-black group-hover:border-accent-gold flex items-center justify-center shrink-0 bg-brutal-black group-hover:bg-transparent transition-colors">
            <Radio className="w-5 h-5 text-accent-gold" />
          </div>
          <div className="text-left">
            <div className="font-display text-lg uppercase tracking-tight leading-none mb-1">
              Voice Agent
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 group-hover:opacity-80">
              Live demo — speak with our AI
            </div>
          </div>
          <div className="ml-auto font-mono text-xs opacity-30 group-hover:opacity-60">→</div>
        </motion.button>
      </div>
    </div>
  );
}

//Chat Panel

function ChatPanel({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm the ThinkVerse AI assistant. How can I help you with our AI services today?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          stream: false,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...updatedMessages],
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message?.content || "I'm sorry, I couldn't process that." }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="bg-brutal-black/5 border-b-2 border-brutal-black px-4 py-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="font-mono text-[10px] uppercase tracking-widest hover:text-accent-gold transition-colors flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="flex-1 flex items-center gap-2 justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest">Text Chat</span>
        </div>
        <div className="w-12" /> {/* spacer */}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gallery-white">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}>
            <div className={cn(
              'max-w-[85%] p-3 border-2 border-brutal-black font-medium text-sm',
              msg.role === 'user'
                ? 'bg-accent-gold text-brutal-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-brutal-black shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)]'
            )}>
              {msg.content}
            </div>
            <span className="text-[10px] font-mono uppercase mt-1 opacity-40">
              {msg.role === 'user' ? 'You' : 'ThinkVerse AI'}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 opacity-50">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t-4 border-brutal-black bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-gallery-white border-2 border-brutal-black p-2 font-mono text-sm focus:outline-none focus:bg-accent-gold/10"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-brutal-black text-white p-2 border-2 border-brutal-black hover:bg-accent-gold hover:text-brutal-black transition-all active:translate-y-1 disabled:opacity-40"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

//Voice Panel

function VoicePanel({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<VoiceState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);

  const roomRef  = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const connect = useCallback(async () => {
    setState('connecting');
    try {
      const res = await fetch('/api/livekit-token');
      if (!res.ok) throw new Error('Token fetch failed');
      const { token, url } = await res.json();

      const { Room, RoomEvent, Track } = await import('livekit-client');
      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: any) => {
        if (track.kind === Track.Kind.Audio && audioRef.current) {
          track.attach(audioRef.current);
        }
      });
      room.on(RoomEvent.TrackUnsubscribed, (track: any) => track.detach());
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: any[]) => {
        setAgentSpeaking(speakers.some((s: any) => s.identity !== room.localParticipant.identity));
      });
      room.on(RoomEvent.Disconnected, () => {
        setState('idle'); setAgentSpeaking(false);
      });

      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setState('connected');
    } catch (err) {
      console.error(err);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (roomRef.current) { await roomRef.current.disconnect(); roomRef.current = null; }
    setState('idle'); setAgentSpeaking(false); setIsMuted(false);
  }, []);

  const toggleMute = useCallback(async () => {
    if (!roomRef.current) return;
    const next = !isMuted;
    await roomRef.current.localParticipant.setMicrophoneEnabled(!next);
    setIsMuted(next);
  }, [isMuted]);

  useEffect(() => () => { disconnect(); }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="bg-brutal-black/5 border-b-2 border-brutal-black px-4 py-2 flex items-center gap-3">
        <button
          onClick={() => { disconnect(); onBack(); }}
          className="font-mono text-[10px] uppercase tracking-widest hover:text-accent-gold transition-colors flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="flex-1 flex items-center gap-2 justify-center">
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            state === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-accent-gold'
          )} />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            {state === 'connected' ? 'Voice Agent — Live' : 'Voice Agent'}
          </span>
        </div>
        <div className="w-12" />
      </div>

      {/* Audio-only visualiser */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-brutal-black px-6 py-8">
        <audio ref={audioRef} autoPlay />

        {/* Animated orb */}
        <div className={cn(
          'w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-300',
          state === 'connected' && agentSpeaking
            ? 'border-accent-gold shadow-[0_0_32px_rgba(255,193,7,0.5)] scale-110'
            : state === 'connected'
            ? 'border-green-400 shadow-[0_0_16px_rgba(74,222,128,0.3)]'
            : 'border-white/20'
        )}>
          {state === 'connecting' ? (
            <Loader2 className="w-10 h-10 text-accent-gold animate-spin" />
          ) : state === 'error' ? (
            <Radio className="w-10 h-10 text-red-400" />
          ) : (
            <Volume2 className={cn(
              'w-10 h-10 transition-colors',
              agentSpeaking ? 'text-accent-gold' : 'text-white/60'
            )} />
          )}
        </div>

        {/* Sound bars — visible while agent is speaking */}
        <div className="flex items-end gap-1 h-8">
          {[0.3, 0.6, 1, 0.6, 0.3].map((h, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-accent-gold rounded-full"
              animate={agentSpeaking ? { scaleY: [h, 1, h] } : { scaleY: 0.15 }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1 }}
              style={{ height: '100%', transformOrigin: 'bottom' }}
            />
          ))}
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 text-center">
          {state === 'idle'      && 'Press the button below to speak with Aria'}
          {state === 'connecting' && 'Connecting to Aria...'}
          {state === 'connected' && (agentSpeaking ? 'Aria is speaking...' : 'Listening...')}
          {state === 'error'     && 'Connection failed — please try again'}
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 bg-white border-t-4 border-brutal-black flex items-center justify-center gap-3">
        {state === 'idle' || state === 'error' ? (
          <button onClick={connect}
            className="w-full bg-brutal-black text-white py-3 font-display uppercase tracking-wider text-sm border-2 border-brutal-black hover:bg-accent-gold hover:text-brutal-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4" /> Start Voice Chat
          </button>
        ) : (
          <>
            <button onClick={toggleMute} disabled={state === 'connecting'} title={isMuted ? 'Unmute' : 'Mute'}
              className={cn(
                'p-3 border-2 border-brutal-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-40',
                isMuted ? 'bg-red-500 text-white' : 'bg-white text-brutal-black hover:bg-accent-gold'
              )}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button onClick={disconnect}
              className="flex-1 flex items-center justify-center gap-2 bg-brutal-black text-white py-3 font-display uppercase text-sm border-2 border-brutal-black hover:bg-red-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <PhoneOff className="w-4 h-4" /> End Call
            </button>
          </>
        )}
      </div>
    </div>
  );
}

//Combined Widget

export const CombinedWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode]     = useState<Mode>('select');

  const handleClose = () => {
    setIsOpen(false);
    //Brief delay before reset mode so the exit animation plays smoothly
    setTimeout(() => setMode('select'), 300);
  };

  //Panel height varies per mode
  const panelHeight =
    mode === 'select'  ? 'h-[320px]' :
    mode === 'chat'    ? 'h-[500px]' :
    /* voice */          'h-auto';

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className={cn(
              'absolute bottom-20 right-0 w-[350px] bg-white border-4 border-brutal-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden',
              panelHeight
            )}
          >
            {/*Shared header*/}
            <div className="bg-brutal-black text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
                <span className="font-display uppercase tracking-widest text-sm">ThinkVerse AI</span>
              </div>
              <button onClick={handleClose} className="hover:text-accent-gold transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/*Mode switcher tabs (visible when not on select screen)*/}
            {mode !== 'select' && (
              <div className="flex border-b-2 border-brutal-black shrink-0">
                <button
                  onClick={() => setMode('chat')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors border-r-2 border-brutal-black',
                    mode === 'chat' ? 'bg-accent-gold text-brutal-black' : 'bg-white hover:bg-gallery-white text-brutal-black opacity-50 hover:opacity-100'
                  )}
                >
                  <MessageSquare className="w-3 h-3" /> Text
                </button>
                <button
                  onClick={() => setMode('voice')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors',
                    mode === 'voice' ? 'bg-accent-gold text-brutal-black' : 'bg-white hover:bg-gallery-white text-brutal-black opacity-50 hover:opacity-100'
                  )}
                >
                  <Mic className="w-3 h-3" /> Voice
                </button>
              </div>
            )}

            {/*Content*/}
            <AnimatePresence mode="wait">
              {mode === 'select' && (
                <motion.div key="select" className="flex-1 overflow-hidden"
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                >
                  <ModeSelector onSelect={(m) => setMode(m)} />
                </motion.div>
              )}
              {mode === 'chat' && (
                <motion.div key="chat" className="flex-1 flex flex-col overflow-hidden"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChatPanel onBack={() => setMode('select')} />
                </motion.div>
              )}
              {mode === 'voice' && (
                <motion.div key="voice" className="flex-1 flex flex-col overflow-hidden"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <VoicePanel onBack={() => setMode('select')} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/*FAB*/}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'w-16 h-16 rounded-full border-4 border-brutal-black flex items-center justify-center transition-colors duration-300',
          isOpen
            ? 'bg-white text-brutal-black shadow-none translate-x-1 translate-y-1'
            : 'bg-accent-gold text-brutal-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
        )}
        title="Chat with ThinkVerse AI"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-7 h-7" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare className="w-7 h-7" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
