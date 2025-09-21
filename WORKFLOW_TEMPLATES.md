# 🎯 Comprehensive Workflow Templates for n8n Agentic

Based on your repository analysis, here are **production-ready workflow templates** that leverage your enhanced template system and available nodes.

## 📊 **Repository Analysis Summary**

### **Available Node Types:**
- **Triggers**: Manual, Webhook, Schedule
- **Actions**: HTTP Request, Telegram, Email, Log, Data Transform, Delay
- **AI**: AI Agent, Workflow Agent
- **Flow Control**: IF (Conditional), Delay

### **Data Flow Structure:**
- **Trigger Data**: `{{trigger.output}}` or `{{$trigger}}`
- **Node Outputs**: `{{nodeId.output.field}}`
- **Current Input**: `{{$json}}`
- **All Data**: `{{$all}}`

---

## 🚀 **Template Categories**

### **1. 📧 Communication Workflows**

#### **A. User Onboarding Email Sequence**
```yaml
Workflow: "User Onboarding"
Description: "Send personalized welcome emails to new users"

Nodes:
  1. Manual Trigger
     - Input: { name: "John Doe", email: "john@example.com", plan: "premium" }
  
  2. Data Transform
     - Transformations:
       - Set: fullName = "{{trigger.output.name}}"
       - Set: welcomeMessage = "Welcome {{trigger.output.name}}! Your {{trigger.output.plan}} plan is ready."
  
  3. Email
     - To: "{{trigger.output.email}}"
     - Subject: "Welcome to our platform, {{trigger.output.name}}!"
     - Body: "{{dataTransform.output.welcomeMessage}}"
     - Credential: Resend Email
  
  4. Log
     - Message: "Welcome email sent to {{trigger.output.email}} for {{trigger.output.plan}} plan"
```

#### **B. Telegram Notification System**
```yaml
Workflow: "System Alerts"
Description: "Send system alerts to Telegram channel"

Nodes:
  1. Webhook Trigger
     - Method: POST
     - Input: { alert: "Server Down", severity: "high", server: "web-01" }
  
  2. Data Transform
     - Transformations:
       - Set: alertMessage = "🚨 {{trigger.output.alert}} on {{trigger.output.server}}"
       - Set: priority = "{{trigger.output.severity === 'high' ? '🔴 HIGH' : '🟡 MEDIUM'}}"
  
  3. Telegram Send Message
     - Chat ID: "-1001234567890"
     - Message: "{{dataTransform.output.priority}} {{dataTransform.output.alertMessage}}"
     - Credential: Telegram Bot
  
  4. Log
     - Message: "Alert sent: {{trigger.output.alert}} ({{trigger.output.severity}})"
```

### **2. 🔄 Data Processing Workflows**

#### **A. API Data Pipeline**
```yaml
Workflow: "User Data Sync"
Description: "Fetch user data, process it, and send notifications"

Nodes:
  1. Manual Trigger
     - Input: { userId: "12345" }
  
  2. HTTP Request
     - Method: GET
     - URL: "https://api.example.com/users/{{trigger.output.userId}}"
     - Headers: { "Authorization": "Bearer {{authToken}}" }
  
  3. Data Transform
     - Transformations:
       - Set: processedUser = "{{httpRequest.output.data}}"
       - Set: fullName = "{{httpRequest.output.data.firstName}} {{httpRequest.output.data.lastName}}"
       - Set: accountAge = "{{Math.floor((Date.now() - new Date(httpRequest.output.data.createdAt)) / (1000 * 60 * 60 * 24))}} days"
  
  4. IF (Conditional)
     - Condition: "{{dataTransform.output.accountAge}} > 30"
     - True: Send welcome email
     - False: Send onboarding email
  
  5. Email (True Branch)
     - To: "{{httpRequest.output.data.email}}"
     - Subject: "Welcome back, {{dataTransform.output.fullName}}!"
     - Body: "Thanks for being with us for {{dataTransform.output.accountAge}}!"
  
  6. Email (False Branch)
     - To: "{{httpRequest.output.data.email}}"
     - Subject: "Complete your setup, {{dataTransform.output.fullName}}"
     - Body: "You're new here! Let's get you started."
  
  7. Log
     - Message: "User {{dataTransform.output.fullName}} processed ({{dataTransform.output.accountAge}} days old)"
```

