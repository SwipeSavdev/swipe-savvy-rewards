# SwipeSavvy AI Agents - Beta Testing Guide

**Welcome, Beta Tester!** 🎉

Thank you for participating in the soft launch of SwipeSavvy AI Agents. Your feedback is crucial to making this product amazing.

## What is SwipeSavvy AI Agents?

An AI-powered conversational assistant that helps you with banking operations using natural language. Think of it as your personal banking concierge - just ask in plain English!

## Beta Testing Period

**Dates**: December 23-29, 2025 (1 week)  
**Your Role**: Test the AI assistant and provide detailed feedback  
**Time Commitment**: ~30-60 minutes total

## Getting Started

### 1. Access Information

- **URL**: https://api.swipesavvy.com
- **Your Account**: [Will be provided in welcome email]
- **Password**: [Will be provided in welcome email]

### 2. Orientation Session

**When**: Wednesday, December 25, 10:00 AM  
**Where**: Zoom link in your email  
**Duration**: 30 minutes

## What to Test

### Basic Queries (Try These First)

1. **Check Balance**
   - "What's my account balance?"
   - "How much money do I have?"
   - "Show me my balance"

2. **View Transactions**
   - "Show me recent transactions"
   - "What did I spend yesterday?"
   - "Show my last 10 transactions"

3. **Transfer Money**
   - "Transfer $50 to savings"
   - "Move $100 from checking to savings"
   - "Send $25 to my savings account"

4. **Pay Bills**
   - "Pay my electricity bill"
   - "Pay $75 to PG&E"
   - "I need to pay my water bill"

### Advanced Testing

5. **Multi-Turn Conversations**
   - Ask a question, then follow up
   - Example: "What's my balance?" → "What about my savings?"
   - Test if the AI remembers context

6. **Complex Scenarios**
   - "Show me all transactions over $100 this month"
   - "How much did I spend on groceries?"
   - "Compare my spending this month to last month"

7. **Error Recovery**
   - Try invalid requests
   - See how the AI handles mistakes
   - Test correction scenarios

8. **Edge Cases**
   - Very long messages
   - Ambiguous requests
   - Multiple requests in one message

### Safety Testing

9. **Inappropriate Content**
   - Try asking off-topic questions
   - Test the AI's boundaries
   - See how it handles sensitive topics

10. **Security Testing**
    - Try to trick the AI into revealing system info
    - Test for proper authentication
    - Verify it doesn't expose sensitive data

## How to Provide Feedback

### Daily Feedback Form

**Link**: [Feedback Form URL - will be provided]

Complete this after each testing session (5 minutes):

1. **Session Date & Time**
2. **What did you test?**
3. **What worked well?**
4. **What didn't work?**
5. **Bugs encountered** (if any)
6. **Overall experience** (1-5 stars)

### Bug Reporting

If you encounter a bug, please report:

- **What happened?** (screenshot if possible)
- **What did you expect?**
- **Steps to reproduce**
- **How severe?** (Critical / Major / Minor)

### Feature Requests

Have ideas? We want to hear them!

- What features are missing?
- What would make this more useful?
- Any "nice to have" improvements?

## Testing Checklist

Use this checklist to track your testing:

### Day 1-2: Basic Functionality
- [ ] Test account balance query
- [ ] Test transaction history
- [ ] Test money transfer
- [ ] Test bill payment
- [ ] Submit feedback form

### Day 3-4: Advanced Features
- [ ] Multi-turn conversations
- [ ] Complex queries
- [ ] Error handling
- [ ] Edge cases
- [ ] Submit feedback form

### Day 5-7: Real-World Usage
- [ ] Use for actual banking needs
- [ ] Test in different scenarios
- [ ] Try to break it (in a good way!)
- [ ] Final feedback survey

## Success Criteria

We're looking for:

✓ **Accuracy**: Does it understand your requests?  
✓ **Helpfulness**: Are responses useful?  
✓ **Speed**: Is it fast enough?  
✓ **Safety**: Does it handle sensitive data properly?  
✓ **Usability**: Is it easy to use?

## Support & Questions

### Got Questions?

- **Email**: ai-agents@swipesavvy.com
- **Slack**: #ai-agents-beta (internal)
- **Response Time**: Within 4 hours

### Urgent Issues?

If you encounter a critical bug:
- **Contact**: [On-call engineer phone]
- **Slack**: @ai-agents-team
- **Available**: 24/7 during beta

## Sample Test Scripts

### Script 1: New User Experience

```
1. "Hello"
2. "What can you help me with?"
3. "Show me my account balance"
4. "What about my savings?"
5. "Transfer $20 to savings"
6. "Show me what I spent yesterday"
```

### Script 2: Bill Payment Flow

```
1. "I need to pay a bill"
2. "Pay my electricity bill"
3. "How much do I owe PG&E?"
4. "Pay $125.50 to PG&E"
5. "Confirm payment"
```

### Script 3: Transaction Research

```
1. "Show me recent transactions"
2. "What about last week?"
3. "Show me only transactions over $50"
4. "Did I pay my rent?"
5. "When was my last grocery purchase?"
```

### Script 4: Error Recovery

```
1. "Transfer money" (intentionally vague)
2. [See how AI asks for clarification]
3. "To savings" (partial info)
4. [See how it handles]
5. "$50" (complete the request)
```

## Tips for Effective Testing

### Do's ✓

- **Be natural**: Talk like you normally would
- **Try variations**: Ask the same thing different ways
- **Be thorough**: Test edge cases
- **Document everything**: Take screenshots
- **Be honest**: We want real feedback

### Don'ts ✗

- **Don't rush**: Take your time
- **Don't assume**: If something's unclear, report it
- **Don't skip bugs**: Even small issues matter
- **Don't hold back**: Critical feedback is valuable

## Privacy & Data

### What We Track

- Your queries and the AI's responses
- Usage patterns and session duration
- Performance metrics (response time, etc.)
- Feedback form submissions

### What We Don't Track

- Your actual banking data (it's mock data)
- Personal information beyond test account
- Conversations are only used for improvement

### Data Retention

- Test data kept for 90 days
- All data deleted after beta completion
- No sharing with third parties

## Expected Behavior

### What's Normal

- Response time: 1-2 seconds
- Occasional clarification questions
- Polite, professional tone
- Clear explanations

### What's NOT Normal (Please Report)

- Errors or crashes
- Very slow responses (>5 seconds)
- Rude or inappropriate responses
- Incorrect information
- Security concerns

## FAQ

**Q: Can I test from mobile?**  
A: Yes! The API works on any device with a browser.

**Q: How often should I test?**  
A: Aim for at least 15 minutes daily, but more is better!

**Q: What if I find a critical bug?**  
A: Report immediately via Slack or email.

**Q: Can I share my access with others?**  
A: No, please keep your credentials private.

**Q: Will my feedback be anonymous?**  
A: No, we attribute feedback to track patterns, but it's internal only.

**Q: What happens after the beta?**  
A: We'll fix bugs and roll out to more users.

## Recognition

As a thank you for your participation:

- ✓ Early access to new features
- ✓ Beta tester badge (internal)
- ✓ Mentioned in release notes
- ✓ Influence product direction

## Final Notes

Your feedback directly impacts the product. Be honest, be thorough, and have fun breaking things (so we can fix them)!

**Questions?** Don't hesitate to reach out!

---

**Happy Testing!** 🚀

SwipeSavvy AI Agents Team  
December 2025
