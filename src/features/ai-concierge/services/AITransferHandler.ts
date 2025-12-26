import { AITransferData, SupportCategory, TicketPriority } from '../types/support';
import { supportTicketService } from './SupportTicketService';

/**
 * Analyzes AI conversation to determine if escalation is needed
 */
export function analyzeConversationForEscalation(messages: Array<{ role: 'user' | 'assistant'; content: string }>): {
  shouldEscalate: boolean;
  category: SupportCategory;
  priority: TicketPriority;
  reason: string;
} {
  const conversationText = messages.map((m) => m.content).join(' ').toLowerCase();

  // Define escalation keywords and patterns
  const errorKeywords = ['error', 'crash', 'bug', 'failed', 'exception', 'not working'];
  const bankingKeywords = ['transfer failed', 'deposit', 'withdrawal', 'account locked', 'balance wrong'];
  const securityKeywords = ['unauthorized', 'fraud', 'hacked', 'suspicious', 'security concern'];
  const accessKeywords = ['cannot login', 'locked out', 'forgot password', 'account access'];
  const urgentKeywords = ['urgent', 'critical', 'emergency', 'asap', 'immediately'];

  let category = SupportCategory.OTHER;
  let priority = TicketPriority.MEDIUM;
  let shouldEscalate = false;
  let reason = '';

  // Check for security concerns (highest priority)
  if (securityKeywords.some((keyword) => conversationText.includes(keyword))) {
    shouldEscalate = true;
    category = SupportCategory.SECURITY_CONCERN;
    priority = TicketPriority.CRITICAL;
    reason = 'Security-related issue detected';
  }
  // Check for banking issues
  else if (bankingKeywords.some((keyword) => conversationText.includes(keyword))) {
    shouldEscalate = true;
    category = SupportCategory.BANKING_ISSUE;
    priority = TicketPriority.HIGH;
    reason = 'Banking-related issue that requires agent verification';
  }
  // Check for account access issues
  else if (accessKeywords.some((keyword) => conversationText.includes(keyword))) {
    shouldEscalate = true;
    category = SupportCategory.ACCOUNT_ACCESS;
    priority = TicketPriority.HIGH;
    reason = 'Account access issue requires verification';
  }
  // Check for app errors
  else if (errorKeywords.some((keyword) => conversationText.includes(keyword))) {
    shouldEscalate = true;
    category = SupportCategory.APP_ERROR;
    priority = TicketPriority.MEDIUM;
    reason = 'Technical error requires troubleshooting';
  }
  // Check for urgent indicators
  else if (urgentKeywords.some((keyword) => conversationText.includes(keyword))) {
    shouldEscalate = true;
    category = SupportCategory.OTHER;
    priority = TicketPriority.HIGH;
    reason = 'Customer marked issue as urgent';
  }
  // Check conversation length (long conversations might need agent help)
  else if (messages.length > 15) {
    shouldEscalate = true;
    category = SupportCategory.FEATURE_QUESTION;
    priority = TicketPriority.MEDIUM;
    reason = 'Prolonged conversation suggests need for human assistance';
  }

  return {
    shouldEscalate,
    category,
    priority,
    reason,
  };
}

/**
 * Create transfer data from AI conversation
 */
export function createAITransferData(
  conversationId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>,
): AITransferData {
  const analysis = analyzeConversationForEscalation(messages);

  // Extract summary from last few messages
  const lastUserMessage = messages
    .slice()
    .reverse()
    .find((m) => m.role === 'user')?.content || 'Support request';

  const suggestedResolution = messages
    .slice()
    .reverse()
    .find((m) => m.role === 'assistant')?.content;

  return {
    conversationId,
    summaryOfIssue: lastUserMessage,
    category: analysis.category,
    priority: analysis.priority,
    conversationHistory: messages,
    suggestedResolution,
    customerContext: {
      accountStatus: 'active',
      recentTransactions: 5,
      accountAge: '2 years',
    },
  };
}

/**
 * Handle AI to human handoff
 */
export async function handleAIToHumanHandoff(
  customerId: string,
  conversationId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>,
  requiresVerification: boolean = true,
): Promise<{ ticketId: string; ticketNumber: string; verificationRequired: boolean }> {
  try {
    // Create transfer data
    const transferData = createAITransferData(conversationId, messages);

    // Check escalation rules
    const rules = await supportTicketService.getEscalationRules();
    const lastMessage = messages[messages.length - 1]?.content || '';
    const escalationRule = await supportTicketService.checkEscalationTrigger(lastMessage);

    // Create support ticket
    const ticket = await supportTicketService.createTicketFromAITransfer(transferData, customerId);

    return {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      verificationRequired: requiresVerification || !!escalationRule?.requiresVerification,
    };
  } catch (error) {
    console.error('Failed to handle AI to human handoff:', error);
    throw error;
  }
}

/**
 * Determine if AI should offer to escalate based on conversation
 */
export function shouldOfferEscalation(messages: Array<{ role: 'user' | 'assistant'; content: string }>): boolean {
  const analysis = analyzeConversationForEscalation(messages);
  return analysis.shouldEscalate;
}

/**
 * Get escalation message for user
 */
export function getEscalationMessage(
  category: SupportCategory,
  priority: TicketPriority,
): string {
  const messages: Record<SupportCategory, string> = {
    [SupportCategory.APP_ERROR]:
      'I detected a technical issue that might need our technical team to investigate. Would you like me to connect you with a support agent?',
    [SupportCategory.BANKING_ISSUE]:
      'This seems to be a banking-related issue that requires verification by our support team. For your security, a support agent will help you resolve this.',
    [SupportCategory.ACCOUNT_ACCESS]:
      'For your account security, I need to connect you with a support agent who can verify your identity and help regain access.',
    [SupportCategory.TRANSACTION_ERROR]:
      'This transaction error requires investigation by our banking team. Let me connect you with an agent who can help.',
    [SupportCategory.FEATURE_QUESTION]:
      'For the best assistance with this feature, I\'d like to connect you with a support specialist. Is that okay?',
    [SupportCategory.SECURITY_CONCERN]:
      'This is a security matter that requires immediate attention from our security team. I\'m connecting you with an agent now.',
    [SupportCategory.OTHER]:
      'I think a support agent would be better equipped to help with this. Would you like me to transfer you?',
  };

  return messages[category] || messages[SupportCategory.OTHER];
}

/**
 * Extract error details from conversation
 */
export function extractErrorDetails(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): {
  errorCode?: string;
  errorMessage?: string;
  affectedFeature?: string;
  stepsToReproduce?: string[];
} {
  const conversationText = messages.map((m) => m.content).join(' ');

  // Extract error code pattern (e.g., ERR-001, ERROR_CODE_123)
  const errorCodeMatch = conversationText.match(/ERR[_-]?\d+|ERROR[_-]?\w+/gi);
  const errorCode = errorCodeMatch?.[0];

  // Extract affected feature
  let affectedFeature: string | undefined;
  const features = ['transfer', 'deposit', 'withdrawal', 'balance', 'account', 'card', 'payment'];
  affectedFeature = features.find((f) => conversationText.toLowerCase().includes(f));

  return {
    errorCode,
    errorMessage: conversationText.substring(0, 200),
    affectedFeature,
    stepsToReproduce: [],
  };
}
