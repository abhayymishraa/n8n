# 🎨 Visual Workflow Builder Guide

## 🎯 **How to Create Great Workflows in Your n8n Agentic System**

Based on your repository analysis, here's a **step-by-step guide** to building powerful workflows using your enhanced template system.

---

## 📋 **Workflow Creation Process**

### **Step 1: Plan Your Workflow**
```
1. Define the goal
2. Identify data sources
3. Map the data flow
4. Choose appropriate nodes
5. Plan error handling
```

### **Step 2: Start with Triggers**
Choose the right trigger for your use case:

#### **Manual Trigger** - For testing and one-off tasks
```yaml
Use Case: Testing, manual processes
Data Access: {{trigger.output.field}}
Example: { name: "John", email: "john@example.com" }
```

#### **Webhook Trigger** - For external integrations
```yaml
Use Case: API integrations, external systems
Data Access: {{trigger.output.body.field}}
Example: { userId: "123", action: "created" }
```

#### **Schedule Trigger** - For automated tasks
```yaml
Use Case: Daily reports, periodic checks
Data Access: {{trigger.output.scheduledTime}}
Example: { frequency: "daily", time: "09:00" }
```

### **Step 3: Build Data Flow**
Use the enhanced template system to pass data between nodes:

#### **Basic Data Access**
```javascript
{{$json}}                    // Current node input
{{$trigger}}                 // Original trigger data
{{$all}}                     // Complete workflow data
```

#### **Cross-Node Data Access**
```javascript
{{nodeId.output.field}}      // Previous node output
{{httpRequest.output.data}}  // HTTP response data
{{dataTransform.output}}     // Transformed data
```

#### **Complex Data Access**
```javascript
{{userData.output.profile.name}}           // Nested objects
{{apiResponse.output.users[0].email}}      // Array access
{{orderData.output.items[2].price}}        // Deep nesting
```

---

## 🏗️ **Common Workflow Patterns**

### **Pattern 1: Linear Data Processing**
```
Trigger → HTTP Request → Data Transform → Email → Log
```

**Template Example:**
```yaml
1. Manual Trigger: { userId: "123" }
2. HTTP Request: GET /users/{{trigger.output.userId}}
3. Data Transform: 
   - fullName = "{{httpRequest.output.data.firstName}} {{httpRequest.output.data.lastName}}"
4. Email: 
   - To: "{{httpRequest.output.data.email}}"
   - Subject: "Welcome {{dataTransform.output.fullName}}!"
5. Log: "Email sent to {{dataTransform.output.fullName}}"
```

### **Pattern 2: Conditional Branching**
```
Trigger → Data Transform → IF → Email (Success) / Email (Error)
```

**Template Example:**
```yaml
1. Webhook Trigger: { orderId: "ORD-123", amount: 150 }
2. Data Transform:
   - orderStatus = "{{trigger.output.amount > 100 ? 'premium' : 'standard'}}"
3. IF Condition: "{{dataTransform.output.orderStatus}} === 'premium'"
4. Email (True): "Premium order {{trigger.output.orderId}} confirmed!"
5. Email (False): "Standard order {{trigger.output.orderId}} confirmed!"
```

### **Pattern 3: Parallel Processing**
```
Trigger → [HTTP Request 1, HTTP Request 2, HTTP Request 3] → Data Transform → Email
```

**Template Example:**
```yaml
1. Manual Trigger: { date: "2024-01-15" }
2. HTTP Request 1: GET /users?date={{trigger.output.date}}
3. HTTP Request 2: GET /orders?date={{trigger.output.date}}
4. HTTP Request 3: GET /revenue?date={{trigger.output.date}}
5. Data Transform:
   - totalUsers = "{{usersApi.output.data.count}}"
   - totalOrders = "{{ordersApi.output.data.count}}"
   - totalRevenue = "{{revenueApi.output.data.amount}}"
6. Email: "Daily Report: {{totalUsers}} users, {{totalOrders}} orders, ${{totalRevenue}}"
```

### **Pattern 4: AI-Powered Processing**
```
Trigger → AI Agent → Data Transform → HTTP Request → Email
```

**Template Example:**
```yaml
1. Webhook Trigger: { message: "I need help with my account" }
2. AI Agent:
   - Task: "Respond to: {{trigger.output.message}}"
   - Provider: OpenAI
3. Data Transform:
   - response = "{{aiAgent.output.response}}"
   - sentiment = "{{aiAgent.output.sentiment}}"
4. Email:
   - To: "{{trigger.output.email}}"
   - Body: "{{dataTransform.output.response}}"
```

---

## 🎨 **Visual Workflow Designer Tips**

### **1. Node Layout**
```
Start from left to right:
[Trigger] → [Data Processing] → [Actions] → [Notifications]
```

### **2. Use Descriptive Names**
```yaml
❌ Bad: node1, node2, node3
✅ Good: userData, emailService, aiProcessor
```

### **3. Group Related Nodes**
```
[Data Collection]
├── HTTP Request (Users)
├── HTTP Request (Orders)
└── HTTP Request (Revenue)

[Processing]
├── Data Transform
└── AI Agent

[Output]
├── Email
└── Telegram
```

