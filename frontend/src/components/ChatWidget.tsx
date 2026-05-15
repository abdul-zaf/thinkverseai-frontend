import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = "You are a helpful and professional AI assistant for ThinkVerse AI Agency. You provide information about their services: Voice Agents, RAG Agents, Digital Marketing Automation, and AI Schedulers. Keep responses concise, professional, and slightly tech-forward. If asked about pricing, suggest booking a consultation via the form on the website.";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm the ThinkVerse AI assistant. How can I help you with our AI services today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...updatedMessages,
          ],
        }),
      });

      const data = await res.json();
      const reply = data.message?.content || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-white border-4 border-brutal-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brutal-black text-white p-4 flex justify-between items-center border-b-4 border-brutal-black">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
                <span className="font-display uppercase tracking-wider">ThinkVerse AI Support</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-accent-gold transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gallery-white">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] p-3 border-2 border-brutal-black font-medium text-sm",
                    msg.role === 'user'
                      ? "bg-accent-gold text-brutal-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-brutal-black shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)]"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] font-mono uppercase mt-1 opacity-40">
                    {msg.role === 'user' ? 'You' : 'ThinkVerse AI'}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-brutal-black opacity-50">
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
                className="bg-brutal-black text-white p-2 border-2 border-brutal-black hover:bg-accent-gold hover:text-brutal-black transition-all active:translate-y-1 active:shadow-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full border-4 border-brutal-black flex items-center justify-center transition-all duration-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
          isOpen ? "bg-white text-brutal-black" : "bg-accent-gold text-brutal-black"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </button>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}