# 🎯 Real-World Workflow Example

## **"Customer Onboarding & Welcome Sequence"**

This example demonstrates how to use your enhanced template system to create a complete customer onboarding workflow.

---

## 📋 **Workflow Overview**

**Goal**: Automatically onboard new customers with personalized welcome emails and notifications

**Flow**: 
```
Manual Trigger → HTTP Request → Data Transform → AI Agent → Email → Telegram → Log
```

**Data Flow**:
```
{ customerId: "12345" } 
→ Fetch customer data from API
→ Process and enrich data
→ Generate personalized welcome message
→ Send email to customer
→ Notify team via Telegram
→ Log the process
```

---

## 🏗️ **Step-by-Step Implementation**

### **Step 1: Manual Trigger**
```yaml
Node Type: Manual Trigger
Input Data:
  customerId: "12345"
  source: "website"
  plan: "premium"
```

**Template Access**: `{{trigger.output.customerId}}`, `{{trigger.output.source}}`, `{{trigger.output.plan}}`

### **Step 2: HTTP Request - Fetch Customer Data**
```yaml
Node Type: HTTP Request
Method: GET
URL: "https://api.company.com/customers/{{trigger.output.customerId}}"
Headers:
  Authorization: "Bearer {{authToken}}"
  Content-Type: "application/json"
```

**Template Access**: `{{httpRequest.output.data}}`, `{{httpRequest.output.statusCode}}`

### **Step 3: Data Transform - Process Customer Data**
```yaml
Node Type: Data Transform
Transformations:
  - Set: fullName = "{{httpRequest.output.data.firstName}} {{httpRequest.output.data.lastName}}"
  - Set: email = "{{httpRequest.output.data.email}}"
  - Set: company = "{{httpRequest.output.data.company}}"
  - Set: plan = "{{trigger.output.plan}}"
  - Set: source = "{{trigger.output.source}}"
  - Set: welcomeSubject = "Welcome to {{company}}, {{httpRequest.output.data.firstName}}!"
  - Set: accountAge = "{{Math.floor((Date.now() - new Date(httpRequest.output.data.createdAt)) / (1000 * 60 * 60 * 24))}} days"
```

**Template Access**: `{{dataTransform.output.fullName}}`, `{{dataTransform.output.email}}`, etc.

### **Step 4: AI Agent - Generate Personalized Message**
```yaml
Node Type: AI Agent
Provider: OpenAI
Model: gpt-4
System Prompt: "You are a friendly customer success manager. Write warm, personalized welcome messages."
Task: "Write a personalized welcome message for {{dataTransform.output.fullName}} who works at {{dataTransform.output.company}} and signed up for our {{dataTransform.output.plan}} plan from {{dataTransform.output.source}}. They've been with us for {{dataTransform.output.accountAge}} days."
Temperature: 0.7
Max Tokens: 500
```

**Template Access**: `{{aiAgent.output.message}}`, `{{aiAgent.output.tone}}`

### **Step 5: Email - Send Welcome Email**
```yaml
Node Type: Email
Credential: Resend Email
To: "{{dataTransform.output.email}}"
Subject: "{{dataTransform.output.welcomeSubject}}"
Body: |
  Hi {{dataTransform.output.fullName}},

  {{aiAgent.output.message}}

  Welcome to our {{dataTransform.output.plan}} plan! We're excited to have you on board.

  Best regards,
  The Team
Is HTML: true
```

**Template Access**: Uses data from both `dataTransform` and `aiAgent` nodes

### **Step 6: Telegram - Notify Team**
```yaml
Node Type: Telegram Send Message
Credential: Telegram Bot
Chat ID: "-1001234567890"
Message: |
  🎉 New Customer Onboarded!

  👤 Name: {{dataTransform.output.fullName}}
  🏢 Company: {{dataTransform.output.company}}
  📧 Email: {{dataTransform.output.email}}
  💼 Plan: {{dataTransform.output.plan}}
  📱 Source: {{dataTransform.output.source}}
  ⏰ Account Age: {{dataTransform.output.accountAge}} days

  Welcome message sent successfully! 🚀
```

**Template Access**: Uses data from `dataTransform` node

