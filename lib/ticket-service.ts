import { v4 as uuidv4 } from 'uuid';
import { FailedCallTask } from './failed-calls-types';
import { readFailedCallsData, writeFailedCallsData } from './failed-calls-db';

export interface ServiceTicket {
  id: string;
  ticketNumber: string; // Human-readable ticket number (e.g., CWS-2024-001)
  
  // Customer Information
  customerName: string;
  phoneNumber: string;
  email?: string;
  location: string;
  
  // Service Details
  serviceType: 'ac_repair' | 'refrigerator_repair' | 'installation' | 'maintenance' | 'emergency' | 'consultation';
  appliance: {
    type: 'ac' | 'refrigerator' | 'other';
    brand?: string;
    model?: string;
    age?: string;
  };
  problemDescription: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  
  // Scheduling
  preferredDate?: string;
  preferredTime?: string;
  availability: string[];
  
  // Status & Tracking
  status: 'new' | 'acknowledged' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Assignment
  assignedTechnician?: string;
  technicianNotes?: string;
  estimatedDuration?: string;
  estimatedCost?: number;
  
  // Communication
  source: 'chat' | 'phone' | 'whatsapp' | 'email' | 'website' | 'walk_in';
  customerNotes?: string;
  internalNotes?: string;
  communicationLog: CommunicationEntry[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  completedAt?: string;
  
  // Integration
  relatedFailedCallId?: string; // Link to failed call management system
  followUpRequired: boolean;
  customerSatisfactionRating?: number;
  
  // Business Logic
  isEmergency: boolean;
  requiresPartOrdering: boolean;
  estimatedResponseTime: string;
  
  // Tags for categorization
  tags: string[];
}

export interface CommunicationEntry {
  id: string;
  timestamp: string;
  type: 'call' | 'sms' | 'whatsapp' | 'email' | 'chat' | 'internal_note';
  direction: 'inbound' | 'outbound' | 'internal';
  content: string;
  author: string; // technician name, system, customer
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface TicketCreationRequest {
  customerName: string;
  phoneNumber: string;
  email?: string;
  location: string;
  serviceType: ServiceTicket['serviceType'];
  appliance: ServiceTicket['appliance'];
  problemDescription: string;
  urgency?: ServiceTicket['urgency'];
  preferredDate?: string;
  preferredTime?: string;
  source: ServiceTicket['source'];
  customerNotes?: string;
  relatedFailedCallId?: string;
}

export class TicketService {
  private static ticketCounter = 1;
  
  /**
   * Create a new service ticket
   */
  static async createTicket(request: TicketCreationRequest): Promise<ServiceTicket> {
    const ticketNumber = this.generateTicketNumber();
    const priority = this.calculatePriority(request.urgency || 'medium', request.serviceType);
    const estimatedResponseTime = this.calculateResponseTime(priority, request.serviceType);
    
    const ticket: ServiceTicket = {
      id: uuidv4(),
      ticketNumber,
      
      // Customer Information
      customerName: request.customerName,
      phoneNumber: request.phoneNumber,
      email: request.email,
      location: request.location,
      
      // Service Details
      serviceType: request.serviceType,
      appliance: request.appliance,
      problemDescription: request.problemDescription,
      urgency: request.urgency || 'medium',
      
      // Scheduling
      preferredDate: request.preferredDate,
      preferredTime: request.preferredTime,
      availability: this.parseAvailability(request.preferredDate, request.preferredTime),
      
      // Status & Tracking
      status: 'new',
      priority,
      
      // Communication
      source: request.source,
      customerNotes: request.customerNotes,
      communicationLog: [{
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'internal_note',
        direction: 'internal',
        content: `Ticket created from ${request.source}`,
        author: 'system'
      }],
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Integration
      relatedFailedCallId: request.relatedFailedCallId,
      followUpRequired: true,
      
      // Business Logic
      isEmergency: priority === 'critical' || request.serviceType === 'emergency',
      requiresPartOrdering: this.checkIfPartsRequired(request.problemDescription),
      estimatedResponseTime,
      
      // Tags
      tags: this.generateTags(request)
    };
    
    // Save ticket and integrate with failed call system
    await this.saveTicket(ticket);
    
    // If related to failed call, update the failed call record
    if (request.relatedFailedCallId) {
      await this.linkToFailedCall(ticket, request.relatedFailedCallId);
    }
    
    // Trigger background processes
    this.triggerBackgroundProcesses(ticket);
    
    return ticket;
  }
  
