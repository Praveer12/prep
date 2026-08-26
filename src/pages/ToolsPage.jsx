import { useState } from 'react';
import { useStopwatch, usePomodoro } from '../hooks/useApp';
import { Play, Pause, RotateCcw, Flag, Plus, Trash2, Search, Star, Edit3 } from 'lucide-react';

export default function ToolsPage({ questions, setQuestions, notes, setNotes }) {
  const [activeTab, setActiveTab] = useState('stopwatch');
  const stopwatch = useStopwatch();
  const pomodoro = usePomodoro();

  // Question states
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ text: '', answer: '', category: 'General' });
  const [questionSearch, setQuestionSearch] = useState('');

  // Note states
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'General' });
  const [noteSearch, setNoteSearch] = useState('');
  const [viewingNote, setViewingNote] = useState(null);
  const [editingNote, setEditingNote] = useState(false);

  // ═══ QUESTIONS ═══
  const handleAddQuestion = () => {
    if (!newQuestion.text.trim()) return;
    const q = {
      id: Date.now().toString(),
      text: newQuestion.text.trim(),
      answer: newQuestion.answer.trim(),
      category: newQuestion.category,
      starred: false,
      createdAt: new Date().toISOString(),
    };
    setQuestions(prev => [q, ...prev]);
    setNewQuestion({ text: '', answer: '', category: 'General' });
    setShowAddQuestion(false);
  };

  const toggleStar = (id) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, starred: !q.starred } : q));
  };

  const deleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const filteredQuestions = questions.filter(q =>
    q.text.toLowerCase().includes(questionSearch.toLowerCase()) ||
    q.category.toLowerCase().includes(questionSearch.toLowerCase())
  );

  // ═══ NOTES ═══
  const handleAddNote = () => {
    if (!newNote.title.trim()) return;
    const n = {
      id: Date.now().toString(),
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      category: newNote.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [n, ...prev]);
    setNewNote({ title: '', content: '', category: 'General' });
    setShowAddNote(false);
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    setViewingNote(null);
  };

  const handleUpdateNote = () => {
    setNotes(prev => prev.map(n => n.id === viewingNote.id ? {
      ...viewingNote,
      updatedAt: new Date().toISOString(),
    } : n));
    setEditingNote(false);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
    n.content.toLowerCase().includes(noteSearch.toLowerCase())
  );

  const noteColors = {
    'General': '#10b981',
    'Quant': '#06d6a0',
    'Reasoning': '#38bdf8',
    'English': '#fb923c',
    'GK': '#f472b6',
    'Banking': '#fbbf24',
  };

  // Stopwatch formatted
  const swTime = stopwatch.formatTime(stopwatch.elapsedTime);

  // Pomodoro ring
  const pomodoroRadius = 70;
  const pomodoroCircumference = 2 * Math.PI * pomodoroRadius;
  const pomodoroOffset = pomodoroCircumference - (pomodoro.progress / 100) * pomodoroCircumference;

  return (
    <div className="page-content page-enter">
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>🛠️ Tools</h2>

      {/* Sub Tabs */}
      <div className="sub-tabs">
        {[
          { key: 'stopwatch', label: '⏱️ Stopwatch' },
          { key: 'pomodoro', label: '🍅 Pomodoro' },
          { key: 'questions', label: '❓ Questions' },
          { key: 'notes', label: '📝 Notes' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`sub-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ STOPWATCH ═══ */}
      {activeTab === 'stopwatch' && (
        <div>
          <div className="glass-card-gradient stopwatch-display">
            <div className="stopwatch-time">
              {swTime.hrs}:{swTime.mins}:{swTime.secs}
              <span className="stopwatch-ms">.{swTime.millis}</span>
            </div>
          </div>

          <div className="stopwatch-controls">
            <button className="sw-btn secondary" onClick={stopwatch.reset}>
              <RotateCcw size={18} />
            </button>
            {stopwatch.isRunning ? (
              <button className="sw-btn pause" onClick={stopwatch.pause}>
                <Pause size={22} />
              </button>
            ) : (
              <button className="sw-btn start" onClick={stopwatch.start}>
                <Play size={22} style={{ marginLeft: '2px' }} />
              </button>
            )}
            <button className="sw-btn secondary" onClick={stopwatch.lap} disabled={!stopwatch.isRunning}>
              <Flag size={18} />
            </button>
          </div>

          {stopwatch.laps.length > 0 && (
            <div className="lap-list glass-card" style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Lap History
              </div>
              {stopwatch.laps.map((lapTime, idx) => {
                const lt = stopwatch.formatTime(lapTime);
                return (
                  <div key={idx} className="lap-item">
                    <span className="lap-number">Lap {stopwatch.laps.length - idx}</span>
                    <span className="lap-time">{lt.hrs}:{lt.mins}:{lt.secs}.{lt.millis}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ POMODORO ═══ */}
      {activeTab === 'pomodoro' && (
        <div className="pomodoro-container">
          <div className="glass-card-gradient" style={{ display: 'inline-block', padding: '32px', borderRadius: '24px' }}>
            <div className="pomodoro-ring-container">
              <svg width={160} height={160}>
                <defs>
                  <linearGradient id="pomo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={pomodoro.isBreak ? '#3b82f6' : '#10b981'} />
                    <stop offset="100%" stopColor={pomodoro.isBreak ? '#06b6d4' : '#059669'} />
                  </linearGradient>
                </defs>
                <circle
                  className="progress-ring-bg"
                  cx={80} cy={80} r={pomodoroRadius}
                  strokeWidth={8}
                />
                <circle
                  className="progress-ring-fill"
                  cx={80} cy={80} r={pomodoroRadius}
                  strokeWidth={8}
                  stroke="url(#pomo-grad)"
                  strokeDasharray={pomodoroCircumference}
                  strokeDashoffset={pomodoroOffset}
                />
              </svg>
              <div className="progress-ring-text">
                <div className="pomodoro-time">{pomodoro.mins}:{pomodoro.secs}</div>
                <div className="pomodoro-label">{pomodoro.isBreak ? 'Break' : 'Focus'}</div>
              </div>
            </div>
          </div>

          <div className="pomodoro-controls">
            <button className="sw-btn secondary" onClick={pomodoro.reset}>
              <RotateCcw size={18} />
            </button>
            <button className={`sw-btn ${pomodoro.isRunning ? 'pause' : 'start'}`} onClick={pomodoro.toggle}>
              {pomodoro.isRunning ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
            </button>
          </div>

          <div className="pomodoro-sessions">
            Sessions completed: <span>{pomodoro.sessions}</span>
          </div>

          <div className="glass-card" style={{ textAlign: 'left', marginTop: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>💡 How Pomodoro Works</div>
            <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li style={{ listStyle: 'disc', marginLeft: '16px' }}>25 minutes of focused study</li>
              <li style={{ listStyle: 'disc', marginLeft: '16px' }}>5 minutes short break</li>
              <li style={{ listStyle: 'disc', marginLeft: '16px' }}>Repeat for maximum productivity</li>
              <li style={{ listStyle: 'disc', marginLeft: '16px' }}>Take a longer break after 4 sessions</li>
            </ul>
          </div>
        </div>
      )}

      {/* ═══ QUESTIONS ═══ */}
      {activeTab === 'questions' && (
        <div>
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search questions..."
              value={questionSearch}
              onChange={e => setQuestionSearch(e.target.value)}
            />
          </div>

          <button
            className="glass-card"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              marginBottom: '16px',
              cursor: 'pointer',
              color: 'var(--green-600)',
              fontWeight: 600,
              fontSize: '14px',
              border: '1px dashed var(--border-accent)',
            }}
            onClick={() => setShowAddQuestion(true)}
          >
            <Plus size={18} /> Save Important Question
          </button>

          {filteredQuestions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">❓</div>
              <div className="empty-state-title">No saved questions</div>
              <div className="empty-state-desc">Save important questions for revision</div>
            </div>
          ) : (
            filteredQuestions.map(q => (
              <div key={q.id} className="question-card">
                <div className="question-text">{q.text}</div>
                {q.answer && <div className="question-answer">{q.answer}</div>}
                <div className="question-meta">
                  <span className="question-category">{q.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="question-star" onClick={() => toggleStar(q.id)}>
                      {q.starred ? '⭐' : '☆'}
                    </button>
                    <button className="task-delete" onClick={() => deleteQuestion(q.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══ NOTES ═══ */}
      {activeTab === 'notes' && !viewingNote && (
        <div>
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search notes..."
              value={noteSearch}
              onChange={e => setNoteSearch(e.target.value)}
            />
          </div>

          <button
            className="glass-card"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              marginBottom: '16px',
              cursor: 'pointer',
              color: 'var(--green-600)',
              fontWeight: 600,
              fontSize: '14px',
              border: '1px dashed var(--border-accent)',
            }}
            onClick={() => setShowAddNote(true)}
          >
            <Plus size={18} /> Add New Note
          </button>

          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-title">No notes yet</div>
              <div className="empty-state-desc">Start taking notes for your preparation</div>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map(n => (
                <div
                  key={n.id}
                  className="note-card"
                  onClick={() => setViewingNote(n)}
                  style={{ borderLeft: `3px solid ${noteColors[n.category] || noteColors['General']}` }}
                >
                  <div className="note-card-title">{n.title}</div>
                  <div className="note-card-content">{n.content || 'No content'}</div>
                  <div className="note-card-date">
                    <span className="note-category-dot" style={{ background: noteColors[n.category] || noteColors['General'] }} />
                    {n.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ VIEW NOTE ═══ */}
      {activeTab === 'notes' && viewingNote && (
        <div>
          <button
            className="btn-secondary"
            onClick={() => { setViewingNote(null); setEditingNote(false); }}
            style={{ marginBottom: '16px' }}
          >
            ← Back to Notes
          </button>

          {editingNote ? (
            <>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={viewingNote.title}
                  onChange={e => setViewingNote(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  className="form-textarea"
                  value={viewingNote.content}
                  onChange={e => setViewingNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={10}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={viewingNote.category}
                  onChange={e => setViewingNote(prev => ({ ...prev, category: e.target.value }))}
                >
                  {Object.keys(noteColors).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button className="btn-primary" onClick={handleUpdateNote}>Save Changes</button>
            </>
          ) : (
            <div className="glass-card">
              <div className="note-view-title">{viewingNote.title}</div>
              <div className="note-view-date">
                <span className="note-category-dot" style={{ background: noteColors[viewingNote.category] || noteColors['General'] }} />
                {viewingNote.category} • {new Date(viewingNote.updatedAt).toLocaleDateString()}
              </div>
              <div className="note-view-content">{viewingNote.content || 'No content'}</div>
              <div className="note-actions">
                <button className="btn-secondary" onClick={() => setEditingNote(true)}>
                  <Edit3 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Edit
                </button>
                <button className="btn-danger" style={{ flex: 1 }} onClick={() => deleteNote(viewingNote.id)}>
                  <Trash2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ ADD QUESTION MODAL ═══ */}
      {showAddQuestion && (
        <div className="modal-overlay" onClick={() => setShowAddQuestion(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title">❓ Save Important Question</h3>
            <div className="form-group">
              <label className="form-label">Question</label>
              <textarea
                className="form-textarea"
                placeholder="Type the question here..."
                value={newQuestion.text}
                onChange={e => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Answer (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Type the answer..."
                value={newQuestion.answer}
                onChange={e => setNewQuestion(prev => ({ ...prev, answer: e.target.value }))}
                style={{ minHeight: '60px' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={newQuestion.category}
                onChange={e => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
              >
                {['General', 'Quant', 'Reasoning', 'English', 'GK', 'Banking'].map(c =>
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
            </div>
            <button className="btn-primary" onClick={handleAddQuestion}>Save Question</button>
          </div>
        </div>
      )}

      {/* ═══ ADD NOTE MODAL ═══ */}
      {showAddNote && (
        <div className="modal-overlay" onClick={() => setShowAddNote(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title">📝 Add New Note</h3>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="Note title..."
                value={newNote.title}
                onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                className="form-textarea"
                placeholder="Write your notes here..."
                value={newNote.content}
                onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={newNote.category}
                onChange={e => setNewNote(prev => ({ ...prev, category: e.target.value }))}
              >
                {Object.keys(noteColors).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="btn-primary" onClick={handleAddNote}>Save Note</button>
          </div>
        </div>
      )}
    </div>
  );
}
