# Infinite Scroll Pagination API Guide

## 🔄 **Pagination Overview**

The frontend now implements infinite scroll pagination that loads news in batches of 50 articles. When users scroll to the bottom, it automatically fetches more news from your backend.

---

## 📋 **Updated API Endpoints**

### **GET /api/news** (Updated with Pagination)

**Purpose**: Fetch paginated news articles

**Frontend Request Examples**:
```http
# First page (initial load)
GET http://localhost:8000/api/news?section=world&page=1&limit=50

# Second page (infinite scroll)
GET http://localhost:8000/api/news?section=world&page=2&limit=50

# Personalized news with pagination
GET http://localhost:8000/api/news?section=for-you&user_id=user_12345&page=1&limit=50
```

**Query Parameters**:
- `section` (required): News section ('for-you', 'world', 'sports', etc.)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `user_id` (optional): For personalized news

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
    "type": "Breaking News"
  }
  // ... up to 50 more articles
]
```

**No More News Response**:
```json
[]
```

**FastAPI Implementation**:
```python
from typing import List, Optional
from fastapi import Query

@app.get("/api/news", response_model=List[NewsItem])
async def get_news(
    section: str,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    user_id: Optional[str] = None
):
    # Calculate offset for pagination
    offset = (page - 1) * limit
    
    # Your news fetching logic here
    if section == "for-you" and user_id:
        # Return personalized news with pagination
        news_items = await get_personalized_news(
            user_id=user_id,
            offset=offset,
            limit=limit
        )
    else:
        # Return general news for the section with pagination
        news_items = await get_news_by_section(
            section=section,
            offset=offset,
            limit=limit
        )
    
    return news_items
```

---

### **GET /api/news/search** (Updated with Pagination)

**Purpose**: Search news with pagination

**Frontend Request**:
```http
GET http://localhost:8000/api/news/search?q=climate&section=world&page=1&limit=50
```

**FastAPI Implementation**:
```python
@app.get("/api/news/search", response_model=List[NewsItem])
async def search_news(
    q: str,
    section: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    offset = (page - 1) * limit
    
    # Your search logic with pagination
    search_results = await search_news_articles(
        query=q,
        section=section,
        offset=offset,
        limit=limit
    )
    
    return search_results
```

---

## 🔄 **Frontend Pagination Flow**

### **Initial Load**:
1. User selects a news section
2. Frontend requests page 1 with 50 articles
3. Articles are displayed in a grid
4. Infinite scroll observer is set up

### **Infinite Scroll**:
1. User scrolls near the bottom of the page
2. Intersection Observer triggers
3. Frontend requests next page (page + 1)
4. New articles are appended to existing list
5. Process continues until no more articles

### **End of News**:
1. Backend returns empty array `[]`
2. Frontend shows "You're all caught up!" message
3. Infinite scroll is disabled
4. User can refresh to check for new articles

---

## 💾 **Database Implementation Examples**

### **SQL with OFFSET/LIMIT**:
```sql
-- Get paginated news for a section
SELECT * FROM news_articles 
WHERE section = 'world' 
ORDER BY created_at DESC 
LIMIT 50 OFFSET 100;  -- Page 3 (offset = (3-1) * 50)

-- Count total articles for pagination info
SELECT COUNT(*) FROM news_articles WHERE section = 'world';
```

### **MongoDB with Skip/Limit**:
```javascript
// Get paginated news
const news = await NewsArticle.find({ section: 'world' })
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);

// Check if more articles exist
const totalCount = await NewsArticle.countDocuments({ section: 'world' });
const hasMore = (page * limit) < totalCount;
```

### **Python Implementation Example**:
```python
async def get_news_by_section(section: str, offset: int, limit: int) -> List[NewsItem]:
    # Database query with pagination
    query = """
        SELECT * FROM news_articles 
        WHERE section = %s 
        ORDER BY created_at DESC 
        LIMIT %s OFFSET %s
    """
    
    results = await database.fetch_all(query, [section, limit, offset])
    
    # Convert to NewsItem objects
    news_items = [NewsItem(**row) for row in results]
    
    return news_items

async def get_personalized_news(user_id: str, offset: int, limit: int) -> List[NewsItem]:
    # Get user preferences and fetch personalized news
    user_prefs = await get_user_preferences(user_id)
    
    # Complex query based on user preferences, reading history, etc.
    query = """
        SELECT n.* FROM news_articles n
        LEFT JOIN user_feedback f ON n.id = f.news_id AND f.user_id = %s
        WHERE n.section IN %s
        AND (f.feedback IS NULL OR f.feedback = 'like')
        ORDER BY 
            CASE WHEN f.feedback = 'like' THEN 1 ELSE 2 END,
            n.created_at DESC
        LIMIT %s OFFSET %s
    """
    
    preferred_sections = tuple(user_prefs.get('sections', ['world', 'sports']))
    results = await database.fetch_all(query, [user_id, preferred_sections, limit, offset])
    
    return [NewsItem(**row) for row in results]
```

---

## 🎯 **Frontend Features**

### **Infinite Scroll Features**:
- ✅ **Automatic loading** when user scrolls to bottom
- ✅ **Manual "Load More" button** as fallback
- ✅ **Loading indicators** for better UX
- ✅ **End state handling** with "You're all caught up!" message
- ✅ **Error handling** with retry options
- ✅ **Smooth animations** and transitions
- ✅ **Performance optimized** with intersection observer

### **User Experience**:
- **Initial Load**: Shows first 50 articles immediately
- **Smooth Scrolling**: New articles load seamlessly
- **Visual Feedback**: Loading spinners and progress indicators
- **End State**: Clear message when no more news available
- **Refresh Option**: Users can check for new articles anytime

---

## 🚀 **Performance Considerations**

### **Backend Optimization**:
```python
# Add database indexes for better performance
CREATE INDEX idx_news_section_created ON news_articles(section, created_at DESC);
CREATE INDEX idx_news_user_feedback ON user_feedback(user_id, news_id);

# Use database connection pooling
# Implement caching for frequently accessed data
# Consider using Redis for session storage
```

### **Frontend Optimization**:
- **Intersection Observer**: Efficient scroll detection
- **Debounced Requests**: Prevents spam loading
- **Memory Management**: Considers removing old articles if list gets too long
- **Image Lazy Loading**: Built into modern browsers

---

## 🔍 **Testing the Pagination**

### **Manual Testing**:
1. Start with a fresh section
2. Scroll to bottom to trigger infinite scroll
3. Verify new articles are appended
4. Continue until "You're all caught up!" appears
5. Test refresh functionality

### **API Testing**:
```bash
# Test first page
curl "http://localhost:8000/api/news?section=world&page=1&limit=50"

# Test subsequent pages
curl "http://localhost:8000/api/news?section=world&page=2&limit=50"

# Test empty response (no more news)
curl "http://localhost:8000/api/news?section=world&page=999&limit=50"
```

### **Load Testing**:
```python
# Test with large datasets
# Verify performance with 1000+ articles
# Check memory usage during infinite scroll
# Test concurrent user scenarios
```

The infinite scroll pagination provides a smooth, modern user experience while efficiently handling large amounts of news content! 🚀