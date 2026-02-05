# Habit Tracker

A motivational daily habit tracker to help you build consistent routines and track your progress.

## Features

- 📝 Add habits with custom names and emoji icons
- ✅ Daily checklist to mark habits as complete
- 🔥 Track current streaks for each habit
- 📅 Weekly calendar view showing completion history
- ✏️ Edit and delete habits
- 🎨 Beautiful, motivational UI with progress indicators
- 🌓 Light and dark mode support
- 📱 Responsive design for all devices

## Tech Stack

**Frontend:**
- React with TypeScript
- Vite for build tooling
- CSS variables for theming
- Nginx for serving

**Backend:**
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite database
- Uvicorn server

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your system

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd habit-tracker
```

2. Start the application with Docker Compose:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Development

To run the services individually for development:

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create a new habit
- `PUT /api/habits/{id}` - Update a habit
- `DELETE /api/habits/{id}` - Delete a habit
- `GET /api/completions` - Get all completions
- `POST /api/completions` - Mark a habit as complete
- `DELETE /api/completions/{id}` - Remove a completion

## Usage

1. **Add a Habit**: Click "+ Add Habit" and enter the habit name and select an emoji icon
2. **Mark Complete**: Click the circle button next to each habit to mark it complete for today
3. **View Streaks**: See your current streak displayed under each habit
4. **Weekly View**: Check the calendar to see your completion history for the past 7 days
5. **Edit/Delete**: Use the edit (✎) or delete (🗑️) buttons to manage your habits
6. **Toggle Theme**: Click the sun/moon icon in the header to switch between light and dark modes

## License

MIT License - feel free to use this project for personal or commercial purposes.