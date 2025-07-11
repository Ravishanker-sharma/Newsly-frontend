# FastAPI Backend Endpoints & Data Formats

## 🎯 **Required Endpoints Overview**

Your FastAPI backend needs to implement **4 main endpoints**:

1. `POST /api/login` - User authentication
2. `POST /api/register` - User registration  
3. `GET /api/news` - Fetch news articles
4. `POST /api/feedback` - Submit user feedback
5. `GET /api/news/search` - Search news (optional)

---

## 📋 **Complete Endpoint Specifications**

### **1. POST /api/login**

**Purpose**: Authenticate existing users

**Frontend Request**:
```http
POST http://localhost:8000/api/login
Content-Type: application/json

{
  "fullName": "John Doe",
  "age": 25,
  "email": "john@example.com"
}
```

**Expected Response**:
```json
{
  "user_id": "user_12345"
}
```

**FastAPI Implementation**:
```python
from pydantic import BaseModel

class LoginRequest(BaseModel):
    fullName: str
    age: int
    email: str

class LoginResponse(BaseModel):
    user_id: str

@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Your authentication logic here
    # Validate user credentials, check database, etc.
    return {"user_id": f"user_{request.email.replace('@', '_')}"}
```

---

### **2. POST /api/register**

**Purpose**: Register new users

**Frontend Request**:
```http
POST http://localhost:8000/api/register
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "age": 28,
  "email": "jane@example.com"
}
```

**Expected Response**:
```json
{
  "user_id": "user_jane_example_com"
}
```

**FastAPI Implementation**:
```python
@app.post("/api/register", response_model=LoginResponse)
async def register(request: LoginRequest):
    # Your registration logic here
    # Create new user in database, validate email, etc.
    return {"user_id": f"user_{request.email.replace('@', '_')}"}
```

---

### **3. GET /api/news**

**Purpose**: Fetch news articles by section

**Frontend Request Examples**:
```http
# Basic request
GET http://localhost:8000/api/news?section=world

# Personalized request (with user_id)
GET http://localhost:8000/api/news?section=sports&user_id=user_12345

# For You section
GET http://localhost:8000/api/news?section=for-you&user_id=user_12345
```

**Expected Response**:
```json
[
  {
    "id": "news_001",
    "headline": "Global Climate Summit Reaches Historic Agreement",
    "bulletPoints": [
      "World leaders commit to 50% carbon reduction by 2030",
      "New international climate fund established with $100B pledge",
      "Breakthrough in renewable energy technology sharing announced"
    ],
    "imageUrl": "https://images.pexels.com/photos/60013/desert-drought-dehydrated-clay-soil-60013.jpeg",
    "sourceIconUrl": "https://www.reuters.com/business/environment/climate-summit-2024/",
    "typeIconUrl": "https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg",
    "section": "world",
    "source": "Reuters",
    "type": "Breaking News",
    "publishedAt": "2024-01-15T08:30:00Z",
    "createdAt": "2024-01-15T08:35:00Z"
  },
  {
    "id": "news_002",
    "headline": "Revolutionary AI Breakthrough in Medical Diagnosis",
    "bulletPoints": [
      "New AI system can detect 20+ diseases from single blood test",
      "99.7% accuracy rate in clinical trials across 10,000 patients",
      "Technology to be rolled out to hospitals globally by 2025"
    ],
    "imageUrl": "https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg",
    "sourceIconUrl": "https://techcrunch.com/2024/ai-medical-breakthrough/",
    "typeIconUrl": "https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg",
    "section": "world",
    "source": "TechCrunch",
    "type": "Innovation",
    "publishedAt": "2024-01-15T07:15:00Z",
    "createdAt": "2024-01-15T07:20:00Z"
  }
]
```

**FastAPI Implementation**:
```python
from typing import List, Optional

class NewsItem(BaseModel):
    id: str
    headline: str
    bulletPoints: List[str]
    imageUrl: str
    sourceIconUrl: str  # This is the actual URL to the source article
    typeIconUrl: str
    section: str
    source: str         # Source name (e.g., "Reuters", "BBC")
    type: str          # Article type (e.g., "Breaking News", "Analysis")
    publishedAt: Optional[str] = None  # ISO timestamp when article was published
    createdAt: Optional[str] = None    # ISO timestamp when added to your system

@app.get("/api/news", response_model=List[NewsItem])
async def get_news(section: str, user_id: Optional[str] = None):
    # Your news fetching logic here
    # Filter by section: 'for-you', 'world', 'sports', 'india', 'education', 'entertainment', 'trending'
    # If user_id provided, personalize the results
    
    # Example logic:
    if section == "for-you" and user_id:
        # Return personalized news based on user preferences
        pass
    else:
        # Return general news for the section
        pass
    
    return news_list
```

**Valid Section Values**:
- `for-you` - Personalized news
- `world` - World news
- `sports` - Sports news  
- `india` - India-specific news
- `education` - Education news
- `entertainment` - Entertainment news
- `trending` - Trending news

---

### **4. POST /api/feedback**

**Purpose**: Submit user feedback (like/dislike) for news articles

**Frontend Request**:
```http
POST http://localhost:8000/api/feedback
Content-Type: application/json

{
  "user_id": "user_12345",
  "news_id": "news_001",
  "feedback": "like"
}
```

