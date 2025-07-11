# Newsly Frontend

A modern, responsive news website frontend built with React, TypeScript, and Tailwind CSS.

## Features

- 🏠 **Responsive Layout**: Sidebar navigation with 7 news sections
- 📰 **Dynamic News Cards**: Headlines, bullet points, images, and interactive buttons
- 🙍 **User Authentication**: Login/registration with persistent sessions
- 💬 **Newsly Chat**: Modal-based chatbot for news discussions
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Mobile Responsive**: Optimized for all screen sizes
- 🎨 **Custom Logo**: Beautiful Newsly branding throughout

## API Integration

The frontend is designed to work with a FastAPI backend. Set up your environment variables:

```bash
cp .env.example .env
```

Edit `.env` and set your API base URL:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Required Backend Endpoints

Your FastAPI backend should implement these endpoints:

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration

### News
- `GET /api/news?section={section}` - Fetch news by section
- `GET /api/news?section={section}&user_id={user_id}` - Personalized news
- `GET /api/news/search?q={query}&section={section}` - Search news

### Chat
- `POST /api/chat` - Send message to Newsly Chat
- `GET /api/chat/history` - Get chat history (optional)

### Feedback
- `POST /api/feedback` - Submit like/dislike feedback

## Data Models

### Login/Register Request
```json
{
  "fullName": "John Doe",
  "age": 25,
  "email": "john@example.com"
}
```

### Login/Register Response
```json
{
  "user_id": "user_12345"
}
```

### News Item Response
```json
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
```

### Chat Request
```json
{
  "user_id": "user_12345",
  "message": "What do you think about this news?",
  "news_id": "news_1",
  "conversation_id": "conv_abc123"
}
```

### Feedback Request
```json
{
  "user_id": "user_12345",
  "news_id": "news_1",
  "feedback": "like"
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

- `VITE_API_BASE_URL`: Base URL for your FastAPI backend (default: http://localhost:8000)
- `VITE_DEV_MODE`: Enable development mode features

## Features

### Newsly Chat
- **AI-powered conversations** about news articles
- **Context-aware responses** based on specific articles
- **Persistent conversations** with conversation IDs
- **Real-time messaging** with loading indicators
- **Error handling** with fallback messages

### User Experience
- **Infinite scroll pagination** for seamless news browsing
- **Responsive design** for all devices
- **Dark mode support** with system preference detection
- **User authentication** with persistent sessions
- **Feedback system** for personalized recommendations

## Error Handling

The frontend includes comprehensive error handling:
- Network failures fall back to cached/mock data
- User-friendly error messages
- Retry mechanisms for failed requests
- Loading states for better UX

## Responsive Design

- **Desktop**: Full sidebar navigation with logo
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu with overlay sidebar
- **News Grid**: Responsive columns (1-3 based on screen size)