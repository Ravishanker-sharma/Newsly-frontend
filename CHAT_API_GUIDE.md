# Chat API Integration Guide

## 🤖 **Chat System Overview**

The frontend now includes a fully functional chat system that connects to your FastAPI backend. Users can chat about specific news articles or general topics.

---

## 📋 **Required Chat Endpoints**

### **1. POST /api/chat**

**Purpose**: Send a message and get AI/bot response

**Frontend Request**:
```http
POST http://localhost:8000/api/chat
Content-Type: application/json

{
  "user_id": "user_12345",
  "message": "What do you think about this climate agreement?",
  "news_id": "news_001",           // Optional: for article-specific chat
  "conversation_id": "conv_abc123"  // Optional: for conversation continuity
}
```

**Expected Response**:
```json
{
  "message": "The climate agreement represents a significant step forward in global environmental policy. The commitment to 50% carbon reduction by 2030 is ambitious and will require substantial changes in energy infrastructure...",
  "conversation_id": "conv_abc123",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**FastAPI Implementation**:
```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatRequest(BaseModel):
    user_id: str
    message: str
    news_id: Optional[str] = None
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    timestamp: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Your chat logic here
    # - Generate or retrieve conversation_id
    # - Process the message (AI/LLM integration)
    # - Store conversation history
    # - Return bot response
    
    # Example implementation:
    conversation_id = request.conversation_id or f"conv_{uuid.uuid4()}"
    
    # Process message with your AI service
    bot_response = await process_chat_message(
        user_id=request.user_id,
        message=request.message,
        news_id=request.news_id,
        conversation_id=conversation_id
    )
    
    return ChatResponse(
        message=bot_response,
        conversation_id=conversation_id,
        timestamp=datetime.utcnow().isoformat()
    )
```

---

### **2. GET /api/chat/history** (Optional)

**Purpose**: Retrieve chat history for a user/conversation

**Frontend Request**:
```http
GET http://localhost:8000/api/chat/history?user_id=user_12345&conversation_id=conv_abc123
```

**Expected Response**:
```json
{
  "messages": [
    {
      "id": "msg_001",
      "message": "What do you think about this climate agreement?",
      "sender": "user",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": "msg_002", 
      "message": "The climate agreement represents a significant step forward...",
      "sender": "bot",
      "timestamp": "2024-01-15T10:30:15Z"
    }
  ],
  "conversation_id": "conv_abc123"
}
```

**FastAPI Implementation**:
```python
class ChatMessage(BaseModel):
    id: str
    message: str
    sender: str  # "user" or "bot"
    timestamp: str

class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessage]
    conversation_id: str

@app.get("/api/chat/history", response_model=ChatHistoryResponse)
async def get_chat_history(user_id: str, conversation_id: Optional[str] = None):
    # Retrieve chat history from database
    messages = await get_user_chat_history(user_id, conversation_id)
    
    return ChatHistoryResponse(
        messages=messages,
        conversation_id=conversation_id or "new_conversation"
    )
```

---

## 🔧 **Frontend Features**

### **Chat Modal Features**:
- ✅ **Real-time messaging** with loading indicators
- ✅ **Article-specific context** when opened from news cards
- ✅ **Conversation continuity** with conversation IDs
- ✅ **Auto-scroll** to latest messages
- ✅ **Error handling** with fallback messages
- ✅ **Loading states** with animated indicators
- ✅ **Responsive design** for all screen sizes

### **Message Flow**:
1. User clicks "Chat" button on news card
2. Modal opens with article context (`newsId`)
3. User types message and presses Enter/Send
4. Frontend sends POST request to `/api/chat`
5. Loading indicator shows while waiting
6. Bot response appears with timestamp
7. Conversation continues with context

---

## 🤖 **AI Integration Examples**

### **OpenAI Integration**:
```python
import openai
from typing import Optional

async def process_chat_message(
    user_id: str, 
    message: str, 
    news_id: Optional[str] = None,
    conversation_id: str = None
) -> str:
    # Get article context if news_id provided
    context = ""
    if news_id:
        article = await get_news_article(news_id)
        context = f"Article context: {article.headline}\n{article.summary}\n\n"
    
    # Get conversation history for context
    history = await get_conversation_history(conversation_id)
    
    # Create prompt with context
    prompt = f"{context}User: {message}\n\nPlease provide a helpful response about this news topic."
    
    # Call OpenAI API
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful news assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content
```

### **Custom AI Service**:
```python
async def process_chat_message(
    user_id: str, 
    message: str, 
    news_id: Optional[str] = None,
    conversation_id: str = None
) -> str:
    # Your custom AI logic here
    # - Analyze message sentiment
    # - Extract key topics
    # - Generate contextual response
    # - Consider user preferences
    
    if news_id:
        # Article-specific responses
        return await generate_article_response(message, news_id)
    else:
        # General news discussion
        return await generate_general_response(message, user_id)
```

---

## 💾 **Database Schema Examples**

### **Conversations Table**:
```sql
CREATE TABLE conversations (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    news_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Messages Table**:
```sql
CREATE TABLE chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    sender ENUM('user', 'bot') NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

---

## 🚀 **Quick Start**

1. **Implement the chat endpoint** in your FastAPI server
2. **Add AI/LLM integration** (OpenAI, Hugging Face, etc.)
3. **Set up database tables** for conversation storage
4. **Test the integration** using the frontend chat modal

The frontend chat system is fully ready and will automatically connect to your backend once you implement the `/api/chat` endpoint!

---

## 🔍 **Testing the Chat System**

### **Manual Testing**:
1. Start your FastAPI server with chat endpoints
2. Open the frontend and login
3. Click "Chat" on any news card
4. Send a test message
5. Check browser Network tab for API calls
6. Verify bot responses appear correctly

### **API Testing with curl**:
```bash
# Test chat endpoint
curl -X POST "http://localhost:8000/api/chat" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "test_user",
       "message": "Hello, can you tell me about this news?",
       "news_id": "news_001"
     }'
```

The chat system provides a rich, interactive experience for users to discuss news articles and get AI-powered insights! 🎯