import { WorkflowDefinition, WorkflowAction } from '../types';

type ActionHandler = (params: any) => Promise<void>;

class AutomationService {
  private workflows: WorkflowDefinition[] = [];
  private handlers: Map<WorkflowAction, ActionHandler> = new Map();

  constructor() {
    // Enregistrement des gestionnaires d'actions par défaut
    this.handlers.set('SEND_SMS', async (p) => console.log(`[ACTION] SMS envoyé à ${p.to}: ${p.message}`));
    this.handlers.set('SEND_EMAIL', async (p) => console.log(`[ACTION] Email envoyé à ${p.to}: ${p.message}`));
    this.handlers.set('CREATE_TASK', async (p) => console.log(`[ACTION] Tâche créée: ${p.title}`));
  }

  registerWorkflow(workflow: WorkflowDefinition) {
    this.workflows.push(workflow);
    console.log(`[MAGNA_AUTOMATION] Workflow registered: ${workflow.name}`);
  }

  async executeWorkflow(workflowId: string, context: any) {
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (!workflow || !workflow.enabled) return;

    console.log(`[MAGNA_AUTOMATION] Initialisation workflow: ${workflow.name}`);
    
    const handler = this.handlers.get(workflow.action);
    if (handler) {
      // Injection du contexte métier dans les paramètres de l'action
      const params = { ...workflow.params, ...context };
      await handler(params);
    }
  }
}

export const automationService = new AutomationService();