#### **B. Multi-Source Data Aggregation**
```yaml
Workflow: "Daily Report Generator"
Description: "Aggregate data from multiple APIs and generate reports"

Nodes:
  1. Manual Trigger
     - Input: { date: "2024-01-15" }
  
  2. HTTP Request (Users API)
     - URL: "https://api.users.com/stats?date={{trigger.output.date}}"
     - Credential: Users API Key
  
  3. HTTP Request (Orders API)
     - URL: "https://api.orders.com/stats?date={{trigger.output.date}}"
     - Credential: Orders API Key
  
  4. HTTP Request (Revenue API)
     - URL: "https://api.revenue.com/stats?date={{trigger.output.date}}"
     - Credential: Revenue API Key
  
  5. Data Transform
     - Transformations:
       - Set: reportDate = "{{trigger.output.date}}"
       - Set: totalUsers = "{{usersApi.output.data.count}}"
       - Set: totalOrders = "{{ordersApi.output.data.count}}"
       - Set: totalRevenue = "{{revenueApi.output.data.amount}}"
       - Set: avgOrderValue = "{{totalRevenue / totalOrders}}"
       - Set: reportSummary = "Daily Report for {{reportDate}}: {{totalUsers}} users, {{totalOrders}} orders, ${{totalRevenue}} revenue"
  
  6. Email
     - To: "admin@company.com"
     - Subject: "Daily Report - {{dataTransform.output.reportDate}}"
     - Body: "{{dataTransform.output.reportSummary}}"
  
  7. Log
     - Message: "Daily report generated: {{dataTransform.output.reportSummary}}"
```

### **3. 🤖 AI-Powered Workflows**

#### **A. Content Generation Pipeline**
```yaml
Workflow: "Blog Post Generator"
Description: "Generate blog posts using AI and publish them"

Nodes:
  1. Manual Trigger
     - Input: { topic: "AI in Automation", keywords: ["AI", "automation", "workflow"] }
  
  2. AI Agent
     - Provider: OpenAI
     - Model: gpt-4
     - Task: "Write a comprehensive blog post about {{trigger.output.topic}} including these keywords: {{trigger.output.keywords}}"
     - Temperature: 0.7
     - Max Tokens: 2000
  
  3. Data Transform
     - Transformations:
       - Set: title = "{{aiAgent.output.title}}"
       - Set: content = "{{aiAgent.output.content}}"
       - Set: excerpt = "{{aiAgent.output.excerpt}}"
       - Set: wordCount = "{{aiAgent.output.content.split(' ').length}}"
  
  4. HTTP Request (Publish to CMS)
     - Method: POST
     - URL: "https://cms.example.com/posts"
     - Headers: { "Authorization": "Bearer {{cmsToken}}" }
     - Body: "{\"title\": \"{{dataTransform.output.title}}\", \"content\": \"{{dataTransform.output.content}}\", \"excerpt\": \"{{dataTransform.output.excerpt}}\"}"
  
  5. Telegram Send Message
     - Chat ID: "-1001234567890"
     - Message: "📝 New blog post published: {{dataTransform.output.title}} ({{dataTransform.output.wordCount}} words)"
  
  6. Log
     - Message: "Blog post '{{dataTransform.output.title}}' published successfully"
```

#### **B. Customer Support AI Assistant**
```yaml
Workflow: "AI Customer Support"
Description: "Automatically respond to customer inquiries using AI"

Nodes:
  1. Webhook Trigger
     - Method: POST
     - Input: { message: "I can't login to my account", customerId: "12345", email: "customer@example.com" }
  
  2. AI Agent
     - Provider: OpenAI
     - Model: gpt-4
     - System Prompt: "You are a helpful customer support agent. Respond professionally and helpfully."
     - Task: "Respond to this customer inquiry: {{trigger.output.message}}"
     - Temperature: 0.3
  
  3. Data Transform
     - Transformations:
       - Set: response = "{{aiAgent.output.response}}"
       - Set: sentiment = "{{aiAgent.output.sentiment}}"
       - Set: priority = "{{aiAgent.output.priority}}"
  
  4. IF (Conditional)
     - Condition: "{{dataTransform.output.priority}} === 'high'"
     - True: Escalate to human
     - False: Send AI response
  
  5. Email (True Branch - Escalation)
     - To: "support@company.com"
     - Subject: "High Priority: Customer {{trigger.output.customerId}} needs help"
     - Body: "Customer: {{trigger.output.email}}\nIssue: {{trigger.output.message}}\nAI Response: {{dataTransform.output.response}}"
  
  6. Email (False Branch - AI Response)
     - To: "{{trigger.output.email}}"
     - Subject: "Re: Your inquiry"
     - Body: "{{dataTransform.output.response}}"
  
  7. Log
     - Message: "Customer {{trigger.output.customerId}} inquiry processed ({{dataTransform.output.priority}} priority)"
```

### **4. 🔄 Workflow Orchestration**