  /**
   * Update an existing ticket
   */
  static async updateTicket(ticketId: string, updates: Partial<ServiceTicket>): Promise<ServiceTicket | null> {
    const tickets = await this.getAllTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex === -1) {
      return null;
    }
    
    const updatedTicket = {
      ...tickets[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Add communication entry for update
    if (updates.status || updates.priority || updates.assignedTechnician) {
      updatedTicket.communicationLog.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'internal_note',
        direction: 'internal',
        content: `Ticket updated: ${Object.keys(updates).join(', ')}`,
        author: 'admin'
      });
    }
    
    tickets[ticketIndex] = updatedTicket;
    await this.saveAllTickets(tickets);
    
    return updatedTicket;
  }
  
  /**
   * Get all tickets with optional filtering
   */
  static async getTickets(filters?: {
    status?: string;
    priority?: string;
    serviceType?: string;
    assignedTechnician?: string;
    dateRange?: { start: string; end: string };
    limit?: number;
  }): Promise<ServiceTicket[]> {
    let tickets = await this.getAllTickets();
    
    if (filters) {
      if (filters.status) {
        tickets = tickets.filter(t => t.status === filters.status);
      }
      if (filters.priority) {
        tickets = tickets.filter(t => t.priority === filters.priority);
      }
      if (filters.serviceType) {
        tickets = tickets.filter(t => t.serviceType === filters.serviceType);
      }
      if (filters.assignedTechnician) {
        tickets = tickets.filter(t => t.assignedTechnician === filters.assignedTechnician);
      }
      if (filters.dateRange) {
        const start = new Date(filters.dateRange.start);
        const end = new Date(filters.dateRange.end);
        tickets = tickets.filter(t => {
          const created = new Date(t.createdAt);
          return created >= start && created <= end;
        });
      }
      if (filters.limit) {
        tickets = tickets.slice(0, filters.limit);
      }
    }
    
    return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  /**
   * Get ticket by ID
   */
  static async getTicketById(ticketId: string): Promise<ServiceTicket | null> {
    const tickets = await this.getAllTickets();
    return tickets.find(t => t.id === ticketId) || null;
  }
  
  /**
   * Add communication entry to ticket
   */
  static async addCommunication(
    ticketId: string, 
    communication: Omit<CommunicationEntry, 'id' | 'timestamp'>
  ): Promise<boolean> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket) return false;
    
    const entry: CommunicationEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...communication
    };
    
    ticket.communicationLog.push(entry);
    ticket.updatedAt = new Date().toISOString();
    
    await this.updateTicket(ticketId, { 
      communicationLog: ticket.communicationLog,
      updatedAt: ticket.updatedAt 
    });
    
