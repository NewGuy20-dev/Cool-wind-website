import { FailedCallTask } from '@/lib/failed-calls-types';
import { TaskManagementIntent } from './intelligent-message-analyzer';
import { ConversationContextData, CustomerInfo } from '@/lib/types/chat';

export interface TaskOperationResult {
  success: boolean;
  taskId?: string;
  message: string;
  task?: FailedCallTask;
  error?: string;
  nextAction?: string;
  missingInfo?: string[];
}

export interface TaskSearchCriteria {
  customerName?: string;
  phoneNumber?: string;
  status?: string;
  priority?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  limit?: number;
}

export class TaskManagementAgent {
  /**
   * Handle task management based on detected intent
   */
  static async handleTaskManagement(
    intent: TaskManagementIntent,
    message: string,
    context: ConversationContextData,
    sessionId: string
  ): Promise<TaskOperationResult> {
    console.log(`🎯 Handling task management: ${intent.action} with confidence ${intent.confidence}%`);

    switch (intent.action) {
      case 'create':
        return this.handleCreateTask(intent, message, context, sessionId);
      
      case 'edit':
      case 'update':
        return this.handleUpdateTask(intent, message, context, sessionId);
      
      case 'status':
        return this.handleStatusCheck(intent, message, context, sessionId);
      
      case 'list':
        return this.handleListTasks(intent, message, context, sessionId);
      
      case 'delete':
        return this.handleDeleteTask(intent, message, context, sessionId);
      
      default:
        return {
          success: false,
          message: "I'm not sure what task operation you'd like me to perform. Could you please clarify?",
          nextAction: 'clarify_intent'
        };
    }
  }

