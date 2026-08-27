import { useState } from 'react';
import { Check, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, getTodayKey } from '../hooks/useApp';
import { defaultHabits } from '../data/syllabusData';

export default function PlannerPage({ tasks, setTasks, habits, setHabits, habitLog, setHabitLog, addActivity }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });
  const [newHabitName, setNewHabitName] = useState('');

  // Navigate date
  const changeDate = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Filter tasks by date
  const dateTasks = tasks.filter(t => t.date === selectedDate);
  const completedCount = dateTasks.filter(t => t.completed).length;

  // Add task
  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    const task = {
      id: crypto.randomUUID(),
      title: newTask.title.trim(),
      priority: newTask.priority,
      date: selectedDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [task, ...prev]);
    addActivity('task', `Added task: ${task.title}`);
    setNewTask({ title: '', priority: 'medium' });
    setShowAddTask(false);
  };

  // Toggle task
  const toggleTask = (id) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task && !task.completed) {
        addActivity('task', `Completed task: ${task.title}`);
      }
      return prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    });
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Habit logic
  const allHabits = habits.length > 0 ? habits : defaultHabits;
  const todayHabitKey = getTodayKey();
  const todayLog = habitLog[todayHabitKey] || {};

  const toggleHabit = (habitId) => {
    if (!todayLog[habitId]) {
      const habit = allHabits.find(h => h.id === habitId);
      if (habit) addActivity('habit', `Completed habit: ${habit.name}`);
    }
    
    setHabitLog(prev => ({
      ...prev,
      [todayHabitKey]: {
        ...prev[todayHabitKey],
        [habitId]: !prev[todayHabitKey]?.[habitId],
      },
    }));
  };

  // Calculate streak for a habit
  const getHabitStreak = (habitId) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (habitLog[key]?.[habitId]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  // Add custom habit
  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    const habit = {
      id: `custom-${Date.now()}`,
      name: newHabitName.trim(),
      icon: '✨',
    };
    setHabits(prev => [...prev, habit]);
    setNewHabitName('');
    setShowAddHabit(false);
  };

  // Delete custom habit
  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="page-content page-enter">
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>📋 Planner</h2>

      {/* Sub Tabs */}
      <div className="sub-tabs">
        <button className={`sub-tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          Daily Tasks
        </button>
        <button className={`sub-tab ${activeTab === 'habits' ? 'active' : ''}`} onClick={() => setActiveTab('habits')}>
          Daily Habits
        </button>
        <button className={`sub-tab ${activeTab === 'routine' ? 'active' : ''}`} onClick={() => setActiveTab('routine')}>
          Routine
        </button>
      </div>

      {/* ═══ TASKS TAB ═══ */}
      {activeTab === 'tasks' && (
        <>
          {/* Date Navigation */}
          <div className="task-date-nav">
            <button onClick={() => changeDate(-1)}>
              <ChevronLeft size={16} />
            </button>
            <div className="task-date-text">{formatDate(selectedDate)}</div>
            <button onClick={() => changeDate(1)}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Progress */}
          {dateTasks.length > 0 && (
            <div className="glass-card" style={{ marginBottom: '16px', textAlign: 'center', padding: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {completedCount}/{dateTasks.length} completed
              </div>
              <div style={{ 
                height: '4px', 
                background: 'rgba(255,255,255,0.06)', 
                borderRadius: '2px', 
                marginTop: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${dateTasks.length > 0 ? (completedCount / dateTasks.length) * 100 : 0}%`,
                  background: 'var(--gradient-primary)',
                  borderRadius: '2px',
                  transition: 'width 0.5s var(--ease-out)',
                }} />
              </div>
            </div>
          )}

          {/* Add Task Button */}
          <button
            className="glass-card"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              marginBottom: '12px',
              cursor: 'pointer',
              color: 'var(--green-600)',
              fontWeight: 600,
              fontSize: '14px',
              border: '1px dashed var(--border-accent)',
            }}
            onClick={() => setShowAddTask(true)}
          >
            <Plus size={18} /> Add New Task
          </button>

          {/* Task List */}
          {dateTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No tasks for {formatDate(selectedDate)}</div>
              <div className="empty-state-desc">Tap + to add your first task</div>
            </div>
          ) : (
            dateTasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div
                  className={`custom-checkbox ${task.completed ? 'checked' : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <Check size={12} />
                </div>
                <div className="task-content">
                  <div className={`task-title ${task.completed ? 'done' : ''}`}>{task.title}</div>
                  <div className="task-meta">
                    <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', fontSize: '10px', color: 'var(--text-secondary)' }}>
                      <span className={`status-dot ${task.completed ? 'completed' : new Date(task.date) < new Date(new Date().toDateString()) ? 'overdue' : 'pending'}`} />
                      {task.completed ? 'Done' : new Date(task.date) < new Date(new Date().toDateString()) ? 'Overdue' : 'Pending'}
                    </div>
                  </div>
                </div>
                <button className="task-delete" onClick={() => deleteTask(task.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </>
      )}

      {/* ═══ HABITS TAB ═══ */}
      {activeTab === 'habits' && (
        <>
          <div className="section-header">
            <h3 className="section-title">Today's Habits</h3>
            <button className="section-action" onClick={() => setShowAddHabit(true)}>+ Add</button>
          </div>

          {allHabits.map(habit => {
            const isDone = !!todayLog[habit.id];
            const streak = getHabitStreak(habit.id);
            return (
              <div key={habit.id} className="habit-item">
                <div
                  className={`custom-checkbox ${isDone ? 'checked' : ''}`}
                  onClick={() => toggleHabit(habit.id)}
                >
                  <Check size={12} />
                </div>
                <div className="habit-info">
                  <div className="habit-name">{habit.icon} {habit.name}</div>
                  {streak > 0 && <div className="habit-streak">🔥 {streak} day streak</div>}
                </div>
                {habit.id.startsWith('custom-') && (
                  <button className="task-delete" onClick={() => deleteHabit(habit.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* ═══ ROUTINE TAB ═══ */}
      {activeTab === 'routine' && (
        <>
          <div className="section-header">
            <h3 className="section-title">Daily Study Routine</h3>
          </div>

          {[
            { time: '6:00 - 8:00 AM', label: 'Morning', icon: '🌅', tasks: ['Revise previous day notes', 'Current Affairs reading', 'Quick MCQ practice'] },
            { time: '9:00 - 12:00 PM', label: 'Focus Block 1', icon: '📖', tasks: ['Deep study - Main subject', 'Practice questions', 'Note-making'] },
            { time: '2:00 - 5:00 PM', label: 'Focus Block 2', icon: '📝', tasks: ['Second subject study', 'Mock test practice', 'Previous year papers'] },
            { time: '6:00 - 8:00 PM', label: 'Evening', icon: '🌆', tasks: ['Revision & formulas', 'Weak area focus', 'Quiz practice'] },
            { time: '9:00 - 10:00 PM', label: 'Night', icon: '🌙', tasks: ['Light reading', 'Next day planning', 'Mental relaxation'] },
          ].map((block, idx) => (
            <div key={idx} className="glass-card" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px' }}>{block.icon}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{block.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{block.time}</div>
                </div>
              </div>
              <ul style={{ paddingLeft: '48px' }}>
                {block.tasks.map((t, i) => (
                  <li key={i} style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                    listStyle: 'disc',
                    listStylePosition: 'outside',
                  }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {/* ═══ ADD TASK MODAL ═══ */}
      {showAddTask && (
        <div className="modal-overlay" onClick={() => setShowAddTask(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title">✏️ Add New Task</h3>
            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Complete 50 MCQs on Quant"
                value={newTask.title}
                onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <div className="priority-select">
                {['high', 'medium', 'low'].map(p => (
                  <button
                    key={p}
                    className={`priority-option ${p} ${newTask.priority === p ? 'selected' : ''}`}
                    onClick={() => setNewTask(prev => ({ ...prev, priority: p }))}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-primary" onClick={handleAddTask}>Add Task</button>
          </div>
        </div>
      )}

      {/* ═══ ADD HABIT MODAL ═══ */}
      {showAddHabit && (
        <div className="modal-overlay" onClick={() => setShowAddHabit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title">✨ Add Custom Habit</h3>
            <div className="form-group">
              <label className="form-label">Habit Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Read 30 pages daily"
                value={newHabitName}
                onChange={e => setNewHabitName(e.target.value)}
                autoFocus
              />
            </div>
            <button className="btn-primary" onClick={handleAddHabit}>Add Habit</button>
          </div>
        </div>
      )}
    </div>
  );
}
