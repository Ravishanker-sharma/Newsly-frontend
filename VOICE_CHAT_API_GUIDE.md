# Voice Chat & Enhanced Features API Guide

## 🎤 **Voice Recording Integration**

The frontend now includes voice recording functionality that sends audio to your FastAPI backend for processing.

---

## 📋 **New API Endpoints**

### **1. POST /api/chat/voice**

**Purpose**: Process voice messages and return AI responses

**Frontend Request**:
```http
POST http://localhost:8000/api/chat/voice
Content-Type: multipart/form-data

FormData:
- audio: [Blob] (voice_message.wav)
- user_id: "user_12345"
- news_id: "news_001" (optional)
- conversation_id: "conv_abc123" (optional)
```

**Expected Response**:
```json
{
  "message": "I heard you asking about climate change. Here's what I can tell you about the latest developments...",
  "conversation_id": "conv_abc123",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**FastAPI Implementation**:
```python
from fastapi import File, UploadFile, Form
import speech_recognition as sr
import io

@app.post("/api/chat/voice")
async def process_voice_message(
    audio: UploadFile = File(...),
    user_id: str = Form(...),
    news_id: Optional[str] = Form(None),
    conversation_id: Optional[str] = Form(None)
):
    try:
        # Read audio file
        audio_data = await audio.read()
        
        # Convert audio to text using speech recognition
        recognizer = sr.Recognizer()
        
        # Convert bytes to audio data
        audio_file = sr.AudioFile(io.BytesIO(audio_data))
        with audio_file as source:
            audio_data = recognizer.record(source)
        
        # Recognize speech
        text = recognizer.recognize_google(audio_data)
        
        # Process the text message using your existing chat logic
        response = await process_chat_message(
            user_id=user_id,
            message=text,
            news_id=news_id,
            conversation_id=conversation_id
        )
        
        return ChatResponse(
            message=response,
            conversation_id=conversation_id or f"conv_{uuid.uuid4()}",
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Voice processing failed: {str(e)}")
```

---

### **2. GET /api/chat/faqs**

**Purpose**: Retrieve FAQ questions for chat initialization

**Frontend Request**:
```http
GET http://localhost:8000/api/chat/faqs
```

**Expected Response**:
```json
[
  {
    "id": "faq_1",
    "question": "What are the latest breaking news?",
    "category": "General"
  },
  {
    "id": "faq_2", 
    "question": "Tell me about world politics",
    "category": "Politics"
  },
  {
    "id": "faq_3",
    "question": "What's happening in sports today?"
  }
]
```

**Note**: The `category` field is **optional**. FAQs can be returned with or without categories.

**FastAPI Implementation**:
```python
class FAQ(BaseModel):
    id: str
    question: str
    category: Optional[str] = None  # Made optional

@app.get("/api/chat/faqs", response_model=List[FAQ])
async def get_chat_faqs():
    # Return predefined FAQs or fetch from database
    # Category is optional - you can include it or not
    faqs = [
        FAQ(id="1", question="What are the latest breaking news?", category="General"),
        FAQ(id="2", question="Tell me about world politics", category="Politics"),
        FAQ(id="3", question="What's happening in sports today?", category="Sports"),
        FAQ(id="4", question="Any updates on technology news?"),  # No category
        FAQ(id="5", question="What are the trending topics?"),     # No category
        FAQ(id="6", question="Tell me about climate change news", category="Environment"),
    ]
    return faqs
```

**Alternative Implementation (No Categories)**:
```python
@app.get("/api/chat/faqs")
async def get_chat_faqs():
    # Simple FAQ structure without categories
    faqs = [
        {"id": "1", "question": "What are the latest breaking news?"},
        {"id": "2", "question": "Tell me about world politics"},
        {"id": "3", "question": "What's happening in sports today?"},
        {"id": "4", "question": "Any updates on technology news?"},
        {"id": "5", "question": "What are the trending topics?"},
        {"id": "6", "question": "Tell me about climate change news"},
    ]
    return faqs
```

---

### **3. Enhanced POST /api/chat** (Updated)

**Purpose**: Process text messages with keyword context

**Frontend Request**:
```http
POST http://localhost:8000/api/chat
Content-Type: application/json

{
  "user_id": "user_12345",
  "message": "What do you think about this?",
  "news_id": "news_001",
  "conversation_id": "conv_abc123",
  "context_keywords": ["climate", "summit", "agreement", "carbon", "reduction"]
}
```

**FastAPI Implementation**:
```python
class ChatRequest(BaseModel):
    user_id: str
    message: str
    news_id: Optional[str] = None
    conversation_id: Optional[str] = None
    context_keywords: Optional[List[str]] = None

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Use context keywords to provide better responses
    context = ""
    if request.context_keywords:
        context = f"Context keywords: {', '.join(request.context_keywords)}\n"
    
    # Enhanced processing with keyword context
    response = await process_chat_message_with_context(
        user_id=request.user_id,
        message=request.message,
        news_id=request.news_id,
        conversation_id=request.conversation_id,
        keywords=request.context_keywords
    )
    
    return ChatResponse(
        message=response,
        conversation_id=request.conversation_id or f"conv_{uuid.uuid4()}",
        timestamp=datetime.utcnow().isoformat()
    )
```

---

## 🎯 **Frontend Features**

### **Voice Recording Features**:
- ✅ **Microphone button** with visual recording indicator
- ✅ **Real-time recording status** with pulsing animation
- ✅ **Audio permission handling** with error messages
- ✅ **Voice message upload** to backend
- ✅ **Recording controls** (start/stop)

### **Enhanced Chat Features**:
- ✅ **Keyword extraction** from news headlines (4-5 words)
- ✅ **Context-aware responses** using extracted keywords
- ✅ **FAQ suggestions** on chat initialization
- ✅ **Clickable FAQ buttons** for quick questions
- ✅ **Optional category display** for FAQs
- ✅ **Professional color scheme** throughout

### **FAQ System Flexibility**:
```javascript
// Frontend handles FAQs with or without categories
const renderFAQ = (faq) => (
  <button onClick={() => handleFAQClick(faq)}>
    <p>{faq.question}</p>
    {faq.category && <p className="category">{faq.category}</p>}
  </button>
);
```

### **Keyword Extraction Logic**:
```javascript
// Frontend extracts 4-5 meaningful words from headlines
const extractKeywords = (headline) => {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  return headline
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 5);
};

