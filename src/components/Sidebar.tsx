import { Activity, Globe, MessageSquare, Zap, Target, Sparkles, TrendingDown, Skull, BarChart3, Box, Eye, Terminal, Map, MapPin, Calculator, LineChart, Wrench, Droplets, Leaf, Compass, PenTool, Database, Network } from 'lucide-react';
import React from 'react';
import { AgentProfile } from '../types';
import { GlitchText } from './GlitchText';

interface SidebarProps {
  onNewChat: () => void;
  selectedAgent: AgentProfile;
  setSelectedAgent: (agent: AgentProfile) => void;
  agents: AgentProfile[];
}

const IconMap: Record<string, any> = {
  Target,
  Sparkles,
  TrendingDown,
  Skull,
  Globe,
  BarChart3,
  Box,
  Eye,
  Terminal,
  Map,
  MapPin,
  Calculator,
  LineChart,
  Wrench,
  Droplets,
  Leaf,
  Compass,
  PenTool,
  Database,
  Network
};

export const Sidebar: React.FC<SidebarProps> = ({ onNewChat, selectedAgent, setSelectedAgent, agents }) => {
  const links = [
    { id: '1', title: 'Neural Core Alpha', icon: Zap, active: true },
    { id: '2', title: 'Data Stream Omega', icon: Activity, active: false },
    { id: '3', title: 'Global Sync 04', icon: Globe, active: false },
    { id: '4', title: 'Void Communication', icon: MessageSquare, active: false },
  ];

  const AgentIcon = (name: string, props: { className?: string; style?: React.CSSProperties }) => {
    const Icon = IconMap[name] || Zap;
    return <Icon {...props} />;
  };

  return (
    <aside className="w-64 border-r-2 border-[var(--accent-pink)]/30 h-screen flex flex-col bg-[var(--bg-alt)] z-10 transition-all duration-500">
      <div className="p-6 border-b border-[var(--accent-pink)]/20 bg-[var(--bg-sidebar-header)] overflow-y-auto flex-1 custom-scrollbar">
      
        <div className="mb-8 px-1">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-pink)] mb-5 block opacity-70">Neural Hub : System Selection</label>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {agents.map((agent) => {
              const isActive = selectedAgent.id === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`
                    group relative flex flex-col items-center justify-center p-4 border-2 transition-all duration-500 rounded-lg overflow-hidden
                    ${isActive 
                      ? 'border-[var(--accent-pink)] bg-[var(--accent-pink)]/20 scale-105 z-20' 
                      : 'border-white/5 bg-black/60 hover:border-white/10 hover:bg-black/80'
                    }
                  `}
                  title={agent.description}
                  style={{
                    boxShadow: isActive ? `0 0 25px ${agent.color}55` : 'none'
                  }}
                >
                  {/* Neon Glow background */}
                  {isActive && (
                    <div 
                      className="absolute inset-0 opacity-30 blur-2xl pointer-events-none animate-pulse"
                      style={{ backgroundColor: agent.color }}
                    />
                  )}
                  
                  <div className={`relative z-10 mb-2 transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-40 group-hover:opacity-100 group-hover:scale-105'}`}>
                    {AgentIcon(agent.iconName, { 
                      className: `w-12 h-12 ${isActive ? 'animate-pulse' : ''}`,
                      style: { color: isActive ? agent.color : '#ffffff' }
                    })}
                  </div>
                  
                  <span className={`
                    relative z-10 text-[9px] font-black uppercase tracking-widest text-center
                    ${isActive ? 'text-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-zinc-600'}
                  `}>
                    {agent.name.split(' ')[1] || agent.name}
                  </span>

                  {/* Bottom selection indicator */}
                  {isActive && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ backgroundColor: agent.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="bg-black/80 border border-white/10 p-4 rounded-lg relative overflow-hidden group/details">
            <div 
                className="absolute top-0 left-0 w-1 h-full transition-colors duration-500" 
                style={{ backgroundColor: selectedAgent.color }}
            />
            <div className="text-[12px] text-white font-black uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: selectedAgent.color }} />
                {selectedAgent.name}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono leading-relaxed mb-3 line-clamp-2">
                {selectedAgent.description}
            </div>
            <div className="flex gap-1.5 flex-wrap">
                {selectedAgent.skills.map((skill, i) => (
                    <span key={i} className="text-[7px] px-1.5 py-0.5 bg-white/5 border border-white/10 text-zinc-400 font-mono rounded-full uppercase tracking-tighter">
                        {skill}
                    </span>
                ))}
            </div>
          </div>
        </div>

        <h2 className="text-xs font-black tracking-widest text-[var(--accent-pink)] opacity-80 uppercase mb-4">LIENS NEURONAUX RÉCENTS</h2>
        <div className="space-y-4 mb-8">
            {links.map((link) => (
              <button
                key={link.id}
                className="group w-full text-left"
              >
                <div className={`text-[10px] mb-1 font-bold ${link.active ? 'text-[var(--accent-green)]' : 'text-zinc-500'}`}>IDX: 0x{link.id.repeat(4)}A</div>
                <div className={`text-xs truncate ${link.active ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`}>{link.title}</div>
              </button>
            ))}
        </div>

        <div className="pt-4 border-t border-[var(--accent-pink)]/10">
          <button
            onClick={onNewChat}
            className="w-full py-3 px-4 border-2 border-[var(--accent-pink)]/40 bg-[var(--accent-pink)]/5 hover:bg-[var(--accent-pink)]/10 transition-all duration-300 group flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(255,0,255,0.05)] hover:shadow-[0_0_15px_rgba(255,0,255,0.15)]"
          >
            <Zap className="w-3 h-3 text-[var(--accent-pink)] group-hover:animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              NOUVELLE SESSION DE CHAT
            </span>
          </button>
          <div className="mt-2 text-center">
            <span className="text-[7px] text-zinc-600 font-mono uppercase tracking-widest">PROTOCOLE D'EFFACEMENT PRÊT</span>
          </div>
        </div>
      </div>

      <div className="mt-auto p-6 bg-[var(--bg-sidebar-footer)] border-t border-[var(--accent-pink)]/10">
        <div className="text-[9px] text-white/40 uppercase tracking-tighter mb-2 italic">SANTÉ DU SYSTÈME</div>
        <div className="h-1 bg-white/10 w-full mb-1">
          <div className="h-full bg-[var(--accent-green)] w-[82%] shadow-[0_0_8px_var(--accent-green)]"></div>
        </div>
        <div className="flex justify-between text-[8px] uppercase">
          <span>SYNCHRONISATION EN COURS...</span>
          <span>82%</span>
        </div>
      </div>
    </aside>
  );
};
