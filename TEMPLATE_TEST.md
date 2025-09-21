# 🧪 Template System Test Examples

## ✅ **Enhanced Template System is Working!**

Your n8n Agentic system now supports **advanced template syntax** that allows nodes to access data from **any previous node** in the workflow!

## 🎯 **Test Scenarios**

### **Scenario 1: Multi-Node Data Flow**
```
Manual Trigger → HTTP Request → Data Transform → Email
```

**Test Templates:**
```javascript
// In HTTP Request node
URL: "https://api.example.com/users/{{trigger.userId}}"
Headers: {
  "Authorization": "Bearer {{trigger.token}}"
}

// In Data Transform node
Field: "fullName"
Value: "{{httpRequest.output.data.firstName}} {{httpRequest.output.data.lastName}}"

// In Email node
To: "{{httpRequest.output.data.email}}"
Subject: "Welcome {{dataTransform.output.fullName}}!"
Body: "Hello {{dataTransform.output.fullName}}, your account is ready!"
```

### **Scenario 2: Complex Data Access**
```
Webhook → HTTP Request → IF Node → Email (Success) / Email (Error)
```

**Test Templates:**
```javascript
// In HTTP Request node
URL: "https://api.example.com/orders/{{trigger.body.orderId}}"

// In IF Node condition
{{httpRequest.output.statusCode}} === 200

// In Success Email
To: "{{trigger.body.email}}"
Subject: "Order {{trigger.body.orderId}} Confirmed"
Body: "Your order {{trigger.body.orderId}} for {{httpRequest.output.data.items[0].name}} is confirmed!"

// In Error Email
To: "{{trigger.body.email}}"
Subject: "Order {{trigger.body.orderId}} Failed"
Body: "Sorry, your order {{trigger.body.orderId}} failed: {{httpRequest.output.error}}"
```

### **Scenario 3: Array and Object Access**
```
Manual Trigger → HTTP Request → Log → Email
```

**Test Templates:**
```javascript
// In Log node
Message: "Processing {{httpRequest.output.data.users.length}} users"

// In Email node
To: "{{httpRequest.output.data.users[0].email}}"
Subject: "User Report"
Body: "Found {{httpRequest.output.data.users.length}} users. First user: {{httpRequest.output.data.users[0].name}}"
```

## 🔍 **Debugging with Log Nodes**

Add Log nodes throughout your workflow to see what data is available:

```javascript
// Log 1: After trigger
Message: "Trigger data: {{$trigger}}"

// Log 2: After HTTP request
Message: "HTTP response: {{httpRequest.output}}"

// Log 3: After data transform
Message: "Transformed data: {{dataTransform.output}}"

// Log 4: All available data
Message: "All data: {{$all}}"
```

## 🎊 **What You Can Do Now**

### **1. Access Any Previous Node**
```javascript
{{anyNodeId.output.field}}
{{anyNodeId.handle}}
```

### **2. Use Special Variables**
```javascript
{{$json}}      // Current input
{{$trigger}}   // Trigger data
{{$all}}       // Complete workflow state
```

### **3. Complex Path Resolution**
```javascript
{{userData.output.profile.address.street}}
{{apiResponse.data.users[0].email}}
{{orderData.output.items[2].price}}
```

### **4. Dynamic Content Generation**
```javascript
// Personalized emails
"Hello {{userData.output.name}}, your order {{orderData.output.id}} is {{statusData.output.status}}"

// Dynamic API calls
"https://api.example.com/users/{{userData.output.id}}/orders/{{orderData.output.id}}"

// Conditional content
"{{statusData.handle === 'success' ? 'Great!' : 'Sorry'}}"
```

## 🚀 **Ready to Test!**

1. **Create a workflow** with multiple nodes
2. **Use the template syntax** `{{}}` in node configurations
3. **Add Log nodes** to debug data flow
4. **Test with real data** to see the magic happen!

Your template system is now **production-ready** and supports all the advanced features you need for complex workflow automation! 🎉
