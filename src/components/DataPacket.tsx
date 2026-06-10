import { Bot, User } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { Message } from '../types';

interface DataPacketProps {
  message: Message;
}

export const DataPacket: React.FC<DataPacketProps> = ({ message }) => {
  const isBot = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, x: isBot ? -20 : 20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      className={`flex gap-4 mb-8 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className="flex flex-col items-center gap-2">
        <div className={`w-10 h-10 rounded-none border-2 flex items-center justify-center relative overflow-hidden bg-black ${
          isBot ? 'border-[var(--accent-pink)] shadow-[0_0_10px_var(--accent-pink)]' : 'border-[var(--accent-green)] shadow-[0_0_10px_var(--accent-green)]'
        }`}>
          {isBot ? <Bot className="text-[var(--accent-pink)] w-6 h-6" /> : <User className="text-[var(--accent-green)] w-6 h-6" />}
          {isBot && (
            <div className="absolute inset-0 bg-[var(--accent-pink)] opacity-5 animate-pulse" />
          )}
        </div>
        
        {isBot && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] animate-pulse shadow-[0_0_5px_var(--accent-green)]" />
            <span className="text-[8px] font-mono text-[var(--accent-green)] uppercase tracking-tighter">Active</span>
          </div>
        )}
      </div>

      {/* Packet Content */}
      <div className={`max-w-[80%] min-w-[120px] ${isBot ? 'items-start' : 'items-end'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
            isBot ? 'text-[var(--accent-pink)]' : 'text-[var(--accent-green)]'
          }`}>
            {isBot ? 'Sales Bot v.9' : 'Lead Dev'}
          </span>
          <span className="text-[8px] text-white/30 font-mono">[{message.timestamp}]</span>
        </div>

        <div className={`w-full p-4 border-2 relative group transition-all duration-300 ${
          isBot 
            ? 'border-[var(--accent-pink)] bg-[var(--accent-pink)]/5 shadow-[inset_0_0_10px_rgba(255,0,255,0.1)] hover:shadow-[0_0_10px_rgba(255,0,255,0.2)]' 
            : 'border-[var(--accent-green)] bg-[var(--accent-green)]/5 shadow-[inset_0_0_10px_rgba(0,255,0,0.1)] hover:shadow-[0_0_10px_rgba(0,255,0,0.2)]'
        }`}>
          {/* Decorative corner elements */}
          <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${isBot ? 'border-[var(--accent-pink)]' : 'border-[var(--accent-green)]'}`} />
          <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${isBot ? 'border-[var(--accent-pink)]' : 'border-[var(--accent-green)]'}`} />
          <p className="text-sm leading-relaxed text-white/90 relative z-10 whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
