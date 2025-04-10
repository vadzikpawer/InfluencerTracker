# Influencer Tracker

A web application for managing influencer marketing campaigns, built with React, TypeScript, and FastAPI.

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.11 or higher)
- PostgreSQL

## Project Structure

```
InfluencerTracker/
├── backend/            # FastAPI backend
│   ├── api/           # API endpoints
│   ├── core/          # Core functionality
│   ├── db/            # Database configuration
│   ├── models/        # SQLAlchemy models
│   ├── schemas/       # Pydantic schemas
│   ├── tests/         # Backend tests
│   └── main.py        # Application entry point
├── client/            # React frontend
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── tests/        # Frontend tests
└── server/           # Production server configuration
```

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
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

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
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
- Role-based access control (Manager/Influencer)
- Project management
  - Create and manage projects
  - Set deadlines and requirements
  - Track project status
- Influencer management
  - Profile management
  - Social media integration
  - Follower tracking
- Content workflow
  - Scenario creation and approval
  - Material submission and review
  - Publication tracking
- Activity monitoring
  - Real-time updates
  - Activity history
- Comment system
  - Threaded discussions
  - @mentions
- Multi-language support (i18n)

## Development

- Frontend:
  - React + TypeScript
  - Tailwind CSS for styling
  - React Query for data fetching
  - Zustand for state management
  - Wouter for routing
  - React Hook Form + Zod for forms
  - Radix UI + Lucide Icons for components

- Backend:
  - FastAPI for API
  - SQLAlchemy for ORM
  - Pydantic for data validation
  - JWT for authentication
  - SQLite for development
  - PostgreSQL for production

## Testing

Run backend tests:
```bash
cd backend
pytest
```

Run frontend tests:
```bash
cd client
npm test
```

## Available Scripts

In the client directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run preview` - Preview production build

In the backend directory:

- `pytest` - Run all tests
- `pytest -m <marker>` - Run tests with specific marker
- `pytest --cov` - Run tests with coverage report

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 