# Quick Start Guide - SwipeSavvy AI Agents

**Get started in 5 minutes!** ⚡

---

## Step 1: Get Your Credentials

You should have received an email with:

- **User ID**: `user_xxx...`
- **API Key**: `sk_live_xxx...`

⚠️ **Keep your API key secret!** Don't share it or commit it to version control.

---

## Step 2: Test the Connection

### Using cURL

```bash
curl -X POST https://api.swipesavvy.com/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "message": "Hello",
    "user_id": "YOUR_USER_ID"
  }'
```

### Using Python

```python
import requests

API_URL = "https://api.swipesavvy.com/api/v1/chat"
API_KEY = "YOUR_API_KEY"
USER_ID = "YOUR_USER_ID"

def chat(message, session_id=None):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    data = {
        "message": message,
        "user_id": USER_ID
    }
    
    if session_id:
        data["session_id"] = session_id
    
    response = requests.post(API_URL, headers=headers, json=data)
    return response.json()

# Send first message
result = chat("What's my balance?")
print(result["response"])

# Continue conversation
session_id = result["session_id"]
result = chat("Show recent transactions", session_id)
print(result["response"])
```

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

const API_URL = 'https://api.swipesavvy.com/api/v1/chat';
const API_KEY = 'YOUR_API_KEY';
const USER_ID = 'YOUR_USER_ID';

async function chat(message, sessionId = null) {
  const response = await axios.post(
    API_URL,
    {
      message,
      user_id: USER_ID,
      ...(sessionId && { session_id: sessionId })
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    }
  );
  
  return response.data;
}

// Example usage
(async () => {
  // First message
  let result = await chat("What's my balance?");
  console.log(result.response);
  
  // Continue conversation
  result = await chat("Show recent transactions", result.session_id);
  console.log(result.response);
})();
```

---

## Step 3: Try Common Commands

### Check Balance
```json
{
  "message": "What's my balance?",
  "user_id": "YOUR_USER_ID"
}
```

### View Transactions
```json
{
  "message": "Show my last 10 transactions",
  "user_id": "YOUR_USER_ID"
}
```

### Transfer Money
```json
{
  "message": "Transfer $50 from checking to savings",
  "user_id": "YOUR_USER_ID"
}
```

---

## Step 4: Review Response

Every response includes:

```json
{
  "response": "AI's answer",
  "session_id": "sess_xxx",
  "message_id": "msg_xxx",
  "metadata": {
    "tool_used": "get_account_balance",
    "action_performed": "balance_check"
  }
}
```

**Key Fields**:
- `response`: The AI's answer
- `session_id`: Use this to continue the conversation
- `message_id`: Unique ID for this specific message
- `metadata`: Information about what action was performed

---

## Step 5: Provide Feedback

After testing, fill out our feedback form:

👉 **https://forms.swipesavvy.com/beta-feedback**

Or email: **beta@swipesavvy.com**

---

## Next Steps

- Read the [Full Beta User Guide](BETA-USER-GUIDE.md)
- Join our Slack: #beta-testers
- Attend office hours: Tuesdays 2-3 PM PST

---

## Need Help?

- **Email**: beta@swipesavvy.com
- **Docs**: https://docs.swipesavvy.com
- **Status**: https://status.swipesavvy.com

---

**Happy Testing!** 🎉
