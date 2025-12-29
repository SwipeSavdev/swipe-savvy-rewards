// Support Ticket and Case Management Types

export enum SupportCategory {
  APP_ERROR = 'app_error',
  BANKING_ISSUE = 'banking_issue',
  ACCOUNT_ACCESS = 'account_access',
  TRANSACTION_ERROR = 'transaction_error',
  FEATURE_QUESTION = 'feature_question',
  SECURITY_CONCERN = 'security_concern',
  OTHER = 'other',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export interface CustomerVerification {
  customerId: string;
  email: string;
  phone: string;
  lastFourSSN?: string;
  verificationMethod: 'email' | 'phone' | 'security_question';
  verificationCode?: string;
  isVerified: boolean;
  verifiedAt?: Date;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  category: SupportCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  errorDetails?: {
    errorCode?: string;
    errorMessage?: string;
    stackTrace?: string;
    affectedFeature?: string;
    stepsToReproduce?: string[];
  };
  bankingDetails?: {
    accountId?: string;
    transactionId?: string;
    amount?: number;
    affectedAccounts?: string[];
  };
  messages: TicketMessage[];
  assignedTo?: {
    agentId: string;
    agentName: string;
    assignedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  customerSatisfaction?: {
    rating: 1 | 2 | 3 | 4 | 5;
    feedback: string;
  };
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  senderName: string;
  message: string;
  attachments?: Attachment[];
  timestamp: Date;
  isRead: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface EscalationRequest {
  ticketId: string;
  reason: string;
  requestedPriority: TicketPriority;
  requestedAt: Date;
  requestedBy: 'customer' | 'agent';
  approvedBy?: string;
  approvalStatus: 'pending' | 'approved' | 'denied';
}

export interface AITransferData {
  conversationId: string;
  summaryOfIssue: string;
  category: SupportCategory;
  priority: TicketPriority;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  suggestedResolution?: string;
  customerContext?: {
    accountStatus: string;
    recentTransactions: number;
    accountAge: string;
  };
}

export interface AdminDashboardStats {
  totalOpenTickets: number;
  avgResolutionTime: number; // in hours
  customerSatisfactionScore: number; // 0-5
  ticketsByCategory: Record<SupportCategory, number>;
  ticketsByStatus: Record<TicketStatus, number>;
  agentPerformance: AgentMetrics[];
}

export interface AgentMetrics {
  agentId: string;
  agentName: string;
  ticketsResolved: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  activeTickets: number;
}

export interface CaseKnowledgeBase {
  id: string;
  title: string;
  description: string;
  category: SupportCategory;
  solutions: Solution[];
  relatedIssues: string[];
  tags: string[];
  updatedAt: Date;
}

export interface Solution {
  id: string;
  title: string;
  steps: string[];
  screenshots?: string[];
  videoUrl?: string;
  estimatedTime: number; // in minutes
  successRate: number; // 0-100
}

export interface ChatbotEscalationRule {
  id: string;
  trigger: string;
  condition: 'contains' | 'equals' | 'matches';
  category: SupportCategory;
  priority: TicketPriority;
  autoEscalate: boolean;
  requiresVerification: boolean;
}
