/**
 * VoiceWidget.tsx
 * Paul's Pizza LiveKit voice agent widget.
 * Matches ThinkVerse brutalist design — sits bottom-left,
 * opposite the existing ChatWidget (bottom-right).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, PhoneOff, X, Pizza } from 'lucide-react';

type State = 'idle' | 'connecting' | 'connected' | 'error';

function cn(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

export const VoiceWidget = () => {
  const [isOpen, setIsOpen]               = useState(false);
  const [state, setState]                 = useState<State>('idle');
  const [isMuted, setIsMuted]             = useState(false);
  const [avatarReady, setAvatarReady]     = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [statusText, setStatusText]       = useState('');

  const roomRef  = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── disconnect ────────────────────────────────────────────────────────────
  // Defined before connect so connect() can reference it in the error handler.
  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setState('idle');
    setAvatarReady(false);
    setAgentSpeaking(false);
    setIsMuted(false);
    setStatusText('');
  }, []);

  // ── connect ──────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    // FIX 1: Always open the panel so controls are visible immediately.
    setIsOpen(true);
    setState('connecting');
    setStatusText('Connecting to demo agent...');

    try {
      const res = await fetch('/api/livekit-token');
      if (!res.ok) throw new Error('Token fetch failed');
      const { token, url } = await res.json();

      const { Room, RoomEvent, Track } = await import('livekit-client');

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track: any) => {
        if (track.kind === Track.Kind.Video && videoRef.current) {
          track.attach(videoRef.current);
          setAvatarReady(true);
          setStatusText('');
        }
        if (track.kind === Track.Kind.Audio && audioRef.current) {
          track.attach(audioRef.current);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: any) => track.detach());

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: any[]) => {
        setAgentSpeaking(
          speakers.some((s: any) => s.identity !== room.localParticipant.identity)
        );
      });

      room.on(RoomEvent.ParticipantConnected, () => {
        setStatusText('Demo agent is joining...');
      });

      room.on(RoomEvent.Disconnected, () => {
        // LiveKit fired a server-side disconnect — reset everything.
        roomRef.current = null;
        setState('idle');
        setAvatarReady(false);
        setAgentSpeaking(false);
        setIsMuted(false);
        setStatusText('');
      });

      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setState('connected');
      setStatusText('Loading avatar...');
    } catch (err) {
      console.error(err);
      // Clean up any partial room state before showing the error.
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      setState('error');
      setStatusText('Connection failed — please try again');
      setTimeout(() => {
        setState('idle');
        setStatusText('');
      }, 3000);
    }
  }, []);

  // ── toggleMute ────────────────────────────────────────────────────────────
  const toggleMute = useCallback(async () => {
    // FIX 7: Guard against room being nulled out between render and click.
    if (!roomRef.current) return;
    const next = !isMuted;
    await roomRef.current.localParticipant.setMicrophoneEnabled(!next);
    setIsMuted(next);
  }, [isMuted]);

  // ── handleClose ───────────────────────────────────────────────────────────
  const handleClose = useCallback(async () => {
    await disconnect();
    setIsOpen(false);
  }, [disconnect]);

  // ── handleTriggerClick ────────────────────────────────────────────────────
  // FIX 2 & 3: When the agent is live and the panel is closed, re-open the
  // panel instead of toggling it shut (which would leave the call running
  // with no controls visible).
  const handleTriggerClick = useCallback(() => {
    const isLive = state === 'connected' || state === 'connecting';
    if (isLive && !isOpen) {
      setIsOpen(true);
    } else {
      setIsOpen((o) => !o);
    }
  }, [state, isOpen]);

  // ── cleanup on unmount ────────────────────────────────────────────────────
  // FIX 5: Empty dep array — this is a pure unmount cleanup.
  useEffect(() => () => { disconnect(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── derived ───────────────────────────────────────────────────────────────
  const isLive = state === 'connected' || state === 'connecting';

  return (
    <div className="fixed bottom-8 left-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="absolute bottom-20 left-0 w-[300px] bg-white border-4 border-brutal-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brutal-black text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  state === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-accent-gold'
                )} />
                <span className="font-display uppercase tracking-widest text-sm">
                  {state === 'connected' ? 'Voice Agent — Live Demo' : 'Voice Agent Demo'}
                </span>
              </div>
              <button onClick={handleClose} className="hover:text-accent-gold transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar video */}
            <div className="relative bg-brutal-black aspect-video w-full overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-700',
                  avatarReady ? 'opacity-100' : 'opacity-0'
                )}
              />
              <audio ref={audioRef} autoPlay />

              {/* Speaking ring */}
              {agentSpeaking && avatarReady && (
                <div className="absolute inset-0 border-4 border-accent-gold pointer-events-none animate-pulse" />
              )}

              {/* Placeholder states */}
              {!avatarReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
                  {state === 'idle' && (
                    <>
                      <div className="w-16 h-16 border-4 border-accent-gold flex items-center justify-center">
                        <Pizza className="w-8 h-8 text-accent-gold" />
                      </div>
                      {/* FIX 6: Removed internal tech stack copy ("powered by LiveKit + D-ID") */}
                      <p className="text-white font-mono text-[10px] text-center uppercase tracking-wider">
                        Try our AI voice agent demo
                      </p>
                    </>
                  )}
                  {(state === 'connecting' || state === 'connected') && (
                    <>
                      <div className="flex items-end gap-1 h-8">
                        {[0.4, 0.7, 1, 0.7, 0.4].map((h, i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 bg-accent-gold"
                            animate={{ scaleY: [h, 1, h] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                            style={{ height: '100%', transformOrigin: 'bottom' }}
                          />
                        ))}
                      </div>
                      <p className="text-white font-mono text-[10px] uppercase tracking-wider">
                        {statusText}
                      </p>
                    </>
                  )}
                  {state === 'error' && (
                    <p className="text-red-400 font-mono text-[10px] text-center uppercase tracking-wider px-2">
                      {statusText}
                    </p>
                  )}
                </div>
              )}

              {/* Live status overlay */}
              {avatarReady && statusText && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <span className="bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 uppercase tracking-wider">
                    {statusText}
                  </span>
                </div>
              )}
            </div>

            {/* Status bar */}
            <div className="bg-accent-gold px-4 py-1.5 border-y-2 border-brutal-black">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brutal-black font-bold">
                {state === 'idle'       && 'Demo — try our AI voice ordering agent'}
                {state === 'connecting' && 'Establishing connection...'}
                {state === 'connected'  && (agentSpeaking ? 'Marie is speaking...' : 'Listening...')}
                {state === 'error'      && 'Connection error'}
              </p>
            </div>

            {/* Controls */}
            <div className="p-4 bg-white flex items-center justify-center gap-3">
              {state === 'idle' || state === 'error' ? (
                <button
                  onClick={connect}
                  className="w-full bg-brutal-black text-white py-3 font-display uppercase tracking-wider text-sm border-2 border-brutal-black hover:bg-accent-gold hover:text-brutal-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  Try Demo
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleMute}
                    disabled={state === 'connecting'}
                    title={isMuted ? 'Unmute' : 'Mute'}
                    className={cn(
                      'p-3 border-2 border-brutal-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed',
                      isMuted ? 'bg-red-500 text-white' : 'bg-white text-brutal-black hover:bg-accent-gold'
                    )}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={disconnect}
                    className="flex-1 flex items-center justify-center gap-2 bg-brutal-black text-white py-3 font-display uppercase text-sm border-2 border-brutal-black hover:bg-red-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                  >
                    <PhoneOff className="w-4 h-4" />
                    End Call
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger */}
      {/* FIX 2 & 3: Shows PhoneOff in red when live + panel closed so there's
          always a visible way to end the call. Clicking while live re-opens
          the panel rather than hiding it with the call still running. */}
      <motion.button
        onClick={handleTriggerClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'w-16 h-16 rounded-full border-4 border-brutal-black flex items-center justify-center transition-colors duration-300',
          isOpen
            ? 'bg-white text-brutal-black shadow-none translate-x-1 translate-y-1'
            : isLive
            ? 'bg-red-500 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            : 'bg-accent-gold text-brutal-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
          state === 'connected' && 'ring-4 ring-green-400 ring-offset-2'
        )}
        title={isLive ? 'Voice Agent — Live' : 'Try our AI Voice Agent Demo'}
      >
        {isOpen
          ? <X className="w-7 h-7" />
          : isLive
          ? <PhoneOff className="w-7 h-7" />
          : <Pizza className="w-7 h-7" />
        }
      </motion.button>
    </div>
  );
};