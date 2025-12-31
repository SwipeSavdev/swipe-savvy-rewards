import axios, { AxiosInstance } from 'axios';
import {
  SupportTicket,
  SupportCategory,
  TicketPriority,
  TicketStatus,
  AITransferData,
  EscalationRequest,
  AdminDashboardStats,
  CaseKnowledgeBase,
  ChatbotEscalationRule,
} from '../types/support';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export class SupportTicketService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/v1/admin/support`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a support ticket from AI conversation transfer
   */
  async createTicketFromAITransfer(
    data: AITransferData,
    customerId: string,
  ): Promise<SupportTicket> {
    try {
      const response = await this.api.post('/tickets/from-ai-transfer', {
        customerId,
        category: data.category,
        priority: data.priority,
        subject: data.summaryOfIssue,
        description: data.summaryOfIssue,
        conversationHistory: data.conversationHistory,
        suggestedResolution: data.suggestedResolution,
        customerContext: data.customerContext,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create ticket from AI transfer:', error);
      throw error;
    }
  }

  /**
   * Create a manual support ticket
   */
  async createTicket(
    customerId: string,
    category: SupportCategory,
    priority: TicketPriority,
    subject: string,
    description: string,
    errorDetails?: any,
  ): Promise<SupportTicket> {
    try {
      const response = await this.api.post('/tickets', {
        customerId,
        category,
        priority,
        subject,
        description,
        errorDetails,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create ticket:', error);
      throw error;
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: string): Promise<SupportTicket> {
    try {
      const response = await this.api.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      throw error;
    }
  }

  /**
   * Get all tickets for a customer
   */
  async getCustomerTickets(customerId: string): Promise<SupportTicket[]> {
    try {
      const response = await this.api.get(`/tickets/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customer tickets:', error);
      throw error;
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    notes?: string,
  ): Promise<SupportTicket> {
    try {
      const response = await this.api.patch(`/tickets/${ticketId}/status`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      throw error;
    }
  }

  /**
   * Add message to ticket
   */
  async addTicketMessage(
    ticketId: string,
    message: string,
    senderType: 'customer' | 'agent' | 'system',
  ): Promise<SupportTicket> {
    try {
      const response = await this.api.post(`/tickets/${ticketId}/messages`, {
        message,
        senderType,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add ticket message:', error);
      throw error;
    }
  }

  /**
   * Escalate ticket with reason
   */
  async escalateTicket(
    ticketId: string,
    reason: string,
    targetPriority: TicketPriority,
  ): Promise<EscalationRequest> {
    try {
      const response = await this.api.post(`/tickets/${ticketId}/escalate`, {
        reason,
        targetPriority,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to escalate ticket:', error);
      throw error;
    }
  }

  /**
   * Rate and close ticket
   */
  async closeTicketWithFeedback(
    ticketId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    feedback: string,
    resolution?: string,
  ): Promise<SupportTicket> {
    try {
      const response = await this.api.post(`/tickets/${ticketId}/close`, {
        rating,
        feedback,
        resolution,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to close ticket:', error);
      throw error;
    }
  }

  /**
   * Get knowledge base articles for category
   */
  async getKnowledgeBase(category: SupportCategory): Promise<CaseKnowledgeBase[]> {
    try {
      const response = await this.api.get(`/knowledge-base`, {
        params: { category },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch knowledge base:', error);
      throw error;
    }
  }

  /**
   * Search knowledge base
   */
  async searchKnowledgeBase(query: string): Promise<CaseKnowledgeBase[]> {
    try {
      const response = await this.api.get(`/knowledge-base/search`, {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search knowledge base:', error);
      throw error;
    }
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const response = await this.api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get chatbot escalation rules
   */
  async getEscalationRules(): Promise<ChatbotEscalationRule[]> {
    try {
      const response = await this.api.get('/admin/escalation-rules');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch escalation rules:', error);
      throw error;
    }
  }

  /**
   * Check if message should trigger escalation
   */
  async checkEscalationTrigger(message: string): Promise<ChatbotEscalationRule | null> {
    try {
      const response = await this.api.post('/admin/check-escalation', {
        message,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check escalation trigger:', error);
      throw error;
    }
  }

  /**
   * Log error details for ticket
   */
  async logErrorDetails(
    ticketId: string,
    errorCode: string,
    errorMessage: string,
    stackTrace: string,
    affectedFeature: string,
    stepsToReproduce: string[],
  ): Promise<void> {
    try {
      await this.api.post(`/tickets/${ticketId}/error-details`, {
        errorCode,
        errorMessage,
        stackTrace,
        affectedFeature,
        stepsToReproduce,
      });
    } catch (error) {
      console.error('Failed to log error details:', error);
      throw error;
    }
  }
}

// Singleton instance
export const supportTicketService = new SupportTicketService();
