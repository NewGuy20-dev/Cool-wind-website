import { FailedCallTask } from '@/lib/failed-calls-types';
import { TaskManagementIntent } from './intelligent-message-analyzer';
import { ConversationContextData, CustomerInfo } from '@/lib/types/chat';
import { TicketService, ServiceTicket, TicketCreationRequest } from '@/lib/ticket-service';

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
   * Handle creating a new task with ticket service integration
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

      // Create both failed call task and service ticket
      const failedCallResponse = await fetch('/api/failed-calls', {
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

      let failedCallTask = null;
      if (failedCallResponse.ok) {
        failedCallTask = await failedCallResponse.json();
      }

      // Create service ticket with enhanced details
      const ticketRequest: TicketCreationRequest = {
        customerName: taskDetails.customerName,
        phoneNumber: taskDetails.phoneNumber,
        email: context.customerInfo?.email,
        location: taskDetails.location || 'Not specified',
        serviceType: this.inferServiceType(taskDetails.description),
        appliance: this.inferAppliance(taskDetails.description),
        problemDescription: taskDetails.description || 'Service request from chat',
        urgency: this.mapPriorityToUrgency(taskDetails.priority),
        source: 'chat',
        customerNotes: message,
        relatedFailedCallId: failedCallTask?.id
      };

      const ticket = await TicketService.createTicket(ticketRequest);

      return {
        success: true,
        taskId: ticket.id,
        message: `Perfect! I've created service ticket ${ticket.ticketNumber} for ${taskDetails.customerName}. ${ticket.estimatedResponseTime}, our team will contact you to schedule the service. You can reference this ticket using number ${ticket.ticketNumber}.`,
        task: this.convertTicketToTask(ticket),
        nextAction: 'ticket_created'
      };

    } catch (error) {
      console.error('❌ Failed to create task with ticket service:', error);
      return {
        success: false,
        message: "I encountered an issue creating your service request. Let me connect you with our support team directly.",
        error: error instanceof Error ? error.message : 'Unknown error',
        nextAction: 'escalate_to_human'
      };
    }
  }

  /**
   * Handle updating an existing ticket
   */
  private static async handleUpdateTask(
    intent: TaskManagementIntent,
    message: string,
    context: ConversationContextData,
    sessionId: string
  ): Promise<TaskOperationResult> {
    try {
      // Find the ticket to update
      const searchCriteria = this.buildTicketSearchCriteria(intent, context);
      const tickets = await TicketService.getTickets(searchCriteria);

      if (tickets.length === 0) {
        return {
          success: false,
          message: "I couldn't find any service requests matching your criteria. Could you provide more details like your phone number or ticket number?",
          nextAction: 'request_more_info'
        };
      }

      if (tickets.length > 1) {
        return {
          success: false,
          message: `I found ${tickets.length} service requests. Could you specify which one you'd like to update? You can provide the ticket number or more specific details.`,
          nextAction: 'clarify_task_selection'
        };
      }

      const ticket = tickets[0];
      const updates = this.extractTicketUpdateDetails(intent, message);

      const updatedTicket = await TicketService.updateTicket(ticket.id, updates);

      if (updatedTicket) {
        // Add communication entry
        await TicketService.addCommunication(ticket.id, {
          type: 'chat',
          direction: 'inbound',
          content: `Customer requested update: ${message}`,
          author: ticket.customerName
        });

        return {
          success: true,
          taskId: ticket.id,
          message: `I've successfully updated your service request (Ticket: ${ticket.ticketNumber}). The changes have been saved and our team will be notified.`,
          task: this.convertTicketToTask(updatedTicket),
          nextAction: 'ticket_updated'
        };
      } else {
        throw new Error('Update failed');
      }

    } catch (error) {
      console.error('❌ Failed to update ticket:', error);
      return {
        success: false,
        message: "I had trouble updating your service request. Let me connect you with our support team to help with this update.",
        error: error instanceof Error ? error.message : 'Unknown error',
        nextAction: 'escalate_to_human'
      };
    }
  }

  /**
   * Handle checking task status with ticket service
   */
  private static async handleStatusCheck(
    intent: TaskManagementIntent,
    message: string,
    context: ConversationContextData,
    sessionId: string
  ): Promise<TaskOperationResult> {
    try {
      // Search for tickets based on customer information
      const searchCriteria = this.buildTicketSearchCriteria(intent, context);
      const tickets = await TicketService.getTickets(searchCriteria);

      if (tickets.length === 0) {
        return {
          success: false,
          message: "I couldn't find any service requests for you. Could you provide your phone number or ticket number so I can check the status?",
          nextAction: 'request_identification'
        };
      }

      if (tickets.length === 1) {
        const ticket = tickets[0];
        const statusMessage = this.generateTicketStatusMessage(ticket);
        return {
          success: true,
          taskId: ticket.id,
          message: statusMessage,
          task: this.convertTicketToTask(ticket),
          nextAction: 'status_provided'
        };
      }

      // Multiple tickets found
      const statusSummary = this.generateMultipleTicketsStatus(tickets);
      return {
        success: true,
        message: statusSummary,
        nextAction: 'multiple_tickets_status'
      };

    } catch (error) {
      console.error('❌ Failed to check ticket status:', error);
      return {
        success: false,
        message: "I'm having trouble checking your request status right now. Please call us at +91 85472 29991 for an immediate status update.",
        error: error instanceof Error ? error.message : 'Unknown error',
        nextAction: 'escalate_to_phone'
      };
    }
  }

  /**
   * Handle listing tickets
   */
  private static async handleListTasks(
    intent: TaskManagementIntent,
    message: string,
    context: ConversationContextData,
    sessionId: string
  ): Promise<TaskOperationResult> {
    try {
      const searchCriteria = this.buildTicketSearchCriteria(intent, context);
      searchCriteria.limit = 5; // Limit to recent 5 tickets
      
      const tickets = await TicketService.getTickets(searchCriteria);

      if (tickets.length === 0) {
        return {
          success: true,
          message: "I don't see any service requests for you currently. Would you like me to create a new one?",
          nextAction: 'offer_ticket_creation'
        };
      }

      const listMessage = this.generateTicketList(tickets);
      return {
        success: true,
        message: listMessage,
        nextAction: 'tickets_listed'
      };

    } catch (error) {
      console.error('❌ Failed to list tickets:', error);
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

  /**
   * Infer service type from description
   */
  private static inferServiceType(description: string): ServiceTicket['serviceType'] {
    const desc = description.toLowerCase();
    
    if (desc.includes('emergency') || desc.includes('urgent') || desc.includes('critical')) {
      return 'emergency';
    }
    if (desc.includes('install') || desc.includes('installation')) {
      return 'installation';
    }
    if (desc.includes('maintenance') || desc.includes('service') || desc.includes('check')) {
      return 'maintenance';
    }
    if (desc.includes('refrigerator') || desc.includes('fridge')) {
      return 'refrigerator_repair';
    }
    if (desc.includes('consultation') || desc.includes('advice') || desc.includes('quote')) {
      return 'consultation';
    }
    
    return 'ac_repair'; // Default
  }

  /**
   * Infer appliance details from description
   */
  private static inferAppliance(description: string): ServiceTicket['appliance'] {
    const desc = description.toLowerCase();
    
    const appliance: ServiceTicket['appliance'] = {
      type: 'ac' // default
    };
    
    if (desc.includes('refrigerator') || desc.includes('fridge')) {
      appliance.type = 'refrigerator';
    } else if (desc.includes('ac') || desc.includes('air conditioner') || desc.includes('cooling')) {
      appliance.type = 'ac';
    } else {
      appliance.type = 'other';
    }
    
    // Try to extract brand
    const brands = ['samsung', 'lg', 'whirlpool', 'godrej', 'haier', 'voltas', 'blue star'];
    for (const brand of brands) {
      if (desc.includes(brand)) {
        appliance.brand = brand.charAt(0).toUpperCase() + brand.slice(1);
        break;
      }
    }
    
    return appliance;
  }

  /**
   * Map priority to urgency
   */
  private static mapPriorityToUrgency(priority?: string): ServiceTicket['urgency'] {
    switch (priority) {
      case 'high': return 'high';
      case 'low': return 'low';
      case 'critical': return 'critical';
      default: return 'medium';
    }
  }

  /**
   * Build ticket search criteria
   */
  private static buildTicketSearchCriteria(intent: TaskManagementIntent, context: ConversationContextData) {
    return {
      customerName: intent.taskDetails?.customerName || context.customerInfo?.name,
      phoneNumber: intent.taskDetails?.phoneNumber || context.customerInfo?.phone,
      status: intent.taskDetails?.status,
      priority: intent.taskDetails?.priority,
      limit: 10
    };
  }

  /**
   * Convert ticket to task format for compatibility
   */
  private static convertTicketToTask(ticket: ServiceTicket): Partial<FailedCallTask> {
    return {
      id: ticket.id,
      customerName: ticket.customerName,
      phoneNumber: ticket.phoneNumber,
      problemDescription: ticket.problemDescription,
      priority: ticket.priority as any,
      status: this.mapTicketStatusToTaskStatus(ticket.status),
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      notes: `Ticket: ${ticket.ticketNumber} | ${ticket.estimatedResponseTime}`
    };
  }

  /**
   * Map ticket status to task status
   */
  private static mapTicketStatusToTaskStatus(ticketStatus: ServiceTicket['status']): FailedCallTask['status'] {
    switch (ticketStatus) {
      case 'new': return 'new';
      case 'acknowledged': return 'progress';
      case 'scheduled': return 'scheduled';
      case 'in_progress': return 'progress';
      case 'completed': return 'completed';
      case 'cancelled': return 'completed';
      default: return 'new';
    }
  }

  /**
   * Generate ticket status message
   */
  private static generateTicketStatusMessage(ticket: ServiceTicket): string {
    const statusMap = {
      'new': 'New - We\'ve received your request and will contact you soon',
      'acknowledged': 'Acknowledged - Your request has been assigned to a technician',
      'scheduled': 'Scheduled - Your service appointment has been booked',
      'in_progress': 'In Progress - Our technician is working on your request',
      'completed': 'Completed - Your service request has been resolved',
      'cancelled': 'Cancelled - This request has been cancelled',
      'on_hold': 'On Hold - Temporarily paused, waiting for parts or customer availability'
    };

    const statusText = statusMap[ticket.status] || `Status: ${ticket.status}`;
    const createdDate = new Date(ticket.createdAt).toLocaleDateString();
    
    let message = `Here's the status of your service request:\n\n`;
    message += `🎫 **Ticket:** ${ticket.ticketNumber}\n`;
    message += `📋 **Service:** ${ticket.problemDescription}\n`;
    message += `📅 **Created:** ${createdDate}\n`;
    message += `🎯 **Priority:** ${ticket.priority.toUpperCase()}\n`;
    message += `📊 **Status:** ${statusText}\n`;
    
    if (ticket.assignedTechnician) {
      message += `👨‍🔧 **Technician:** ${ticket.assignedTechnician}\n`;
    }
    
    if (ticket.estimatedResponseTime) {
      message += `⏱️ **Response Time:** ${ticket.estimatedResponseTime}\n`;
    }
    
    if (ticket.scheduledAt) {
      message += `📅 **Scheduled:** ${new Date(ticket.scheduledAt).toLocaleString()}\n`;
    }
    
    message += `\nNeed any changes or have questions? Just let me know!`;
    
    return message;
  }

  /**
   * Generate status summary for multiple tickets
   */
  private static generateMultipleTicketsStatus(tickets: ServiceTicket[]): string {
    let summary = `I found ${tickets.length} service requests for you:\n\n`;
    
    tickets.forEach((ticket, index) => {
      const createdDate = new Date(ticket.createdAt).toLocaleDateString();
      const statusEmoji = this.getTicketStatusEmoji(ticket.status);
      
      summary += `${index + 1}. ${statusEmoji} **${ticket.problemDescription}**\n`;
      summary += `   🎫 ${ticket.ticketNumber} | 📅 ${createdDate} | 🎯 ${ticket.priority.toUpperCase()}\n\n`;
    });
    
    summary += "Would you like details about any specific request? Just mention the ticket number.";
    return summary;
  }

  /**
   * Generate ticket list message
   */
  private static generateTicketList(tickets: ServiceTicket[]): string {
    let list = `Here are your recent service requests:\n\n`;
    
    tickets.forEach((ticket, index) => {
      const createdDate = new Date(ticket.createdAt).toLocaleDateString();
      const statusEmoji = this.getTicketStatusEmoji(ticket.status);
      
      list += `${index + 1}. ${statusEmoji} **${ticket.problemDescription}**\n`;
      list += `   🎫 ${ticket.ticketNumber} | 📅 ${createdDate} | 🎯 ${ticket.priority.toUpperCase()}\n`;
      if (ticket.assignedTechnician) {
        list += `   👨‍🔧 ${ticket.assignedTechnician}\n`;
      }
      list += `\n`;
    });
    
    list += "Need to update any of these requests? Just let me know!";
    return list;
  }

  /**
   * Get emoji for ticket status
   */
  private static getTicketStatusEmoji(status: ServiceTicket['status']): string {
    const emojiMap = {
      'new': '🆕',
      'acknowledged': '👀',
      'scheduled': '📅',
      'in_progress': '⚙️',
      'completed': '✅',
      'cancelled': '❌',
      'on_hold': '⏸️'
    };
    return emojiMap[status] || '📋';
  }

  /**
   * Extract ticket update details from message
   */
  private static extractTicketUpdateDetails(intent: TaskManagementIntent, message: string): Partial<ServiceTicket> {
    const updates: Partial<ServiceTicket> = {};
    
    // Extract priority changes
    if (message.toLowerCase().includes('urgent') || message.toLowerCase().includes('emergency')) {
      updates.urgency = 'critical';
      updates.priority = 'critical';
    } else if (message.toLowerCase().includes('low priority') || message.toLowerCase().includes('no rush')) {
      updates.urgency = 'low';
      updates.priority = 'low';
    }
    
    // Extract status changes
    const statusKeywords = {
      'completed': ['completed', 'finished', 'done', 'resolved'],
      'in_progress': ['in progress', 'working on', 'started'],
      'scheduled': ['scheduled', 'appointment', 'booked'],
      'on_hold': ['hold', 'pause', 'wait']
    };
    
    for (const [status, keywords] of Object.entries(statusKeywords)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        updates.status = status as ServiceTicket['status'];
        break;
      }
    }
    
    // Include task details from intent
    if (intent.taskDetails) {
      if (intent.taskDetails.description) {
        updates.problemDescription = intent.taskDetails.description;
      }
    }
    
    // Add customer note
    updates.customerNotes = message;
    
    return updates;
  }
}