**Expected Response**:
```json
{
  "status": "success"
}
```

**FastAPI Implementation**:
```python
class FeedbackRequest(BaseModel):
    user_id: str
    news_id: str
    feedback: str  # "like" or "dislike"

class FeedbackResponse(BaseModel):
    status: str

@app.post("/api/feedback", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest):
    # Your feedback handling logic here
    # Store feedback in database for personalization
    # Valid feedback values: "like", "dislike"
    
    return {"status": "success"}
```

---

### **5. GET /api/news/search** (Optional)

**Purpose**: Search news articles

**Frontend Request**:
```http
GET http://localhost:8000/api/news/search?q=climate&section=world
```

**Expected Response**: Same format as `/api/news`

**FastAPI Implementation**:
```python
@app.get("/api/news/search", response_model=List[NewsItem])
async def search_news(q: str, section: Optional[str] = None):
    # Your search logic here
    # q = search query
    # section = optional section filter
    return search_results
```

---

### **6. GET /api/news/detailed**

**Purpose**: Get detailed news article with full content

**Frontend Request**:
```http
GET http://localhost:8000/api/news/detailed?news_id=news_001&user_id=user_12345
```

**Expected Response**:
```json
{
  "id": "news_001",
  "headline": "Global Climate Summit Reaches Historic Agreement",
  "fullContent": "In a groundbreaking development that could reshape the global response to climate change, world leaders at the International Climate Summit have reached a historic agreement...",
  "summary": "World leaders reach historic climate agreement with 50% carbon reduction target by 2030, establishing $100B fund and technology sharing initiatives.",
  "bulletPoints": [
    "195 countries commit to 50% carbon reduction by 2030",
    "$100 billion international climate fund established",
    "Breakthrough renewable energy technology sharing announced"
  ],
  "imageUrl": "https://images.pexels.com/photos/60013/desert-drought-dehydrated-clay-soil-60013.jpeg",
  "sourceIconUrl": "https://www.reuters.com/business/environment/climate-summit-2024/",
  "source": "Reuters",
  "type": "Breaking News",
  "author": "Sarah Johnson",
  "publishedAt": "2024-01-15T08:30:00Z",
  "readTime": 4,
  "tags": ["Climate Change", "Environment", "Politics"],
  "relatedArticles": [
    {
      "id": "related_1",
      "headline": "Renewable Energy Stocks Surge Following Climate Agreement",
      "imageUrl": "https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg"
    }
  ]
}
```

**FastAPI Implementation**:
```python
class DetailedNewsItem(BaseModel):
    id: str
    headline: str
    fullContent: str
    summary: str
    bulletPoints: List[str]
    imageUrl: str
    sourceIconUrl: str
    source: str
    type: str
    author: Optional[str] = None
    publishedAt: str
    readTime: Optional[int] = None
    tags: Optional[List[str]] = None
    relatedArticles: Optional[List[dict]] = None

@app.get("/api/news/detailed", response_model=DetailedNewsItem)
async def get_detailed_news(news_id: str, user_id: Optional[str] = None):
    # Fetch detailed news from database
    detailed_news = await get_news_details(news_id)
    
    if not detailed_news:
        raise HTTPException(status_code=404, detail="News article not found")
    
    # Optionally track user reading behavior
    if user_id:
        await track_user_reading(user_id, news_id)
    
    return detailed_news
```

---

## 🔧 **Complete FastAPI Setup Example**

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="NewsHub API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    feedback: str

class FeedbackResponse(BaseModel):
    status: str

# Endpoints
@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Implement your authentication logic
    return {"user_id": f"user_{request.email.replace('@', '_')}"}

@app.post("/api/register", response_model=LoginResponse)
async def register(request: LoginRequest):
    # Implement your registration logic
    return {"user_id": f"user_{request.email.replace('@', '_')}"}

@app.get("/api/news", response_model=List[NewsItem])
async def get_news(section: str, user_id: Optional[str] = None):
    # Implement your news fetching logic
    # Return list of NewsItem objects
    pass

@app.post("/api/feedback", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest):
    # Implement your feedback handling logic
    return {"status": "success"}

@app.get("/api/news/search", response_model=List[NewsItem])
async def search_news(q: str, section: Optional[str] = None):
    # Implement your search logic
    return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 🚀 **Quick Start Commands**

1. **Start your FastAPI server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

2. **Test endpoints** with curl:
   ```bash
   # Test login
   curl -X POST "http://localhost:8000/api/login" \
        -H "Content-Type: application/json" \
        -d '{"fullName":"John Doe","age":25,"email":"john@example.com"}'
   
   # Test news fetch
   curl "http://localhost:8000/api/news?section=world"
   ```

3. **View API docs**: Visit `http://localhost:8000/docs`

---

## ⚠️ **Important Notes**

1. **sourceIconUrl**: This should be the actual URL to the source article, not an image
2. **CORS**: Must be configured for `http://localhost:5173`
3. **Error Handling**: Return appropriate HTTP status codes (400, 404, 500)
4. **Data Validation**: Use Pydantic models for request/response validation
5. **Fallback**: Frontend will use mock data if your API is unavailable

The frontend is ready to connect to your FastAPI backend immediately once you implement these endpoints!