  /**
   * Handle creating a new task
   */
  private static async handleCreateTask(
    intent: TaskManagementIntent,
    message: string,
    context: ConversationContextData,
    sessionId: string
  ): Promise<TaskOperationResult> {
    try {
      // Extract task details from intent and context
      const taskDetails = this.extractTaskDetails(intent, context);
      
      // Check for missing required information
      const missingInfo = this.validateTaskCreation(taskDetails);
      if (missingInfo.length > 0) {
        return {
          success: false,
          message: this.generateMissingInfoMessage(missingInfo),
          nextAction: 'collect_missing_info',
          missingInfo
        };
      }

      // Create the task
      const response = await fetch('/api/failed-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: taskDetails.customerName,
          phoneNumber: taskDetails.phoneNumber,
          problemDescription: taskDetails.description || 'Service request from chat',
          priority: taskDetails.priority || 'medium',
          status: 'new',
          callbackPreference: 'phone',
          notes: `Created via chat on ${new Date().toISOString()}`,
          source: 'chat-agent'
        })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          taskId: result.id,
          message: `Perfect! I've created a new service request for ${taskDetails.customerName}. Your request ID is ${result.id}. Our team will contact you soon to schedule the service.`,
          task: result,
          nextAction: 'task_created'
        };
      } else {
        throw new Error(`API Error: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Failed to create task:', error);
      return {
        success: false,
        message: "I encountered an issue creating your service request. Let me connect you with our support team directly.",
        error: error instanceof Error ? error.message : 'Unknown error',
        nextAction: 'escalate_to_human'
      };
    }
  }

  /**
   * Handle updating an existing task
   */
  private static async handleUpdateTask(
    intent: TaskManagementIntent,
    message: string,
    context: ConversationContextData,
    sessionId: string
  ): Promise<TaskOperationResult> {
    try {
      // First, find the task to update
      const searchCriteria = this.buildSearchCriteria(intent, context);
      const tasks = await this.searchTasks(searchCriteria);

      if (tasks.length === 0) {
        return {
          success: false,
          message: "I couldn't find any service requests matching your criteria. Could you provide more details like your phone number or request ID?",
          nextAction: 'request_more_info'
        };
      }

      if (tasks.length > 1) {
        return {
          success: false,
          message: `I found ${tasks.length} service requests. Could you specify which one you'd like to update? You can provide the request ID or more specific details.`,
          nextAction: 'clarify_task_selection'
        };
      }

      const task = tasks[0];
      const updates = this.extractUpdateDetails(intent, message);

      // Update the task
      const response = await fetch(`/api/failed-calls/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date().toISOString(),
          notes: `${task.notes || ''}\nUpdated via chat: ${message}`
        })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        return {
          success: true,
          taskId: task.id,
          message: `I've successfully updated your service request (ID: ${task.id}). The changes have been saved and our team will be notified.`,
          task: updatedTask,
          nextAction: 'task_updated'
        };
      } else {
        throw new Error(`Update failed: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Failed to update task:', error);
      return {
        success: false,
        message: "I had trouble updating your service request. Let me connect you with our support team to help with this update.",
        error: error instanceof Error ? error.message : 'Unknown error',
        nextAction: 'escalate_to_human'
      };
    }
  }

  /**
   * Handle checking task status
   */
  private static async handleStatusCheck(
    intent: TaskManagementIntent,
    message: string,
    context: ConversationContextData,
    sessionId: string
  ): Promise<TaskOperationResult> {
    try {
      const searchCriteria = this.buildSearchCriteria(intent, context);
      const tasks = await this.searchTasks(searchCriteria);

      if (tasks.length === 0) {
        return {
          success: false,
          message: "I couldn't find any service requests for you. Could you provide your phone number or request ID so I can check the status?",
          nextAction: 'request_identification'
        };
      }

      if (tasks.length === 1) {
        const task = tasks[0];
        const statusMessage = this.generateStatusMessage(task);
        return {
          success: true,
          taskId: task.id,
          message: statusMessage,
          task,
          nextAction: 'status_provided'
        };
      }

      // Multiple tasks found
      const statusSummary = this.generateMultipleTasksStatus(tasks);
      return {
        success: true,
        message: statusSummary,
        nextAction: 'multiple_tasks_status'
      };

    } catch (error) {
      console.error('❌ Failed to check task status:', error);
      return {
        success: false,
        message: "I'm having trouble checking your request status right now. Please call us at +91 85472 29991 for an immediate status update.",
        error: error instanceof Error ? error.message : 'Unknown error',
        nextAction: 'escalate_to_phone'
      };
    }
  }

  /**
   * Handle listing tasks
   */
  private static async handleListTasks(
    intent: TaskManagementIntent,
    message: string,
    context: ConversationContextData,
    sessionId: string
  ): Promise<TaskOperationResult> {
    try {
      const searchCriteria = this.buildSearchCriteria(intent, context);
      searchCriteria.limit = 5; // Limit to recent 5 tasks
      
      const tasks = await this.searchTasks(searchCriteria);

      if (tasks.length === 0) {
        return {
          success: true,
          message: "I don't see any service requests for you currently. Would you like me to create a new one?",
          nextAction: 'offer_task_creation'
        };
      }

      const listMessage = this.generateTaskList(tasks);
      return {
        success: true,
        message: listMessage,
        nextAction: 'tasks_listed'
      };

    } catch (error) {
      console.error('❌ Failed to list tasks:', error);
      return {
        success: false,
        message: "I'm having trouble retrieving your service requests. Please call us at +91 85472 29991 for assistance.",
        error: error instanceof Error ? error.message : 'Unknown error',
        nextAction: 'escalate_to_phone'
      };
    }
  }

  /**
   * Handle deleting a task
   */
  private static async handleDeleteTask(
    intent: TaskManagementIntent,
    message: string,
    context: ConversationContextData,
    sessionId: string
  ): Promise<TaskOperationResult> {
    try {
      const searchCriteria = this.buildSearchCriteria(intent, context);
      const tasks = await this.searchTasks(searchCriteria);

      if (tasks.length === 0) {
        return {
          success: false,
          message: "I couldn't find the service request you want to cancel. Could you provide the request ID or your phone number?",
          nextAction: 'request_identification'
        };
      }

      if (tasks.length > 1) {
        return {
          success: false,
          message: `I found ${tasks.length} requests. Which specific request would you like to cancel? Please provide the request ID.`,
          nextAction: 'clarify_task_selection'
        };
      }

      const task = tasks[0];
      
      // Instead of deleting, mark as cancelled
      const response = await fetch(`/api/failed-calls/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
          notes: `${task.notes || ''}\nCancelled via chat: ${message}`
        })
      });

      if (response.ok) {
        return {
          success: true,
          taskId: task.id,
          message: `I've cancelled your service request (ID: ${task.id}). If you need service in the future, just let me know!`,
          nextAction: 'task_cancelled'
        };
      } else {
        throw new Error(`Cancellation failed: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Failed to cancel task:', error);
      return {
        success: false,
        message: "I had trouble cancelling your request. Please call us at +91 85472 29991 to cancel directly.",
        error: error instanceof Error ? error.message : 'Unknown error',
        nextAction: 'escalate_to_phone'
      };
    }
  }

  /**
   * Extract task details from intent and context
   */
  private static extractTaskDetails(intent: TaskManagementIntent, context: ConversationContextData) {
    return {
      customerName: intent.taskDetails?.customerName || 
                  context.customerInfo?.name || 
                  'Customer',
      phoneNumber: intent.taskDetails?.phoneNumber || 
                  context.customerInfo?.phone || '',
      description: intent.taskDetails?.description || 
                  context.inquiryDetails?.description || 
                  'Service request from chat',
      priority: intent.taskDetails?.priority || 'medium',
      location: intent.taskDetails?.location || 
               context.customerInfo?.location || 
               context.inquiryDetails?.location || ''
    };
  }

  /**
   * Validate task creation requirements
   */
  private static validateTaskCreation(taskDetails: any): string[] {
    const missing: string[] = [];
    
    if (!taskDetails.customerName || taskDetails.customerName === 'Customer') {
      missing.push('customer name');
    }
    if (!taskDetails.phoneNumber) {
      missing.push('phone number');
    }
    if (!taskDetails.description || taskDetails.description === 'Service request from chat') {
      missing.push('service description');
    }
    
    return missing;
  }

  /**
   * Generate message for missing information
   */
  private static generateMissingInfoMessage(missingInfo: string[]): string {
    const fields = missingInfo.join(', ').replace(/, ([^,]*)$/, ', and $1');
    return `To create your service request, I need a few more details: ${fields}. Could you please provide this information?`;
  }

  /**
   * Build search criteria from intent and context
   */
  private static buildSearchCriteria(intent: TaskManagementIntent, context: ConversationContextData): TaskSearchCriteria {
    return {
      customerName: intent.taskDetails?.customerName || context.customerInfo?.name,
      phoneNumber: intent.taskDetails?.phoneNumber || context.customerInfo?.phone,
      status: intent.taskDetails?.status,
      priority: intent.taskDetails?.priority
    };
  }

  /**
   * Search for tasks based on criteria
   */
  private static async searchTasks(criteria: TaskSearchCriteria): Promise<FailedCallTask[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (criteria.customerName) queryParams.append('customerName', criteria.customerName);
      if (criteria.phoneNumber) queryParams.append('phoneNumber', criteria.phoneNumber);
      if (criteria.status) queryParams.append('status', criteria.status);
      if (criteria.priority) queryParams.append('priority', criteria.priority);
      if (criteria.limit) queryParams.append('limit', criteria.limit.toString());

      const response = await fetch(`/api/failed-calls?${queryParams.toString()}`);
      
      if (response.ok) {
        const tasks = await response.json();
        return Array.isArray(tasks) ? tasks : [];
      } else {
        throw new Error(`Search failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Task search failed:', error);
      return [];
    }
  }

  /**
   * Extract update details from message
   */
  private static extractUpdateDetails(intent: TaskManagementIntent, message: string): Partial<FailedCallTask> {
    const updates: Partial<FailedCallTask> = {};
    
    // Extract priority changes
    if (message.toLowerCase().includes('urgent') || message.toLowerCase().includes('emergency')) {
      updates.priority = 'high';
    } else if (message.toLowerCase().includes('low priority') || message.toLowerCase().includes('no rush')) {
      updates.priority = 'low';
    }
    
    // Extract status changes
    const statusKeywords = {
      'completed': ['completed', 'finished', 'done', 'resolved'],
      'progress': ['in progress', 'working on', 'started'],
      'scheduled': ['scheduled', 'appointment', 'booked']
    };
    
    for (const [status, keywords] of Object.entries(statusKeywords)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        updates.status = status as any;
        break;
      }
    }
    
    // Include task details from intent
    if (intent.taskDetails) {
      if (intent.taskDetails.description) {
        updates.problemDescription = intent.taskDetails.description;
      }
      if (intent.taskDetails.priority) {
        updates.priority = intent.taskDetails.priority as any;
      }
    }
    
    return updates;
  }

  /**
   * Generate status message for a single task
   */
  private static generateStatusMessage(task: FailedCallTask): string {
    const statusMap = {
      'new': 'New - We\'ve received your request and will contact you soon',
      'unavailable': 'Customer Unavailable - We tried calling but couldn\'t reach you',
      'scheduled': 'Scheduled - Your service appointment has been booked',
      'progress': 'In Progress - Our technician is working on your request',
      'completed': 'Completed - Your service request has been resolved',
      'cancelled': 'Cancelled - This request has been cancelled'
    };

    const statusText = statusMap[task.status] || `Status: ${task.status}`;
    const createdDate = new Date(task.createdAt).toLocaleDateString();
    
    return `Here's the status of your service request (ID: ${task.id}):

📋 **${task.problemDescription}**
📅 Created: ${createdDate}
🎯 Priority: ${task.priority.toUpperCase()}
📊 Status: ${statusText}

${task.notes ? `📝 Notes: ${task.notes}` : ''}

Need any changes or have questions? Just let me know!`;
  }

  /**
   * Generate status summary for multiple tasks
   */
  private static generateMultipleTasksStatus(tasks: FailedCallTask[]): string {
    let summary = `I found ${tasks.length} service requests for you:\n\n`;
    
    tasks.forEach((task, index) => {
      const createdDate = new Date(task.createdAt).toLocaleDateString();
      summary += `${index + 1}. **${task.problemDescription}** (ID: ${task.id})
   📅 ${createdDate} | 🎯 ${task.priority.toUpperCase()} | 📊 ${task.status.toUpperCase()}\n\n`;
    });
    
    summary += "Would you like details about any specific request? Just mention the ID number.";
    return summary;
  }

  /**
   * Generate task list message
   */
  private static generateTaskList(tasks: FailedCallTask[]): string {
    let list = `Here are your recent service requests:\n\n`;
    
    tasks.forEach((task, index) => {
      const createdDate = new Date(task.createdAt).toLocaleDateString();
      const statusEmoji = this.getStatusEmoji(task.status);
      
      list += `${index + 1}. ${statusEmoji} **${task.problemDescription}**
   ID: ${task.id} | ${createdDate} | ${task.priority.toUpperCase()} priority\n\n`;
    });
    
    list += "Need to update any of these requests? Just let me know!";
    return list;
  }

  /**
   * Get emoji for task status
   */
  private static getStatusEmoji(status: string): string {
    const emojiMap = {
      'new': '🆕',
      'unavailable': '📞',
      'scheduled': '📅',
      'progress': '⚙️',
      'completed': '✅',
      'cancelled': '❌'
    };
    return emojiMap[status] || '📋';
  }
}