export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  isActive?: boolean;
}

export type WorkflowTrigger = 'TIME_BASED' | 'MESSAGE_RECEIVED' | 'PROFIT_THRESHOLD';
export type WorkflowAction = 'SEND_SMS' | 'SEND_EMAIL' | 'CREATE_TASK' | 'NOTIFY_USER';

export interface WorkflowDefinition {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  action: WorkflowAction;
  enabled: boolean;
  params: Record<string, any>;
}

export type AgentId = string;

export interface AgentProfile {
  id: AgentId;
  name: string;
  description: string;
  prompt: string;
  memoryRom: Record<string, any>;
  personality: string;
  skills: string[];
  iconName: string;
  color: string;
}
