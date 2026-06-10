import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { PlusCircle, CheckCircle, Clock, Trash2, ChevronDown, ChevronUp, AlertTriangle, Zap, ShieldCheck, Circle, CheckCircle2, Activity } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, setTasks }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('magnatasks');
    if (saved) setTasks(JSON.parse(saved));
  }, [setTasks]);

  // Persist to LocalStorage (Auto-save)
  useEffect(() => {
    localStorage.setItem('magnatasks', JSON.stringify(tasks));
  }, [tasks]);

  const getPriorityIcon = (priority: Task['priority'] = 'medium') => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-500 shadow-[0_0_8px_#ef4444]" />;
      case 'medium': return <Zap className="w-5 h-5 text-yellow-400 shadow-[0_0_8px_#facc15]" />;
      case 'low': return <ShieldCheck className="w-5 h-5 text-green-400 shadow-[0_0_8px_#4ade80]" />;
      default: return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-cyan-400 shadow-[0_0_8px_#22d3ee]" />;
      case 'in-progress': return <Activity className="w-5 h-5 text-pink-500 animate-pulse" />;
      default: return <Clock className="w-5 h-5 text-blue-400" />;
    }
  };

  // ... rest of the component

  const addTask = () => {
    if (!newTitle.trim() || !newAssignee.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle,
      assignee: newAssignee,
      status: 'pending',
      priority: 'medium'
    };
    setTasks([...tasks, newTask]);
    setNewTitle('');
    setNewAssignee('');
  };

  const updateStatus = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };
  
  const updateTaskDetail = (id: string, field: keyof Task, value: any) => {
      setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };
  
  const deleteTask = (id: string) => {
    if (confirm("Confirmer la suppression de ce vecteur de données ?")) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  return (
    <div className="flex-1 p-8 bg-[var(--bg-main)] text-white">
      <h2 className="text-xl font-black text-[var(--accent-pink)] mb-6 uppercase tracking-widest">MATRICE DES TÂCHES</h2>
      
      {/* Task Input Section */}
      <div className="flex gap-4 mb-10 p-6 bg-[var(--bg-alt)] border border-[var(--accent-green)]/20 shadow-inner">
        <input 
          placeholder="Nouvelle Directive..." 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)}
          className="bg-black border border-white/10 p-3 text-sm flex-1 placeholder:text-white/20"
        />
        <input 
          placeholder="Responsable..." 
          value={newAssignee} 
          onChange={(e) => setNewAssignee(e.target.value)}
          className="bg-black border border-white/10 p-3 text-sm w-48 placeholder:text-white/20"
        />
        <button onClick={addTask} className="bg-[var(--accent-green)] text-black px-6 py-2 font-black uppercase text-xs flex items-center gap-2 hover:bg-[var(--accent-green)]/90 transition-all shadow-[0_0_10px_var(--accent-green)]">
          <PlusCircle size={14} /> VALIDER LA DIRECTIVE
        </button>
      </div>

      {/* Task List Section */}
      <div className="bg-[var(--bg-alt)] border border-[var(--accent-pink)]/20">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--accent-pink)]/20 text-[10px] font-bold text-[var(--accent-pink)] uppercase tracking-widest">
            <div className="col-span-5">MISSION / TÂCHE</div>
            <div className="col-span-2">RESPONSABLE</div>
            <div className="col-span-2">STATUT</div>
            <div className="col-span-2">PRIORITÉ</div>
            <div className="col-span-1">ACTION</div>
        </div>
        <div className="divide-y divide-[var(--accent-pink)]/10">
          {tasks.map(task => (
            <div key={task.id} className="transition">
                <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 cursor-pointer" onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}>
                 <div className="col-span-5 flex items-center gap-3">
                    {expandedId === task.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    <span className="font-medium text-sm">{task.title}</span>
                  </div>
                  <div className="col-span-2 text-xs text-white/60 font-mono">{task.assignee}</div>
                  <div className="col-span-2 flex flex-col items-center justify-center gap-1">
                    {getStatusIcon(task.status)}
                    <span className="text-[9px] font-mono opacity-50 uppercase tracking-tighter">
                        {task.status === 'in-progress' ? 'PROGRESS' : task.status}
                    </span>
                  </div>
                  <div className="col-span-2 flex flex-col items-center justify-center gap-1">
                    {getPriorityIcon(task.priority)}
                    <span className="text-[9px] font-mono opacity-50 uppercase tracking-tighter">
                        {task.priority}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                      <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-red-500 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                  </div>
                </div>
                {expandedId === task.id && (
                    <div className="p-6 bg-black/40 border-t border-[var(--accent-pink)]/10 text-xs gap-4 grid grid-cols-2">
                        <textarea 
                            placeholder="Détails du mandat..." 
                            value={task.description || ''} 
                            onChange={(e) => updateTaskDetail(task.id, 'description', e.target.value)}
                            className="bg-black/50 p-2 border border-white/5 w-full col-span-2 h-20"
                        />
                        <div className="col-span-2">
                            <label className="block text-[var(--accent-pink)] text-[8px] uppercase tracking-widest mb-1">Échéance</label>
                            <input type="date" value={task.dueDate || ''} onChange={(e) => updateTaskDetail(task.id, 'dueDate', e.target.value)} className="bg-black/50 p-2 border border-white/5 w-full"/>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[var(--accent-pink)] text-[8px] uppercase tracking-widest mb-1">Priorité</label>
                            <select value={task.priority || 'medium'} onChange={(e) => updateTaskDetail(task.id, 'priority', e.target.value)} className="bg-black/50 p-2 border border-white/5 w-full">
                                <option value="low">FAIBLE</option>
                                <option value="medium">MOYENNE</option>
                                <option value="high">HAUTE</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
