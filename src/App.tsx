import { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { Sidebar } from './components/Sidebar';
import { TaskBoard } from './components/TaskBoard';
import { MapViewer } from './components/MapViewer';
import { Task, AgentProfile } from './types';
import { AGENTS } from './lib/agents';

export default function App() {
  const [sessionId, setSessionId] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeView, setActiveView] = useState<'chat' | 'tasks' | 'maps'>('chat');
  const [agents, setAgents] = useState<AgentProfile[]>(AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile>(agents[0]);

  const handleNewChat = () => {
    setSessionId(prev => prev + 1);
  };

  const updateAgentMemory = (agentId: string, memoryKey: string, memoryValue: any) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const newMemory = { ...a.memoryRom, [memoryKey]: memoryValue };
        const updated = { ...a, memoryRom: newMemory };
        if (selectedAgent.id === agentId) setSelectedAgent(updated);
        return updated;
      }
      return a;
    }));
  };

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-white font-sans selection:bg-[var(--accent-pink)] selection:text-white scanlines overflow-hidden border-4 border-[var(--border-main)]">
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50 mix-blend-overlay" />
      
      <Sidebar onNewChat={handleNewChat} selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent} agents={agents} />
      <main className="flex-1 flex flex-col relative">
        <nav className="flex gap-4 p-4 border-b border-[var(--accent-pink)]/20 bg-[var(--bg-alt)]">
          <button onClick={() => setActiveView('chat')} className={`px-4 py-2 uppercase text-xs font-bold ${activeView === 'chat' ? 'text-[var(--accent-pink)]' : 'text-zinc-500'}`}>DISCUSSION</button>
          <button onClick={() => setActiveView('tasks')} className={`px-4 py-2 uppercase text-xs font-bold ${activeView === 'tasks' ? 'text-[var(--accent-pink)]' : 'text-zinc-500'}`}>TÂCHES</button>
          <button onClick={() => setActiveView('maps')} className={`px-4 py-2 uppercase text-xs font-bold ${activeView === 'maps' ? 'text-[var(--accent-pink)]' : 'text-zinc-500'}`}>CARTOGRAPHIE</button>
        </nav>
        {activeView === 'chat' ? (
            <ChatInterface key={sessionId} agent={selectedAgent} onUpdateMemory={updateAgentMemory} />
        ) : activeView === 'tasks' ? (
            <TaskBoard tasks={tasks} setTasks={setTasks} />
        ) : (
            <MapViewer />
        )}
      </main>
    </div>
  );
}