    return true;
  }
  
  /**
   * Generate human-readable ticket number
   */
  private static generateTicketNumber(): string {
    const year = new Date().getFullYear();
    const paddedCounter = String(this.ticketCounter++).padStart(4, '0');
    return `CWS-${year}-${paddedCounter}`;
  }
  
  /**
   * Calculate ticket priority based on urgency and service type
   */
  private static calculatePriority(urgency: ServiceTicket['urgency'], serviceType: ServiceTicket['serviceType']): ServiceTicket['priority'] {
    if (serviceType === 'emergency') return 'critical';
    
    switch (urgency) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return serviceType === 'ac_repair' ? 'medium' : 'low';
      case 'low': return 'low';
      default: return 'medium';
    }
  }
  
  /**
   * Calculate estimated response time
   */
  private static calculateResponseTime(priority: ServiceTicket['priority'], serviceType: ServiceTicket['serviceType']): string {
    if (serviceType === 'emergency') return 'Within 2 hours';
    
    switch (priority) {
      case 'critical': return 'Within 4 hours';
      case 'high': return 'Within 24 hours';
      case 'medium': return 'Within 48 hours';
      case 'low': return 'Within 3-5 business days';
      default: return 'Within 48 hours';
    }
  }
  
  /**
   * Parse availability from preferred date/time
   */
  private static parseAvailability(preferredDate?: string, preferredTime?: string): string[] {
    const availability: string[] = [];
    
    if (preferredDate) {
      if (preferredTime) {
        availability.push(`${preferredDate} ${preferredTime}`);
      } else {
        availability.push(`${preferredDate} (Any time)`);
      }
    } else {
      availability.push('Flexible scheduling');
    }
    
    return availability;
  }
  
  /**
   * Check if parts are likely required based on problem description
   */
  private static checkIfPartsRequired(problemDescription: string): boolean {
    const partsKeywords = [
      'compressor', 'thermostat', 'coil', 'motor', 'fan', 'filter',
      'seal', 'gasket', 'control board', 'sensor', 'valve', 'pump',
      'not cooling', 'not working', 'broken', 'damaged', 'replacement'
    ];
    
    const description = problemDescription.toLowerCase();
    return partsKeywords.some(keyword => description.includes(keyword));
  }
  
  /**
   * Generate tags for categorization
   */
  private static generateTags(request: TicketCreationRequest): string[] {
    const tags: string[] = [];
    
    // Service type tags
    tags.push(request.serviceType.replace('_', '-'));
    
    // Appliance tags
    tags.push(request.appliance.type);
    if (request.appliance.brand) {
      tags.push(request.appliance.brand.toLowerCase());
    }
    
    // Location tags
    tags.push(request.location.toLowerCase());
    
    // Source tags
    tags.push(`source-${request.source}`);
    
    // Urgency tags
    if (request.urgency && request.urgency !== 'medium') {
      tags.push(`urgency-${request.urgency}`);
    }
    
    return tags;
  }
  
  /**
   * Save ticket to storage
   */
  private static async saveTicket(ticket: ServiceTicket): Promise<void> {
    const tickets = await this.getAllTickets();
    tickets.push(ticket);
    await this.saveAllTickets(tickets);
  }
  
  /**
   * Get all tickets from storage
   */
  private static async getAllTickets(): Promise<ServiceTicket[]> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const ticketsPath = path.join(process.cwd(), 'data', 'service-tickets.json');
      
      // Ensure data directory exists
      await fs.mkdir(path.dirname(ticketsPath), { recursive: true });
      
      try {
        const data = await fs.readFile(ticketsPath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        // File doesn't exist, return empty array
        return [];
      }
    } catch (error) {
      console.error('Error reading tickets:', error);
      return [];
    }
  }
  
  /**
   * Save all tickets to storage
   */
  private static async saveAllTickets(tickets: ServiceTicket[]): Promise<void> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const ticketsPath = path.join(process.cwd(), 'data', 'service-tickets.json');
      
      await fs.writeFile(ticketsPath, JSON.stringify(tickets, null, 2));
    } catch (error) {
      console.error('Error saving tickets:', error);
      throw error;
    }
  }
  
  /**
   * Link ticket to failed call record
   */
  private static async linkToFailedCall(ticket: ServiceTicket, failedCallId: string): Promise<void> {
    try {
      const failedCalls = await readFailedCallsData();
      const failedCall = failedCalls.find(fc => fc.id === failedCallId);
      
      if (failedCall) {
        // Update failed call with ticket reference
        failedCall.notes = `${failedCall.notes || ''}\nService ticket created: ${ticket.ticketNumber}`;
        failedCall.updatedAt = new Date().toISOString();
        
        // If failed call is still new, mark as in progress since we have a ticket
        if (failedCall.status === 'new') {
          failedCall.status = 'progress';
        }
        
        await writeFailedCallsData(failedCalls);
      }
    } catch (error) {
      console.error('Error linking ticket to failed call:', error);
    }
  }
  
  /**
   * Trigger background processes for new ticket
   */
  private static triggerBackgroundProcesses(ticket: ServiceTicket): void {
    // Schedule automatic follow-up
    this.scheduleFollowUp(ticket);
    
    // Send notifications
    this.sendNotifications(ticket);
    
    // Auto-assign if possible
    this.attemptAutoAssignment(ticket);
  }
  
  /**
   * Schedule automatic follow-up
   */
  private static scheduleFollowUp(ticket: ServiceTicket): void {
    // In a real system, this would use a job queue or scheduler
    console.log(`📅 Scheduled follow-up for ticket ${ticket.ticketNumber}`);
    
    // Simulate scheduling based on priority
    const followUpDelay = {
      'critical': 1000 * 60 * 30, // 30 minutes
      'high': 1000 * 60 * 60 * 2, // 2 hours
      'medium': 1000 * 60 * 60 * 24, // 24 hours
      'low': 1000 * 60 * 60 * 48 // 48 hours
    };
    
    setTimeout(() => {
      this.performFollowUp(ticket.id);
    }, followUpDelay[ticket.priority] || followUpDelay.medium);
  }
  
  /**
   * Perform automatic follow-up
   */
  private static async performFollowUp(ticketId: string): Promise<void> {
    const ticket = await this.getTicketById(ticketId);
    if (!ticket || ticket.status === 'completed' || ticket.status === 'cancelled') {
      return;
    }
    
    // Add follow-up communication
    await this.addCommunication(ticketId, {
      type: 'internal_note',
      direction: 'internal',
      content: 'Automatic follow-up: Ticket requires attention',
      author: 'system'
    });
    
    console.log(`🔔 Follow-up triggered for ticket ${ticket.ticketNumber}`);
  }
  
  /**
   * Send notifications for new ticket
   */
  private static sendNotifications(ticket: ServiceTicket): void {
    // In a real system, this would send actual notifications
    console.log(`📧 Notifications sent for ticket ${ticket.ticketNumber}`);
    
    // Log notification in ticket
    setTimeout(async () => {
      await this.addCommunication(ticket.id, {
        type: 'internal_note',
        direction: 'internal',
        content: 'Customer notification sent',
        author: 'system'
      });
    }, 1000);
  }
  
  /**
   * Attempt automatic technician assignment
   */
  private static attemptAutoAssignment(ticket: ServiceTicket): void {
    // Simple auto-assignment logic based on service type and location
    const technicians: Record<string, string[]> = {
      'thiruvalla': ['Ravi Kumar', 'Suresh Nair'],
      'pathanamthitta': ['Anil Joseph', 'Priya Menon']
    };
    
    const location = ticket.location.toLowerCase();
    const availableTechs = (technicians as any)[location] || technicians['thiruvalla'];
    
    if (availableTechs.length > 0) {
      // Simple round-robin assignment
      const assignedTech = availableTechs[Math.floor(Math.random() * availableTechs.length)];
      
      setTimeout(async () => {
        await this.updateTicket(ticket.id, {
          assignedTechnician: assignedTech,
          status: 'acknowledged'
        });
        
        await this.addCommunication(ticket.id, {
          type: 'internal_note',
          direction: 'internal',
          content: `Auto-assigned to ${assignedTech}`,
          author: 'system'
        });
        
        console.log(`👨‍🔧 Ticket ${ticket.ticketNumber} auto-assigned to ${assignedTech}`);
      }, 2000);
    }
  }
  
  /**
   * Get ticket statistics
   */
  static async getTicketStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byServiceType: Record<string, number>;
    averageResponseTime: number;
    completionRate: number;
  }> {
    const tickets = await this.getAllTickets();
    
    const stats = {
      total: tickets.length,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byServiceType: {} as Record<string, number>,
      averageResponseTime: 0,
      completionRate: 0
    };
    
    tickets.forEach(ticket => {
      // Count by status
      (stats.byStatus as any)[ticket.status] = ((stats.byStatus as any)[ticket.status] || 0) + 1;
      
      // Count by priority
      (stats.byPriority as any)[ticket.priority] = ((stats.byPriority as any)[ticket.priority] || 0) + 1;
      
      // Count by service type
      (stats.byServiceType as any)[ticket.serviceType] = ((stats.byServiceType as any)[ticket.serviceType] || 0) + 1;
    });
    
    // Calculate completion rate
    const completedTickets = tickets.filter(t => t.status === 'completed').length;
    stats.completionRate = tickets.length > 0 ? (completedTickets / tickets.length) * 100 : 0;
    
    return stats;
  }
}