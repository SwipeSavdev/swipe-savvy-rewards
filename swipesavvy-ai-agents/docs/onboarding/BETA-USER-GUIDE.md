# SwipeSavvy AI Agents - Beta User Guide

**Welcome to the Beta Program!** 🎉

Thank you for joining the SwipeSavvy AI Agents beta testing program. This guide will help you get started with our intelligent financial assistant.

---

## What is SwipeSavvy AI?

SwipeSavvy AI is your personal financial assistant powered by advanced AI. It helps you:

- ✅ Check account balances instantly
- ✅ Review recent transactions
- ✅ Transfer money between accounts
- ✅ Pay bills with simple commands
- ✅ Get financial insights and recommendations
- ✅ Ask questions in natural language

---

## Getting Started

### 1. Access the Platform

**API Endpoint**: `https://api.swipesavvy.com`

**Authentication**: You'll receive your API credentials via email:
- `user_id`: Your unique identifier
- `api_key`: Your authentication key (keep this secret!)

### 2. Making Your First Request

**Example using cURL**:

```bash
curl -X POST https://api.swipesavvy.com/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "message": "What is my balance?",
    "user_id": "YOUR_USER_ID"
  }'
```

**Example Response**:

```json
{
  "response": "Your current balance is $1,234.56 in your checking account.",
  "session_id": "sess_abc123",
  "message_id": "msg_xyz789",
  "metadata": {
    "tool_used": "get_account_balance",
    "action_performed": "balance_check"
  }
}
```

### 3. Continue the Conversation

Use the `session_id` to maintain context across messages:

```bash
curl -X POST https://api.swipesavvy.com/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "message": "Show me my last 5 transactions",
    "user_id": "YOUR_USER_ID",
    "session_id": "sess_abc123"
  }'
```

---

## Common Use Cases

### Check Balance

**You say**: "What's my balance?" or "How much money do I have?"

**AI responds**: "Your current balance is $1,234.56 in your checking account."

---

### View Transactions

**You say**: "Show me my recent transactions" or "What did I spend on yesterday?"

**AI responds**: 
```
Here are your last 5 transactions:
1. Starbucks - $5.75 (Today, 9:15 AM)
2. Amazon - $49.99 (Yesterday, 3:45 PM)
3. Shell Gas Station - $35.00 (Yesterday, 8:30 AM)
4. Whole Foods - $87.23 (Dec 21, 6:15 PM)
5. Netflix - $15.99 (Dec 21, 12:00 PM)
```

---

### Transfer Money

**You say**: "Transfer $100 from checking to savings"

**AI responds**: "I can help you transfer $100 from your checking account to your savings account. Please confirm to proceed."

**You say**: "Confirm"

**AI responds**: "✓ Successfully transferred $100 from checking to savings. Your new checking balance is $1,134.56."

---

### Pay Bills

**You say**: "Pay my electricity bill"

**AI responds**: "I found your electricity bill: $85.50 due on Dec 28. Would you like to pay it now?"

**You say**: "Yes, pay it"

**AI responds**: "✓ Payment of $85.50 scheduled for your electricity bill."

---

## Advanced Features

### Multi-Step Conversations

The AI maintains context across multiple messages. You can have natural conversations:

```
You: "How much did I spend on dining last month?"
AI:  "You spent $325.50 on dining last month."

You: "What about this month?"
AI:  "This month you've spent $187.25 on dining so far."

You: "Is that more or less than usual?"
AI:  "That's about 15% less than your average monthly dining spend of $220."
```

### Quick Actions

Use simple commands for common tasks:

| Command | Action |
|---------|--------|
| `balance` | Check current balance |
| `transactions` | View recent transactions |
| `transfer` | Start money transfer |
| `bills` | View and pay bills |
| `help` | Get assistance |

---

## API Reference

### Send Message

**Endpoint**: `POST /api/v1/chat`

**Request Body**:
```json
{
  "message": "Your question or command",
  "user_id": "your_user_id",
  "session_id": "optional_session_id"
}
```

**Response**:
```json
{
  "response": "AI's response",
  "session_id": "session_id",
  "message_id": "unique_message_id",
  "metadata": {
    "tool_used": "tool_name",
    "action_performed": "action_type"
  }
}
```

---

### Get Session History

**Endpoint**: `GET /api/v1/sessions/{session_id}`

**Response**:
```json
{
  "session_id": "sess_abc123",
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "What's my balance?",
      "timestamp": "2025-12-23T10:30:00Z"
    },
    {
      "id": "msg_2",
      "role": "assistant",
      "content": "Your current balance is $1,234.56",
      "timestamp": "2025-12-23T10:30:01Z"
    }
  ]
}
```

---

### Delete Session

**Endpoint**: `DELETE /api/v1/sessions/{session_id}`

**Response**: `204 No Content`

---

## Safety & Security

### Data Privacy