### **Step 7: Log - Record Process**
```yaml
Node Type: Log
Message: |
  Customer Onboarding Complete:
  - Customer: {{dataTransform.output.fullName}} ({{dataTransform.output.email}})
  - Company: {{dataTransform.output.company}}
  - Plan: {{dataTransform.output.plan}}
  - Source: {{dataTransform.output.source}}
  - Account Age: {{dataTransform.output.accountAge}} days
  - AI Message Generated: {{aiAgent.output.message ? 'Yes' : 'No'}}
  - Email Sent: Yes
  - Team Notified: Yes
  - Timestamp: {{new Date().toISOString()}}
```

**Template Access**: Uses data from multiple previous nodes

---

## 🔍 **Template System in Action**

### **Cross-Node Data Access**
```javascript
// Access trigger data
{{trigger.output.customerId}}
{{trigger.output.plan}}

// Access HTTP response data
{{httpRequest.output.data.firstName}}
{{httpRequest.output.data.email}}

// Access transformed data
{{dataTransform.output.fullName}}
{{dataTransform.output.welcomeSubject}}

// Access AI-generated content
{{aiAgent.output.message}}

// Access multiple sources in one template
"Welcome {{dataTransform.output.fullName}} to our {{trigger.output.plan}} plan!"
```

### **Special Variables**
```javascript
{{$json}}        // Current node's input data
{{$trigger}}     // Original trigger data
{{$all}}         // Complete workflow data packet
```

### **Complex Data Access**
```javascript
// Nested object access
{{httpRequest.output.data.profile.company}}

// Array access
{{httpRequest.output.data.tags[0]}}

// Conditional logic
{{dataTransform.output.plan === 'premium' ? 'Premium' : 'Standard'}}

// Math operations
{{Math.floor((Date.now() - new Date(httpRequest.output.data.createdAt)) / (1000 * 60 * 60 * 24))}}
```

---

## 🧪 **Testing the Workflow**

### **Test Data**
```json
{
  "customerId": "12345",
  "source": "website",
  "plan": "premium"
}
```

### **Expected API Response**
```json
{
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "company": "Acme Corp",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "statusCode": 200
}
```

### **Expected Outputs**

#### **Data Transform Output**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@company.com",
  "company": "Acme Corp",
  "plan": "premium",
  "source": "website",
  "welcomeSubject": "Welcome to Acme Corp, John!",
  "accountAge": 15
}
```

#### **AI Agent Output**
```json
{
  "message": "Hi John! Welcome to Acme Corp! We're thrilled to have you join our premium plan. Your 15 days with us shows you're already seeing value, and we're excited to help you achieve even more success.",
  "tone": "friendly",
  "length": 156
}
```

#### **Email Content**
```
To: john.doe@company.com
Subject: Welcome to Acme Corp, John!

Hi John Doe,

Hi John! Welcome to Acme Corp! We're thrilled to have you join our premium plan. Your 15 days with us shows you're already seeing value, and we're excited to help you achieve even more success.

Welcome to our premium plan! We're excited to have you on board.

Best regards,
The Team
```

#### **Telegram Message**
```
🎉 New Customer Onboarded!

👤 Name: John Doe
🏢 Company: Acme Corp
📧 Email: john.doe@company.com
💼 Plan: premium
📱 Source: website
⏰ Account Age: 15 days

Welcome message sent successfully! 🚀
```

---

## 🎯 **Key Benefits of This Approach**

### **1. Dynamic Content Generation**
- AI generates personalized messages based on customer data
- Templates adapt to different customer profiles
- Content changes based on account age, plan, etc.

### **2. Cross-Node Data Access**
- Access customer data from API in email templates
- Use transformed data in AI prompts
- Combine data from multiple sources

### **3. Flexible Data Processing**
- Transform raw API data into usable formats
- Calculate derived values (account age, etc.)
- Handle missing or optional data gracefully

### **4. Comprehensive Logging**
- Track the entire process
- Debug issues easily
- Monitor workflow performance

### **5. Multi-Channel Notifications**
- Email to customer
- Telegram to team
- Logs for monitoring

---

## 🚀 **Next Steps**

1. **Create the workflow** in your editor
2. **Set up credentials** (Resend Email, Telegram Bot, OpenAI)
3. **Test with sample data**
4. **Monitor execution logs**
5. **Iterate and improve**

This example demonstrates the full power of your enhanced template system and shows how to build production-ready workflows that are both powerful and maintainable! 🎉
