# Influencer Tracker

A web application for managing influencer marketing campaigns, built with React, TypeScript, and FastAPI.

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.11 or higher)
- PostgreSQL

## Project Structure

```
InfluencerTracker/
├── app/                 # FastAPI backend
└── client/             # React frontend
```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd app
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Features

- User authentication (login/register)
- Project management
- Influencer tracking
- Activity monitoring
- Comment system
- Multi-language support (i18n)

## Development

- Frontend: React + TypeScript + Tailwind CSS
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- State Management: React Query + Zustand
- Routing: Wouter
- Form Handling: React Hook Form + Zod
- UI Components: Radix UI + Lucide Icons

## Available Scripts

In the client directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 