#### **A. Multi-Step Approval Process**
```yaml
Workflow: "Document Approval"
Description: "Multi-step approval process with notifications"

Nodes:
  1. Webhook Trigger
     - Input: { documentId: "DOC-123", submitter: "john@example.com", title: "Q4 Budget Proposal" }
  
  2. Data Transform
     - Transformations:
       - Set: approvalId = "{{documentId}}-{{Date.now()}}"
       - Set: submitterName = "{{submitter.split('@')[0]}}"
       - Set: approvalMessage = "Document '{{title}}' submitted by {{submitterName}} needs approval"
  
  3. Email (Notify Manager)
     - To: "manager@company.com"
     - Subject: "Document Approval Required: {{dataTransform.output.title}}"
     - Body: "{{dataTransform.output.approvalMessage}}\nDocument ID: {{dataTransform.output.approvalId}}"
  
  4. Delay
     - Duration: 24 hours
     - Reason: "Wait for manager approval"
  
  5. HTTP Request (Check Approval Status)
     - URL: "https://api.approval.com/status/{{dataTransform.output.approvalId}}"
     - Credential: Approval API
  
  6. IF (Conditional)
     - Condition: "{{approvalCheck.output.status}} === 'approved'"
     - True: Notify approval
     - False: Notify rejection
  
  7. Email (Approval Notification)
     - To: "{{trigger.output.submitter}}"
     - Subject: "✅ Document Approved: {{dataTransform.output.title}}"
     - Body: "Your document '{{dataTransform.output.title}}' has been approved!"
  
  8. Email (Rejection Notification)
     - To: "{{trigger.output.submitter}}"
     - Subject: "❌ Document Rejected: {{dataTransform.output.title}}"
     - Body: "Your document '{{dataTransform.output.title}}' was rejected. Please review and resubmit."
  
  9. Log
     - Message: "Document {{dataTransform.output.approvalId}} processed: {{approvalCheck.output.status}}"
```

### **5. 📊 Monitoring & Alerting**

#### **A. System Health Monitor**
```yaml
Workflow: "System Health Check"
Description: "Monitor system health and send alerts"

Nodes:
  1. Manual Trigger
     - Input: { checkInterval: 300 } # 5 minutes
  
  2. HTTP Request (Database Health)
     - URL: "https://api.monitoring.com/health/database"
     - Credential: Monitoring API
  
  3. HTTP Request (API Health)
     - URL: "https://api.monitoring.com/health/api"
     - Credential: Monitoring API
  
  4. HTTP Request (Queue Health)
     - URL: "https://api.monitoring.com/health/queue"
     - Credential: Monitoring API
  
  5. Data Transform
     - Transformations:
       - Set: dbStatus = "{{databaseHealth.output.status}}"
       - Set: apiStatus = "{{apiHealth.output.status}}"
       - Set: queueStatus = "{{queueHealth.output.status}}"
       - Set: overallHealth = "{{dbStatus === 'healthy' && apiStatus === 'healthy' && queueStatus === 'healthy' ? 'healthy' : 'unhealthy'}}"
       - Set: healthReport = "System Health Report:\n- Database: {{dbStatus}}\n- API: {{apiStatus}}\n- Queue: {{queueStatus}}\n- Overall: {{overallHealth}}"
  
  6. IF (Conditional)
     - Condition: "{{dataTransform.output.overallHealth}} === 'unhealthy'"
     - True: Send alert
     - False: Log healthy status
  
  7. Telegram Send Message (Alert)
     - Chat ID: "-1001234567890"
     - Message: "🚨 System Alert: {{dataTransform.output.healthReport}}"
  
  8. Log
     - Message: "Health check completed: {{dataTransform.output.overallHealth}}"
```

---

## 🛠️ **Template Implementation Guide**

### **Step 1: Choose Your Template**
1. Select a template that matches your use case
2. Copy the node configuration
3. Adapt the data fields to your needs

### **Step 2: Set Up Credentials**
1. Go to `/credentials` page
2. Add required credentials:
   - Telegram Bot (for notifications)
   - Resend Email (for emails)
   - API Keys (for external services)
   - OpenAI/Gemini (for AI features)

### **Step 3: Configure Nodes**
1. Use the enhanced template syntax `{{}}`
2. Reference data from previous nodes
3. Use special variables: `{{$json}}`, `{{$trigger}}`, `{{$all}}`

### **Step 4: Test with Log Nodes**
1. Add Log nodes after each major step
2. Use templates to debug data flow
3. Verify data structure and content

### **Step 5: Deploy and Monitor**
1. Save your workflow
2. Test with manual execution
3. Monitor execution logs
4. Set up alerts for failures

---

## 🎯 **Best Practices**

### **1. Naming Conventions**
- Use descriptive node IDs: `userData`, `emailService`, `aiProcessor`
- Use clear workflow names: `User Onboarding`, `Daily Reports`

### **2. Error Handling**
- Add Log nodes for debugging
- Use IF nodes for conditional logic
- Handle missing data gracefully

### **3. Performance**
- Use Delay nodes for rate limiting
- Batch similar operations
- Cache frequently used data

### **4. Security**
- Store sensitive data in credentials
- Use environment variables for configuration
- Validate input data

---

## 🚀 **Ready to Build!**

These templates provide a solid foundation for building complex, production-ready workflows. Each template leverages your enhanced template system and available nodes to create powerful automations.

**Start with a simple template and gradually add complexity as you become more familiar with the system!** 🎉
