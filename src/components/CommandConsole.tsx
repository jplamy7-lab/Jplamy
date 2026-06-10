import { Send } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';

interface CommandConsoleProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export const CommandConsole: React.FC<CommandConsoleProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <footer className="p-8 bg-[var(--bg-alt)] border-t border-[var(--accent-green)]/20">
      <div className="relative flex items-center group">
        <label className="absolute -left-2 -top-6 text-[10px] text-[var(--accent-green)] font-black uppercase tracking-widest">Input Command_</label>
        <input type="text" 
          placeholder="INITIATE SEQUENCE..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="w-full bg-black border-2 border-[var(--accent-green)]/40 p-4 text-[var(--accent-green)] outline-none shadow-[0_0_5px_rgba(0,255,0,0.1)] focus:border-[var(--accent-green)] focus:shadow-[0_0_15px_rgba(0,255,0,0.2)] placeholder-[var(--accent-green)]/30 font-bold uppercase tracking-wider"
        />
        <button 
          onClick={handleSubmit}
          className="absolute right-2 px-6 py-2 bg-[var(--accent-green)] text-black font-black uppercase text-xs tracking-widest shadow-[0_0_20px_var(--accent-green)] hover:scale-105 transition-transform"
        >
          Transmit
        </button>
      </div>
      <div className="flex gap-6 mt-4 opacity-40">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-[var(--accent-green)]"></div>
          <span className="text-[8px] uppercase tracking-tighter">Encrypted</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-[var(--accent-green)]"></div>
          <span className="text-[8px] uppercase tracking-tighter">Priority High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-[var(--accent-green)]"></div>
          <span className="text-[8px] uppercase tracking-tighter">Relay: Active</span>
        </div>
      </div>
    </footer>
  );
};