// Example: "Global Climate Summit Reaches Historic Agreement"
// Keywords: ["global", "climate", "summit", "reaches", "historic"]
```

---

## 🔧 **Required Dependencies**

### **Python Dependencies**:
```bash
pip install speechrecognition
pip install pyaudio  # For microphone access
pip install pydub    # For audio processing
```

### **Alternative Speech Recognition Services**:
```python
# Google Speech Recognition (free, limited)
text = recognizer.recognize_google(audio_data)

# Azure Speech Services
text = recognizer.recognize_azure(audio_data, key="YOUR_KEY", location="YOUR_LOCATION")

# OpenAI Whisper (local processing)
import whisper
model = whisper.load_model("base")
result = model.transcribe(audio_file_path)
text = result["text"]
```

---

## 🚀 **Complete Backend Example**

```python
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
import speech_recognition as sr
import io
import uuid
from datetime import datetime
from typing import Optional, List

@app.post("/api/chat/voice")
async def process_voice_message(
    audio: UploadFile = File(...),
    user_id: str = Form(...),
    news_id: Optional[str] = Form(None),
    conversation_id: Optional[str] = Form(None)
):
    try:
        # Validate audio file
        if not audio.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="Invalid audio file")
        
        # Read and process audio
        audio_bytes = await audio.read()
        
        # Speech to text conversion
        recognizer = sr.Recognizer()
        audio_file = sr.AudioFile(io.BytesIO(audio_bytes))
        
        with audio_file as source:
            audio_data = recognizer.record(source)
        
        # Recognize speech
        try:
            text = recognizer.recognize_google(audio_data)
        except sr.UnknownValueError:
            raise HTTPException(status_code=400, detail="Could not understand audio")
        except sr.RequestError:
            raise HTTPException(status_code=500, detail="Speech recognition service error")
        
        # Process as regular chat message
        response = await process_chat_message(
            user_id=user_id,
            message=text,
            news_id=news_id,
            conversation_id=conversation_id
        )
        
        return {
            "message": response,
            "conversation_id": conversation_id or f"conv_{uuid.uuid4()}",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/faqs")
async def get_chat_faqs():
    # FAQs with optional categories
    return [
        {"id": "1", "question": "What are the latest breaking news?", "category": "General"},
        {"id": "2", "question": "Tell me about world politics", "category": "Politics"},
        {"id": "3", "question": "What's happening in sports today?", "category": "Sports"},
        {"id": "4", "question": "Any updates on technology news?"},  # No category
        {"id": "5", "question": "What are the trending topics?"},     # No category
        {"id": "6", "question": "Tell me about climate change news", "category": "Environment"},
    ]

async def process_chat_message_with_context(
    user_id: str,
    message: str,
    news_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
    keywords: Optional[List[str]] = None
) -> str:
    # Enhanced processing with keyword context
    context_prompt = ""
    if keywords:
        context_prompt = f"Context: This conversation is about {', '.join(keywords)}. "
    
    # Your AI processing logic here
    # Use context_prompt to provide more relevant responses
    
    return f"{context_prompt}Here's my response to: {message}"
```

---

## 🎯 **Key Improvements Made**

1. ✅ **Voice Recording**: Microphone button with real-time recording
2. ✅ **Keyword Context**: Extract 4-5 words from headlines for better chat context
3. ✅ **Flexible FAQ System**: Categories are now optional
4. ✅ **Fixed Theme Toggle**: Dark/light mode now works properly
5. ✅ **Professional Design**: Clean color scheme throughout
6. ✅ **Enhanced UX**: Better visual feedback and animations

The FAQ system is now more flexible - you can include categories when they're useful, or omit them for simpler implementations! 🎯