### **4. Add Debug Nodes**
```
[Main Flow]
├── Log (After Trigger)
├── Log (After HTTP)
├── Log (After Transform)
└── Log (Final Result)
```

---

## 🔧 **Template System Best Practices**

### **1. Use Special Variables**
```javascript
{{$json}}        // Current input (most common)
{{$trigger}}     // Original trigger data
{{$all}}         // Complete workflow state
```

### **2. Handle Missing Data**
```javascript
// Safe access with fallback
{{userData.output.name || 'Unknown User'}}
{{apiResponse.output.data?.users?.[0]?.email || 'No email'}}
```

### **3. Format Data Properly**
```javascript
// Numbers
{{Math.round(price * 1.1)}}  // Add 10% tax

// Dates
{{new Date().toISOString()}}  // Current timestamp

// Strings
{{userName.toUpperCase()}}    // Uppercase
{{message.substring(0, 100)}} // Truncate
```

### **4. Debug with Log Nodes**
```javascript
// Log current input
Message: "Current input: {{$json}}"

// Log specific data
Message: "User data: {{userData.output}}"

// Log all available data
Message: "All data: {{$all}}"
```

---

## 🚀 **Workflow Templates by Use Case**

### **📧 Communication Workflows**

#### **Welcome Email Sequence**
```yaml
Trigger: Manual { name: "John", email: "john@example.com" }
Flow: Trigger → Data Transform → Email → Log
Templates:
  - Email To: "{{trigger.output.email}}"
  - Email Subject: "Welcome {{trigger.output.name}}!"
  - Email Body: "Hello {{trigger.output.name}}, welcome to our platform!"
```

#### **Notification System**
```yaml
Trigger: Webhook { alert: "Server Down", severity: "high" }
Flow: Trigger → Data Transform → Telegram → Log
Templates:
  - Telegram Message: "🚨 {{trigger.output.alert}} ({{trigger.output.severity}})"
  - Log Message: "Alert sent: {{trigger.output.alert}}"
```

### **🔄 Data Processing Workflows**

#### **API Data Pipeline**
```yaml
Trigger: Manual { userId: "123" }
Flow: Trigger → HTTP Request → Data Transform → Email → Log
Templates:
  - HTTP URL: "https://api.example.com/users/{{trigger.output.userId}}"
  - Transform: fullName = "{{httpRequest.output.data.firstName}} {{httpRequest.output.data.lastName}}"
  - Email To: "{{httpRequest.output.data.email}}"
  - Email Subject: "Welcome {{dataTransform.output.fullName}}!"
```

#### **Multi-Source Aggregation**
```yaml
Trigger: Manual { date: "2024-01-15" }
Flow: Trigger → [HTTP1, HTTP2, HTTP3] → Data Transform → Email
Templates:
  - HTTP1 URL: "https://api.users.com/stats?date={{trigger.output.date}}"
  - HTTP2 URL: "https://api.orders.com/stats?date={{trigger.output.date}}"
  - HTTP3 URL: "https://api.revenue.com/stats?date={{trigger.output.date}}"
  - Transform: report = "Daily Report: {{usersApi.output.count}} users, {{ordersApi.output.count}} orders"
  - Email Body: "{{dataTransform.output.report}}"
```

### **🤖 AI-Powered Workflows**

#### **Content Generation**
```yaml
Trigger: Manual { topic: "AI in Automation" }
Flow: Trigger → AI Agent → Data Transform → HTTP Request → Log
Templates:
  - AI Task: "Write about {{trigger.output.topic}}"
  - Transform: title = "{{aiAgent.output.title}}"
  - HTTP Body: "{\"title\": \"{{dataTransform.output.title}}\"}"
```

#### **Customer Support**
```yaml
Trigger: Webhook { message: "I can't login", email: "user@example.com" }
Flow: Trigger → AI Agent → Data Transform → Email → Log
Templates:
  - AI Task: "Respond to: {{trigger.output.message}}"
  - Email To: "{{trigger.output.email}}"
  - Email Body: "{{aiAgent.output.response}}"
```

---

## 🎯 **Quick Start Checklist**

### **Before Building:**
- [ ] Define your workflow goal
- [ ] Identify required credentials
- [ ] Plan the data flow
- [ ] Choose appropriate nodes

### **While Building:**
- [ ] Use descriptive node names
- [ ] Add Log nodes for debugging
- [ ] Test with sample data
- [ ] Use template syntax `{{}}`

### **After Building:**
- [ ] Test with manual execution
- [ ] Check execution logs
- [ ] Verify data flow
- [ ] Set up monitoring

---

## 🎊 **You're Ready to Build!**

With this guide and your enhanced template system, you can create powerful, production-ready workflows that:

- **Access data from any previous node**
- **Handle complex data transformations**
- **Integrate with external APIs**
- **Use AI for intelligent processing**
- **Send personalized notifications**
- **Debug easily with comprehensive logging**

**Start with a simple template and gradually add complexity as you become more familiar with the system!** 🚀
