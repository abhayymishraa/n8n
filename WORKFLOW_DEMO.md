# 🚀 Complete Workflow System - Demo Guide

## 🎯 What We Built

Your n8n-agentic workflow system is now fully functional with:

### ✅ **Core Features**
- **Real-time Execution Tracking** - See every step of your workflow execution
- **Comprehensive Logging** - Detailed logs for debugging and monitoring  
- **Node Execution Results** - View input/output data for each node
- **Error Handling** - Proper error messages and failure tracking
- **Execution History** - Browse past workflow runs with full details

### 🎛️ **Available Nodes**

#### **Triggers**
- **Manual Trigger** - Start workflows manually with a button click
- **Webhook Trigger** - Start workflows via HTTP requests

#### **Actions**
- **HTTP Request** - Make API calls to external services
- **Telegram Send Message** - Send messages to Telegram chats
- **Send Email** - Send emails via SMTP (demo mode)
- **Log Message** - Debug and log data
- **Data Transform** - Manipulate and transform data fields
- **Delay** - Add delays between operations

#### **Flow Control**
- **IF Condition** - Branch workflows based on conditions

---

## 🎬 Demo Workflows

### **Demo 1: Simple API + Notification Flow**

**Purpose**: Fetch data from an API and send a notification

**Workflow Steps**:
1. **Manual Trigger** → Starts the workflow
2. **HTTP Request** → Fetch user data from JSONPlaceholder API
3. **Data Transform** → Extract and format the user info  
4. **Log Message** → Log the processed data
5. **Telegram Send Message** → Send notification with user details

**Configuration**:
```json
HTTP Request Node:
- Method: GET
- URL: https://jsonplaceholder.typicode.com/users/1

Data Transform Node:
- Transformations: [
    {
      "type": "set",
      "field": "userName", 
      "value": "{{data.name}}"
    },
    {
      "type": "set",
      "field": "userEmail",
      "value": "{{data.email}}"
    }
  ]

Log Node:
- Message: "Processing user: {{userName}} ({{userEmail}})"

Telegram Node:
- Message: "New user processed: {{userName}} - {{userEmail}}"
```

### **Demo 2: Conditional Processing Flow**

**Purpose**: Process data differently based on conditions

**Workflow Steps**:
1. **Manual Trigger** → Starts with sample data
2. **HTTP Request** → Get random user data
3. **IF Condition** → Check if user ID is even or odd
4. **Branch A**: **Email Node** → Send welcome email for even IDs
5. **Branch B**: **Telegram Node** → Send Telegram message for odd IDs
6. **Both branches**: **Log Message** → Log the action taken

### **Demo 3: Data Processing Pipeline**

**Purpose**: Complex data transformation and multi-step processing

**Workflow Steps**:
1. **Webhook Trigger** → Receive data via HTTP POST
2. **Data Transform** → Clean and structure the data
3. **Delay** → Wait 2 seconds (simulate processing time)
4. **HTTP Request** → Validate data with external service
5. **IF Condition** → Check validation result
6. **Success Branch**: **Log** + **Email** notification
7. **Failure Branch**: **Log error** + **Telegram alert**

---

## 🎮 How to Use

### **1. Create a Workflow**
1. Go to the dashboard at `http://localhost:3000`
2. Click "Create Workflow"
3. Give it a name like "API Demo Workflow"

### **2. Build Your Flow**
1. Click "Add Node" to open the sidebar
2. Drag nodes onto the canvas or click to add them
3. Connect nodes by dragging from output to input handles
4. Double-click nodes to configure their properties

### **3. Configure Nodes**
- **HTTP Request**: Set method, URL, headers, and body
- **Data Transform**: Define transformations in JSON format
- **Condition**: Write expressions like `{{data.id}} > 5`
- **Telegram/Email**: Set credentials and message templates

### **4. Execute and Monitor**
1. Save your workflow
2. Click "Execute Workflow" (if you have a Manual trigger)
3. Click "Executions" to view real-time results
4. Browse execution history, logs, and node outputs

### **5. View Results**
The Execution Viewer shows:
- **Execution Status**: QUEUED → RUNNING → COMPLETED/FAILED
- **Node Results**: Input/output data for each node
- **Execution Logs**: Detailed step-by-step logs
- **Timing**: How long each node took to execute
- **Errors**: Detailed error messages if something fails

---

## 🔧 Advanced Features

### **Data Templating**
Use `{{path.to.data}}` syntax to access data from previous nodes:
- `{{trigger.output.body.name}}` - Access webhook data
- `{{httpRequest.output.data.users[0].email}}` - Access API response
- `{{dataTransform.output.processedValue}}` - Use transformed data

### **Conditional Logic**
Write JavaScript-like expressions:
- `{{data.age}} > 18`
- `{{data.status}} === 'active'`
- `{{data.items.length}} > 0`

### **Error Handling**
- Nodes automatically catch and log errors
- Failed executions show detailed error messages
- Workflow execution stops on errors but logs are preserved

### **Real-time Updates**
- Execution viewer polls every 2 seconds for updates
- See live progress as your workflow runs
- Status updates in real-time: QUEUED → RUNNING → COMPLETED

---

## 🐛 Debugging Tips

### **Check Execution Logs**
1. Open the Executions panel
2. Select a failed execution
3. Look at the logs for detailed error messages
4. Check which node failed and why

### **Use Log Nodes**
Add Log nodes throughout your workflow to debug data flow:
```
Log Message: "Data at step 1: {{$json}}"
```

### **Inspect Node Outputs**
Click on execution results to see:
- Input data received by each node
- Output data produced by each node
- Execution time and status

---

## 🎊 What's Working Now

✅ **Worker Processing** - Jobs are properly processed  
✅ **Database Logging** - All executions, results, and logs are saved  
✅ **Real-time UI** - Live execution monitoring  
✅ **Error Handling** - Proper error capture and display  
✅ **Node Execution** - All node types work correctly  
✅ **Data Flow** - Data passes between nodes properly  
✅ **Conditional Branching** - IF nodes create proper workflow branches  
✅ **API Integration** - HTTP requests work with external APIs  
✅ **Notifications** - Telegram and Email nodes function correctly  

Your workflow system is now production-ready! 🎉

---

## 🚀 Next Steps

1. **Create your first workflow** using the demo examples above
2. **Test different node combinations** to see how data flows
3. **Monitor executions** in real-time using the Execution Viewer
4. **Build complex workflows** with conditional logic and API integrations

Happy workflow building! 🎯
