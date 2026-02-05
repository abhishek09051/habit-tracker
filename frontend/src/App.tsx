import { useState, useEffect } from 'react';
import './App.css';

interface Habit {
  id: number;
  name: string;
  emoji: string;
  current_streak: number;
  created_at: string;
}

interface HabitCompletion {
  id: number;
  habit_id: number;
  completed_date: string;
}

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitEmoji, setNewHabitEmoji] = useState('⭐');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchHabits();
    fetchCompletions();
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits');
      if (!response.ok) throw new Error('Failed to fetch habits');
      const data = await response.json();
      setHabits(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletions = async () => {
    try {
      const response = await fetch('/api/completions');
      if (!response.ok) throw new Error('Failed to fetch completions');
      const data = await response.json();
      setCompletions(data);
    } catch (err) {
      console.error('Error fetching completions:', err);
    }
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHabitName, emoji: newHabitEmoji }),
      });
      if (!response.ok) throw new Error('Failed to add habit');
      await fetchHabits();
      setNewHabitName('');
      setNewHabitEmoji('⭐');
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteHabit = async (id: number) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    try {
      const response = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete habit');
      await fetchHabits();
      await fetchCompletions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit) return;

    try {
      const response = await fetch(`/api/habits/${editingHabit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingHabit.name, emoji: editingHabit.emoji }),
      });
      if (!response.ok) throw new Error('Failed to update habit');
      await fetchHabits();
      setEditingHabit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const toggleCompletion = async (habitId: number, date: string) => {
    const existing = completions.find(
      (c) => c.habit_id === habitId && c.completed_date === date
    );

    try {
      if (existing) {
        const response = await fetch(`/api/completions/${existing.id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove completion');
      } else {
        const response = await fetch('/api/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habit_id: habitId, completed_date: date }),
        });
        if (!response.ok) throw new Error('Failed to add completion');
      }
      await fetchCompletions();
      await fetchHabits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const isCompletedToday = (habitId: number) => {
    const today = getTodayString();
    return completions.some((c) => c.habit_id === habitId && c.completed_date === today);
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const isCompletedOnDate = (habitId: number, date: string) => {
    return completions.some((c) => c.habit_id === habitId && c.completed_date === date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const weekDates = getWeekDates();

  if (loading) {
    return <div className="loading">Loading your habits...</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>🎯 Habit Tracker</h1>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="container">
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Cancel' : '+ Add Habit'}
          </button>
        </div>

        {showAddForm && (
          <form className="add-form" onSubmit={addHabit}>
            <input
              type="text"
              placeholder="Habit name (e.g., Morning workout)"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              required
            />
            <select value={newHabitEmoji} onChange={(e) => setNewHabitEmoji(e.target.value)}>
              <option value="⭐">⭐ Star</option>
              <option value="💪">💪 Strength</option>
              <option value="📚">📚 Reading</option>
              <option value="🏃">🏃 Running</option>
              <option value="🧘">🧘 Meditation</option>
              <option value="💧">💧 Water</option>
              <option value="🥗">🥗 Healthy Eating</option>
              <option value="😴">😴 Sleep</option>
              <option value="✍️">✍️ Writing</option>
              <option value="🎨">🎨 Creative</option>
            </select>
            <button type="submit" className="btn-primary">Add Habit</button>
          </form>
        )}

        {habits.length === 0 ? (
          <div className="empty-state">
            <p>No habits yet! Start building your daily routine.</p>
          </div>
        ) : (
          <>
            <section className="daily-checklist">
              <h2>Today's Checklist</h2>
              <div className="habits-list">
                {habits.map((habit) => (
                  <div key={habit.id} className="habit-card">
                    <div className="habit-info">
                      <span className="habit-emoji">{habit.emoji}</span>
                      <div className="habit-details">
                        <h3>{habit.name}</h3>
                        <p className="streak">🔥 {habit.current_streak} day streak</p>
                      </div>
                    </div>
                    <div className="habit-actions">
                      <button
                        className={`check-btn ${isCompletedToday(habit.id) ? 'completed' : ''}`}
                        onClick={() => toggleCompletion(habit.id, getTodayString())}
                        title={isCompletedToday(habit.id) ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {isCompletedToday(habit.id) ? '✓' : '○'}
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => setEditingHabit(habit)}
                        title="Edit habit"
                      >
                        ✎
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteHabit(habit.id)}
                        title="Delete habit"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="weekly-view">
              <h2>Weekly Progress</h2>
              <div className="calendar">
                <div className="calendar-header">
                  <div className="calendar-cell"></div>
                  {weekDates.map((date) => (
                    <div key={date} className="calendar-cell date-header">
                      {formatDate(date)}
                    </div>
                  ))}
                </div>
                {habits.map((habit) => (
                  <div key={habit.id} className="calendar-row">
                    <div className="calendar-cell habit-label">
                      <span className="habit-emoji">{habit.emoji}</span>
                      <span className="habit-name">{habit.name}</span>
                    </div>
                    {weekDates.map((date) => (
                      <div
                        key={date}
                        className={`calendar-cell completion-cell ${
                          isCompletedOnDate(habit.id, date) ? 'completed' : ''
                        }`}
                        onClick={() => toggleCompletion(habit.id, date)}
                      >
                        {isCompletedOnDate(habit.id, date) ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {editingHabit && (
        <div className="modal-overlay" onClick={() => setEditingHabit(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Habit</h2>
            <form onSubmit={updateHabit}>
              <input
                type="text"
                value={editingHabit.name}
                onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                required
              />
              <select
                value={editingHabit.emoji}
                onChange={(e) => setEditingHabit({ ...editingHabit, emoji: e.target.value })}
              >
                <option value="⭐">⭐ Star</option>
                <option value="💪">💪 Strength</option>
                <option value="📚">📚 Reading</option>
                <option value="🏃">🏃 Running</option>
                <option value="🧘">🧘 Meditation</option>
                <option value="💧">💧 Water</option>
                <option value="🥗">🥗 Healthy Eating</option>
                <option value="😴">😴 Sleep</option>
                <option value="✍️">✍️ Writing</option>
                <option value="🎨">🎨 Creative</option>
              </select>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" className="btn-secondary" onClick={() => setEditingHabit(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;