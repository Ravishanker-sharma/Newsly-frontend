# Complete API Flow Guide

## 🚀 How Frontend Connects to FastAPI Backend

### Environment Setup
1. **Create `.env` file** (copy from `.env.example`):
   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_DEV_MODE=true
   ```

2. **Start your FastAPI server** on port 8000:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Complete Request Flow

#### 1. User Login Flow
```
User fills login form → Frontend sends POST request → FastAPI responds

Frontend Request:
POST http://localhost:8000/api/login
Content-Type: application/json
{
  "fullName": "John Doe",
  "age": 25,
  "email": "john@example.com"
}

Expected FastAPI Response:
{
  "user_id": "user_12345"
}
```

#### 2. News Fetching Flow
```
User clicks "World News" → Frontend sends GET request → FastAPI responds

Frontend Request:
GET http://localhost:8000/api/news?section=world
Content-Type: application/json

Expected FastAPI Response:
[
  {
    "id": "news_1",
    "headline": "Breaking News Title",
    "bulletPoints": [
      "Key point 1",
      "Key point 2", 
      "Key point 3"
    ],
    "imageUrl": "https://example.com/image.jpg",
    "sourceIconUrl": "https://source-website.com/article",
    "typeIconUrl": "https://example.com/type-icon.jpg",
    "section": "world",
    "source": "Reuters",
    "type": "Breaking News"
  }
]
```

#### 3. Feedback Submission Flow
```
User clicks Like/Dislike → Frontend sends POST request → FastAPI responds

Frontend Request:
POST http://localhost:8000/api/feedback
Content-Type: application/json
{
  "user_id": "user_12345",
  "news_id": "news_1",
  "feedback": "like"
}

Expected FastAPI Response:
{
  "status": "success"
}
```

### Required FastAPI Endpoints

Your FastAPI server must implement these endpoints:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Data Models
class LoginRequest(BaseModel):
    fullName: str
    age: int
    email: str

class LoginResponse(BaseModel):
    user_id: str

class NewsItem(BaseModel):
    id: str
    headline: str
    bulletPoints: List[str]
    imageUrl: str
    sourceIconUrl: str
    typeIconUrl: str
    section: str
    source: str
    type: str

class FeedbackRequest(BaseModel):
    user_id: str
    news_id: str
    feedback: str  # "like" or "dislike"

# Endpoints
@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Your login logic here
    return {"user_id": f"user_{request.email.replace('@', '_')}"}

@app.post("/api/register", response_model=LoginResponse)
async def register(request: LoginRequest):
    # Your registration logic here
    return {"user_id": f"user_{request.email.replace('@', '_')}"}

@app.get("/api/news", response_model=List[NewsItem])
async def get_news(section: str, user_id: str = None):
    # Your news fetching logic here
    # Return list of NewsItem objects
    pass

@app.post("/api/feedback")
async def submit_feedback(request: FeedbackRequest):
    # Your feedback handling logic here
    return {"status": "success"}

@app.get("/api/news/search", response_model=List[NewsItem])
async def search_news(q: str, section: str = None):
    # Your search logic here
    pass
```

### Network Request Details

#### CORS Configuration
Your FastAPI server needs CORS enabled:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Error Handling
The frontend handles these HTTP status codes:
- **200**: Success - data processed normally
- **400**: Bad Request - shows error message to user
- **401**: Unauthorized - redirects to login
- **404**: Not Found - shows "no data" message
- **500**: Server Error - falls back to mock data

### Testing the Connection

1. **Start FastAPI server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

2. **Start frontend**:
   ```bash
   npm run dev
   ```

3. **Check browser network tab** to see actual HTTP requests being made

4. **Check FastAPI logs** to see incoming requests

### Debugging Tips

1. **Check browser console** for network errors
2. **Check FastAPI logs** for incoming requests
3. **Use browser Network tab** to inspect requests/responses
4. **Verify CORS settings** if getting CORS errors
5. **Check environment variables** are loaded correctly

The frontend will automatically retry failed requests and fall back to mock data if your FastAPI server is not available.