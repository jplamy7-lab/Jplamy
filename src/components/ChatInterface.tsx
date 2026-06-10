import React, { useEffect, useRef, useState } from 'react';
import { generateChatResponseStream } from '../services/geminiService';
import { Message, AgentProfile } from '../types';
import { CommandConsole } from './CommandConsole';
import { DataPacket } from './DataPacket';

export const ChatInterface: React.FC<{ 
  agent: AgentProfile; 
  onUpdateMemory: (id: string, key: string, val: any) => void 
}> = ({ agent, onUpdateMemory }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Neural link established with ${agent.name}. \n\nPERSONALITY: ${agent.personality}\nSKILLS: ${agent.skills.join(', ')}\n\nGreetings, Commander. ${agent.description} Data streams are open. How shall we proceed?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load agent's memoryROM from local storage on mount or agent change
  useEffect(() => {
    const savedMemory = localStorage.getItem(`memoryRom_${agent.id}`);
    if (savedMemory) {
      try {
        const parsed = JSON.parse(savedMemory);
        Object.entries(parsed).forEach(([key, val]) => {
          if (!agent.memoryRom[key]) {
            onUpdateMemory(agent.id, key, val);
          }
        });
      } catch (err) {
        console.error('Failed to parse memory from local storage', err);
      }
    }
  }, [agent.id, onUpdateMemory, agent.memoryRom]);

  // Save agent's memoryROM to local storage whenever it updates
  useEffect(() => {
    if (Object.keys(agent.memoryRom).length > 0) {
      const savedMemoryString = localStorage.getItem(`memoryRom_${agent.id}`);
      const savedMemory = savedMemoryString ? JSON.parse(savedMemoryString) : {};
      const merged = { ...savedMemory, ...agent.memoryRom };
      localStorage.setItem(`memoryRom_${agent.id}`, JSON.stringify(merged));
    }
  }, [agent.memoryRom, agent.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Convert current messages to Gemini history format (excluding the very last user message just added)
    const history = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = {
      id: botMessageId,
      role: 'assistant',
      content: '', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add empty bot message placeholder
    setMessages((prev) => [...prev, botMessage]);

    try {
      const stream = generateChatResponseStream(content, history, agent);
      let fullText = '';
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          const index = updated.findIndex(m => m.id === botMessageId);
          if (index !== -1) {
            updated[index] = { ...updated[index], content: fullText };
          }
          return updated;
        });
      }

      // Continuous Learning: Store interaction in ROM
      onUpdateMemory(agent.id, Date.now().toString(), { 
        input: content, 
        output: fullText,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages((prev) => {
        const updated = [...prev];
        const index = updated.findIndex(m => m.id === botMessageId);
        const errorContent = "CRITICAL SYSTEM ERROR: NEURAL LINK TIMEOUT. PLEASE CHECK CORE CONNECTIVITY VITALITY.";
        if (index !== -1) {
          updated[index] = { ...updated[index], content: errorContent };
        } else {
          updated.push({
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: errorContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--bg-main)]">
      
      {/* Header Info */}
      <header className="h-16 border-b border-[var(--accent-pink)]/40 flex items-center justify-between px-8 bg-[var(--bg-alt)] z-10">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-[var(--accent-pink)] shadow-[0_0_10px_var(--accent-pink)] animate-pulse"></div>
          <h1 className="text-xl font-black tracking-tighter text-white">
            AI CENTER <span className="text-[var(--accent-pink)] opacity-50">//</span> NEURAL_IF_v4.0
          </h1>
        </div>
        <div className="text-[10px] bg-[var(--accent-pink)]/10 border border-[var(--accent-pink)]/30 px-3 py-1 text-[var(--accent-pink)] font-bold">
          SECURITY LEVEL: OMEGA
        </div>
      </header>

      {/* Message Area */}
      <section 
        ref={scrollRef}
        className="flex-1 p-8 space-y-6 overflow-y-auto flex flex-col justify-end pb-12 custom-scrollbar z-10"
      >
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {messages.map((message) => (
            <DataPacket key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 border-2 border-zinc-800 flex items-center justify-center animate-spin">
                <div className="w-4 h-4 bg-[var(--accent-pink)] blur-[2px]" />
              </div>
              <div className="pt-2">
                <span className="text-[10px] font-mono text-zinc-500 animate-pulse uppercase tracking-[0.2em]">Processing neural data packets...</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Input Console */}
      <CommandConsole onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};
