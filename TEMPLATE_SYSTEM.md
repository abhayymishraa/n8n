# 🎯 Enhanced Template System for n8n Agentic

## ✅ **What We Have Now**

Your n8n Agentic system now has a **powerful template engine** that allows nodes to access data from **any previous node** in the workflow using the `{{}}` syntax!

## 🚀 **Key Features**

### **1. Cross-Node Data Access**
Access data from any previous node by its ID:
```javascript
{{nodeId.field.subfield}}
{{httpRequest.output.data.users[0].email}}
{{dataTransform.output.processedValue}}
```

### **2. Special Variables**
- `{{$json}}` - Current node's input data
- `{{$trigger}}` - Original trigger data
- `{{$all}}` - Complete workflow data packet

### **3. Advanced Path Resolution**
- **Dot Notation**: `{{user.profile.name}}`
- **Array Access**: `{{items[0].title}}`
- **Nested Objects**: `{{response.data.users[0].profile.email}}`

### **4. Node-Specific Access**
Access any previous node's output:
```javascript
{{nodeId.output.field}}     // Node's output data
{{nodeId.handle}}           // Node's output handle (for branching)
```

## 📋 **Template Syntax Examples**

### **Basic Data Access**
```javascript
// Access current input
{{$json}}
{{name}}
{{user.email}}

// Access trigger data
{{$trigger}}
{{trigger.body.name}}
{{trigger.query.id}}
```

### **Cross-Node Data Access**
```javascript
// Access HTTP request response
{{httpRequest.output.data.users[0].name}}
{{httpRequest.output.statusCode}}

// Access data transformation result
{{dataTransform.output.processedData}}
{{dataTransform.output.summary}}

// Access any previous node
{{anyNodeId.output.result}}
{{anyNodeId.handle}}
```

### **Array and Object Access**
```javascript
// Array access
{{items[0].title}}
{{users[2].profile.name}}

// Nested object access
{{response.data.results[0].user.profile.email}}
{{apiResponse.users[0].address.street}}
```

### **Complex Workflow Examples**
```javascript
// Email with data from multiple sources
To: {{userData.output.email}}
Subject: "Order {{orderData.output.id}} Status Update"
Body: "Hello {{userData.output.name}}, your order {{orderData.output.id}} 
       for {{orderData.output.items[0].name}} is {{orderStatus.output.status}}"

// HTTP request with dynamic data
URL: https://api.example.com/users/{{userData.output.id}}/orders
Headers: {
  "Authorization": "Bearer {{authToken.output.token}}",
  "X-User-ID": "{{userData.output.id}}"
}
Body: {
  "status": "{{orderStatus.output.newStatus}}",
  "notes": "Updated by {{trigger.user.name}}"
}
```

## 🛠️ **Supported Nodes**

All these nodes now support enhanced templating:

### **Log Node**
```javascript
Message: "Processing user {{userData.output.name}} with ID {{userData.output.id}}"
```

### **HTTP Request Node**
```javascript
URL: "https://api.example.com/users/{{userData.output.id}}"
Headers: {
  "Authorization": "Bearer {{authToken.output.token}}"
}
Body: "{\"name\": \"{{userData.output.name}}\"}"
```

### **Telegram Send Message Node**
```javascript
Message: "Hello {{userData.output.name}}! Your order {{orderData.output.id}} is ready."
```

### **Email Node**
```javascript
To: "{{userData.output.email}}"
Subject: "Order {{orderData.output.id}} Update"
Body: "Dear {{userData.output.name}}, your order is {{orderStatus.output.status}}"
```

### **Data Transform Node**
```javascript
// Set field with template
Field: "fullName"
Value: "{{userData.output.firstName}} {{userData.output.lastName}}"

// Set field with complex data
Field: "orderSummary"
Value: "Order {{orderData.output.id}} for {{orderData.output.items.length}} items"
```

## 🔍 **Debugging Templates**

### **Use Log Nodes for Debugging**
Add Log nodes throughout your workflow to see what data is available:

```javascript
// Log 1: After trigger
Message: "Trigger data: {{$trigger}}"

// Log 2: After HTTP request
Message: "HTTP response: {{httpRequest.output}}"

// Log 3: After data transform
Message: "Transformed data: {{dataTransform.output}}"

// Log 4: Final data packet
Message: "All data: {{$all}}"
```

### **Template Validation**
The system automatically validates templates and provides helpful error messages for:
- Unmatched braces `{{` or `}}`
- Empty template expressions `{{}}`
- Malformed expressions

## 🎯 **Best Practices**

### **1. Use Descriptive Node IDs**
Instead of generic names, use descriptive IDs:
- ✅ `userData`, `orderData`, `emailService`
- ❌ `node1`, `node2`, `transform`

### **2. Test with Log Nodes**
Always test your templates with Log nodes before using them in production nodes.

### **3. Handle Missing Data**
The template engine gracefully handles missing data by returning the original template string.

### **4. Use Special Variables**
- `{{$json}}` for current input
- `{{$trigger}}` for trigger data
- `{{$all}}` for complete workflow state

## 🚀 **Advanced Examples**

### **Multi-Step Workflow**
```
1. Manual Trigger → userData
2. HTTP Request → userProfile
3. Data Transform → processedData
4. Email → notification

Email Template:
To: {{userData.output.email}}
Subject: "Profile Update Complete"
Body: "Hello {{userProfile.output.name}}, your profile has been updated with {{processedData.output.changes}} changes."
```

### **Conditional Branching**
```
1. Manual Trigger → inputData
2. IF Node → checkCondition
3. HTTP Request (true branch) → successData
4. HTTP Request (false branch) → errorData
5. Email → notification

Email Template (in both branches):
To: {{inputData.output.email}}
Subject: "{{checkCondition.handle === 'true' ? 'Success' : 'Error'}} Notification"
Body: "{{checkCondition.handle === 'true' ? successData.output.message : errorData.output.message}}"
```

## 🎉 **What This Enables**

With this enhanced template system, you can now:

1. **Build Complex Workflows** - Access data from any previous step
2. **Create Dynamic Content** - Generate personalized messages, emails, and API calls
3. **Handle Complex Data Flows** - Process and transform data across multiple nodes
4. **Debug Easily** - Use Log nodes to inspect data at any point
5. **Build Reusable Patterns** - Create templates that work across different workflows

## 🔧 **Technical Details**

The template engine:
- **Resolves paths** using dot notation and array access
- **Handles missing data** gracefully by returning original template
- **Supports all data types** (strings, numbers, objects, arrays)
- **Validates syntax** and provides helpful error messages
- **Optimizes performance** with efficient path resolution

---

## 🎊 **You Now Have Full Template Power!**

Your n8n Agentic system can now access data from **any previous node** in the workflow, making it incredibly powerful for building complex, data-driven automations! 🚀
