import { AITransferData, SupportCategory, TicketPriority } from '../types/support';
import { supportTicketService } from './SupportTicketService';

/**
 * Enhanced escalation context for human handoff
 */
export interface EscalationContext {
  summary: string;
  customerIntent: string;
  attemptedResolutions: string[];
  sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry';
  keyDetails: Record<string, string>;
  conversationDuration: number;
  messageCount: number;
}

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
  const errorCodeRegex = /ERR[_-]?\d+|ERROR[_-]?\w+/gi;
  const errorCodeMatch = errorCodeRegex.exec(conversationText);
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

/**
 * Build enhanced escalation context for human handoff
 * Extracts key details, sentiment, and attempted resolutions from conversation
 */
export function buildEnhancedEscalationContext(
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>,
  sessionId: string,
): EscalationContext {
  const userMessages = messages.filter((m) => m.role === 'user');
  const assistantMessages = messages.filter((m) => m.role === 'assistant');

  // Calculate conversation duration
  const firstMessage = messages[0]?.timestamp;
  const lastMessage = messages[messages.length - 1]?.timestamp;
  const durationMs = firstMessage && lastMessage
    ? new Date(lastMessage).getTime() - new Date(firstMessage).getTime()
    : 0;
  const durationMinutes = Math.round(durationMs / 60000);

  // Extract customer intent from first few messages
  const customerIntent = userMessages.slice(0, 3).map((m) => m.content).join(' ').substring(0, 300);

  // Analyze sentiment
  const conversationText = userMessages.map((m) => m.content).join(' ').toLowerCase();
  let sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry' = 'neutral';

  const angryKeywords = ['angry', 'terrible', 'worst', 'awful', 'hate', 'ridiculous', 'unacceptable'];
  const frustratedKeywords = ['frustrat', 'annoying', 'not working', 'still not', 'again', 'keeps happening'];
  const positiveKeywords = ['thank', 'great', 'helpful', 'appreciate', 'excellent'];

  if (angryKeywords.some((k) => conversationText.includes(k))) {
    sentiment = 'angry';
  } else if (frustratedKeywords.some((k) => conversationText.includes(k))) {
    sentiment = 'frustrated';
  } else if (positiveKeywords.some((k) => conversationText.includes(k))) {
    sentiment = 'positive';
  }

  // Extract key details
  const keyDetails: Record<string, string> = {};

  // Transaction IDs
  const txnRegex = /txn[_-]?\w+|transaction[_\s]?(?:id)?[:\s]*([a-z0-9-]+)/i;
  const txnMatch = txnRegex.exec(conversationText);
  if (txnMatch) {
    keyDetails['transaction_id'] = txnMatch[1] || txnMatch[0];
  }

  // Amounts
  const amountRegex = /\$[\d,]+\.?\d*/;
  const amountMatch = amountRegex.exec(conversationText);
  if (amountMatch) {
    keyDetails['amount'] = amountMatch[0];
  }

  // Account numbers (last 4 digits only for security)
  const accountRegex = /account[:\s#]*\d*(\d{4})/i;
  const accountMatch = accountRegex.exec(conversationText);
  if (accountMatch) {
    keyDetails['account_last4'] = accountMatch[1];
  }

  // Merchant names
  const merchantRegex = /(?:at|from|to)\s+([A-Z][a-zA-Z\s&]+)(?:\s|,|\.)/;
  const merchantMatch = merchantRegex.exec(messages.map((m) => m.content).join(' '));
  if (merchantMatch) {
    keyDetails['merchant'] = merchantMatch[1].trim();
  }

  // Get attempted resolutions (last 3 assistant messages)
  const attemptedResolutions = assistantMessages
    .slice(-3)
    .map((m) => m.content.substring(0, 150) + (m.content.length > 150 ? '...' : ''));

  // Build summary
  const analysis = analyzeConversationForEscalation(messages);
  const summary = `[${analysis.category}] ${analysis.reason} - ${durationMinutes}min conversation, ${messages.length} messages, sentiment: ${sentiment}`;

  return {
    summary,
    customerIntent,
    attemptedResolutions,
    sentiment,
    keyDetails,
    conversationDuration: durationMinutes,
    messageCount: messages.length,
  };
}

/**
 * Handle AI to human handoff with enhanced context
 * Creates a support ticket with full conversation context for seamless transition
 */
export async function handleEnhancedAIToHumanHandoff(
  customerId: string,
  conversationId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>,
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    accountId?: string;
    tier?: string;
  },
): Promise<{
  ticketId: string;
  ticketNumber: string;
  priority: TicketPriority;
  estimatedWaitTime: string;
  agentMessage: string;
}> {
  // Build enhanced context
  const escalationContext = buildEnhancedEscalationContext(messages, conversationId);
  const analysis = analyzeConversationForEscalation(messages);

  // Create transfer data with enhanced context
  const transferData: AITransferData = {
    conversationId,
    summaryOfIssue: escalationContext.customerIntent,
    category: analysis.category,
    priority: analysis.priority,
    conversationHistory: messages,
    suggestedResolution: escalationContext.attemptedResolutions.join('\n'),
    customerContext: {
      accountStatus: 'active',
      recentTransactions: 5,
      accountAge: '2 years',
      sentiment: escalationContext.sentiment,
      keyDetails: escalationContext.keyDetails,
      ...customerInfo,
    },
  };

  // Adjust priority based on sentiment
  let finalPriority = analysis.priority;
  if (escalationContext.sentiment === 'angry' && finalPriority !== TicketPriority.CRITICAL) {
    finalPriority = TicketPriority.HIGH;
  }

  // Create the ticket
  const ticket = await supportTicketService.createTicketFromAITransfer(transferData, customerId);

  // Estimate wait time based on priority
  const waitTimeMap: Record<TicketPriority, string> = {
    [TicketPriority.CRITICAL]: 'immediate',
    [TicketPriority.HIGH]: '5-10 minutes',
    [TicketPriority.MEDIUM]: '15-30 minutes',
    [TicketPriority.LOW]: '1-2 hours',
  };

  // Generate personalized agent message
  const agentMessages: Record<string, string> = {
    angry: "I completely understand your frustration, and I sincerely apologize for this experience. I've escalated your case to a senior agent who will help resolve this right away.",
    frustrated: "I hear you, and I want to make sure we get this resolved properly. I'm connecting you with a support specialist who can help.",
    positive: "Thank you for your patience! I'm connecting you with one of our support specialists who can help with this specific request.",
    neutral: "I'm connecting you with a support agent who can assist further. They'll have full context of our conversation.",
  };

  return {
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    priority: finalPriority,
    estimatedWaitTime: waitTimeMap[finalPriority],
    agentMessage: agentMessages[escalationContext.sentiment],
  };
}

/**
 * Generate a handoff summary for the support agent
 * Provides concise context without requiring agent to read full transcript
 */
export function generateAgentHandoffSummary(
  context: EscalationContext,
  analysis: ReturnType<typeof analyzeConversationForEscalation>,
): string {
  const lines = [
    `## AI Handoff Summary`,
    ``,
    `**Category:** ${analysis.category}`,
    `**Priority:** ${analysis.priority}`,
    `**Customer Sentiment:** ${context.sentiment}`,
    `**Conversation Duration:** ${context.conversationDuration} minutes (${context.messageCount} messages)`,
    ``,
    `### Customer's Issue`,
    context.customerIntent,
    ``,
    `### Key Details Identified`,
  ];

  for (const [key, value] of Object.entries(context.keyDetails)) {
    lines.push(`- **${key.replaceAll('_', ' ')}:** ${value}`);
  }

  if (context.attemptedResolutions.length > 0) {
    lines.push(``, `### AI Attempted Resolutions`);
    context.attemptedResolutions.forEach((resolution, i) => {
      lines.push(`${i + 1}. ${resolution}`);
    });
  }

  lines.push(``, `### Escalation Reason`, analysis.reason);

  return lines.join('\n');
}
