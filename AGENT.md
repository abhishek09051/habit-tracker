# Habit Tracker - Agent Instructions

This file contains instructions for AI agents to understand and modify the Habit Tracker codebase.

## Project Overview

A full-stack habit tracking application built with React (TypeScript) frontend and FastAPI (Python) backend, containerized using Docker.

## Architecture

### Frontend (React + TypeScript + Vite)
- **Location**: `frontend/` directory
- **Entry Point**: `src/main.tsx`
- **Main Component**: `src/App.tsx`
- **Styling**: `src/App.css` with CSS variables for theming
- **Build**: Vite bundler, served by Nginx
- **Port**: 80 (internal), 3000 (external)

### Backend (FastAPI + Python)
- **Location**: `backend/` directory
- **Entry Point**: `main.py`
- **Database**: SQLite with SQLAlchemy ORM
- **Models**: `Habit` and `Completion`
- **Port**: 8000

### Docker Setup
- **Frontend Dockerfile**: Multi-stage build (Node.js → Nginx)
- **Backend Dockerfile**: Python 3.11-slim with Uvicorn
- **Compose**: `docker-compose.yml` orchestrates both services

## Key Features

1. **Habit Management**: CRUD operations for habits with emoji icons
2. **Daily Tracking**: Mark habits complete/incomplete for any date
3. **Streak Calculation**: Automatic streak counting based on consecutive completions
4. **Weekly Calendar**: Visual grid showing past 7 days of completions
5. **Theming**: Light/dark mode toggle with CSS variables

## Database Schema

### Habits Table
- `id`: Integer (Primary Key)
- `name`: String (Habit name)
- `emoji`: String (Icon, default "⭐")
- `created_at`: Date (Creation date)

### Completions Table
- `id`: Integer (Primary Key)
- `habit_id`: Integer (Foreign Key to Habits)
- `completed_date`: Date (Date of completion)

## API Endpoints

- `GET /api/health`: Health check
- `GET /api/habits`: Retrieve all habits with streaks
- `POST /api/habits`: Create new habit
- `PUT /api/habits/{id}`: Update habit
- `DELETE /api/habits/{id}`: Delete habit (cascades to completions)
- `GET /api/completions`: Get all completions
- `POST /api/completions`: Mark habit complete for a date
- `DELETE /api/completions/{id}`: Remove completion

## Common Modification Tasks

### Adding a New Frontend Feature
1. Update `src/App.tsx` with new state and handlers
2. Add styling in `src/App.css`
3. Ensure dark mode compatibility using CSS variables

### Adding a New API Endpoint
1. Add route handler in `backend/main.py`
2. Create Pydantic models if needed
3. Update database schema if required
4. Run migrations or recreate database

### Modifying Streak Logic
- Edit `calculate_streak()` function in `backend/main.py`
- Currently counts consecutive days ending today

### Changing Database
- Update `DATABASE_URL` in `docker-compose.yml`
- Modify SQLAlchemy engine config in `backend/main.py`
- Add appropriate database driver to `requirements.txt`

### Styling Changes
1. Light/dark mode colors: Update CSS variables in `:root` and `.dark-mode`
2. Layout: Modify classes in `src/App.css`
3. Responsive: Check media queries at bottom of CSS file

## Development Workflow

1. **Local Development**:
   - Frontend: `cd frontend && npm install && npm run dev`
   - Backend: `cd backend && pip install -r requirements.txt && uvicorn main:app --reload`

2. **Docker Development**:
   ```bash
   docker-compose up --build
   ```

3. **Testing Changes**:
   - Frontend changes: Auto-reload with Vite dev server
   - Backend changes: Auto-reload with Uvicorn --reload flag
   - Docker: Rebuild containers after changes

## Important Notes

- **CORS**: Enabled for all origins in backend (restrictive for production)
- **TypeScript**: Use `export default` for React components
- **Database**: SQLite is used by default; persisted in Docker volume
- **Nginx Proxy**: Frontend proxies `/api/*` requests to backend
- **Date Handling**: All dates stored as ISO format strings (YYYY-MM-DD)

## File Structure

```
habit-tracker/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       └── App.css
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py
├── docker-compose.yml
├── README.md
├── .gitignore
└── AGENT.md
```

## Troubleshooting

- **Port conflicts**: Change ports in `docker-compose.yml`
- **Database issues**: Delete volume and recreate: `docker-compose down -v`
- **Build failures**: Check Dockerfile syntax, ensure `npm install` not `npm ci`
- **API errors**: Check CORS settings and backend logs