- 🔒 All communications are encrypted (HTTPS/TLS 1.3)
- 🔒 Your data is never shared with third parties
- 🔒 Sessions are isolated and secure
- 🔒 You can delete your data anytime

### Guardrails

Our AI has built-in safety features:

- ✅ Confirms before executing financial transactions
- ✅ Validates all requests against your account permissions
- ✅ Detects and prevents suspicious activities
- ✅ Never asks for passwords or sensitive credentials

### Rate Limits

- **Default**: 100 requests per minute
- **Burst**: Up to 200 requests per minute (short duration)

If you need higher limits, contact us at beta@swipesavvy.com

---

## Beta Testing Guidelines

### What We're Testing

1. **Accuracy**: Does the AI understand your questions correctly?
2. **Reliability**: Does it work consistently?
3. **Speed**: Are responses fast enough?
4. **Usefulness**: Does it help you manage finances better?

### How to Provide Feedback

**Quick Feedback Form**: https://forms.swipesavvy.com/beta-feedback

**Email**: beta@swipesavvy.com

**What to Include**:
- Your user ID
- Session ID (if applicable)
- Description of the issue or suggestion
- Screenshots (if relevant)
- Timestamp of the interaction

### Bug Reporting

If you encounter a bug, please report:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Session ID** (helps us investigate)

**Critical Issues**: Email beta@swipesavvy.com with subject "URGENT: [Brief Description]"

---

## Known Limitations (Beta)

- ⚠️ Transaction history limited to last 90 days
- ⚠️ Some bank-specific features may not be available
- ⚠️ International transfers not yet supported
- ⚠️ Voice interface coming in Q2 2026

We're actively working on these features!

---

## Tips for Best Results

### Do's ✅

- **Be specific**: "Transfer $50 to savings" vs "Move money"
- **Use natural language**: Talk like you would to a human
- **Provide context**: "My electricity bill" vs "The bill"
- **Confirm actions**: Always review before confirming transactions

### Don'ts ❌

- **Don't share credentials**: AI never asks for passwords
- **Don't rush confirmations**: Review transaction details
- **Don't use offensive language**: Keep it professional
- **Don't spam requests**: Be patient with responses

---

## Example Conversations

### Scenario 1: Monthly Budget Check

```
You: "How much have I spent this month?"
AI:  "You've spent $2,456.78 this month across all categories."

You: "Break that down by category"
AI:  "Here's your spending breakdown:
      - Dining: $325.50
      - Shopping: $678.90
      - Bills: $890.00
      - Transportation: $235.38
      - Entertainment: $127.00
      - Other: $200.00"

You: "Am I over budget?"
AI:  "Based on your typical spending, you're about 8% over your average monthly budget. Would you like tips to reduce spending?"
```

### Scenario 2: Quick Bill Payment

```
You: "What bills are due this week?"
AI:  "You have 2 bills due this week:
      1. Electricity: $85.50 (Due Dec 28)
      2. Internet: $65.00 (Due Dec 29)"

You: "Pay both"
AI:  "I'll pay both bills totaling $150.50. Confirm?"

You: "Yes"
AI:  "✓ Both bills paid successfully. $150.50 deducted from checking."
```

---

## Troubleshooting

### "Session not found" Error

**Solution**: Start a new conversation without a `session_id`

### "Rate limit exceeded" Error

**Solution**: Wait 60 seconds before making more requests

### "Authentication failed" Error

**Solution**: Verify your API key is correct and included in headers

### Slow Responses

**Expected**: First message in a session may take 2-3 seconds
**If slower**: Check your internet connection or report to beta@swipesavvy.com

---

## Support & Resources

### Documentation

- **Full API Docs**: https://docs.swipesavvy.com/api
- **Architecture Overview**: Included in beta materials
- **Status Page**: https://status.swipesavvy.com

### Contact

- **Email**: beta@swipesavvy.com
- **Slack**: Join #beta-testers channel (invite sent separately)
- **Office Hours**: Tuesdays 2-3 PM PST (Zoom link in email)

### Updates

We'll send weekly updates on:
- New features
- Bug fixes
- Performance improvements
- Beta program milestones

---

## Roadmap Preview

### Coming Soon (Q1 2026)

- ✨ Mobile app integration
- ✨ Web dashboard
- ✨ Enhanced analytics
- ✨ Spending insights

### Q2 2026

- 🚀 Voice interface
- 🚀 Multi-language support
- 🚀 Bank account linking (Plaid)
- 🚀 Investment tracking

---

## Thank You!

Your participation in this beta program is invaluable. Every piece of feedback helps us build a better product.

**Beta Program Duration**: January 2 - January 31, 2026

**Exclusive Benefit**: Beta testers get 6 months free when we launch! 🎁

---

**Questions?** Email beta@swipesavvy.com  
**Report Issues**: https://forms.swipesavvy.com/bug-report

**Happy Testing!** 🚀

---

*Last Updated: December 23, 2025*  
*Version: 1.0 (Beta)*
