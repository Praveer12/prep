import { useState, useRef } from 'react';
import { sscSyllabus, bankSyllabus } from '../data/syllabusData';
import { supabase } from '../supabaseClient';
import { LogOut } from 'lucide-react';

export default function ProfilePage({ 
  examType, setExamType, 
  tasks, 
  completedTopicsMap, 
  streak, 
  habitLog,
  examDate, setExamDate,
  profilePic, setProfilePic,
  userName, setUserName,
  onResetData 
}) {
  const fileInputRef = useRef(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [examDateInput, setExamDateInput] = useState(examDate || '');
  const [showExamDate, setShowExamDate] = useState(false);

  // Stats calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  // Total completed topics
  const completedTopics = Object.values(completedTopicsMap).filter(Boolean).length;

  // Total topics for selected exam
  const calcTotalTopics = (syllabus) => {
    let count = 0;
    Object.values(syllabus).forEach(tier => {
      Object.values(tier).forEach(section => {
        count += section.topics.length;
      });
    });
    return count;
  };

  const totalTopics = examType === 'ssc' 
    ? calcTotalTopics(sscSyllabus) 
    : examType === 'bank' 
      ? calcTotalTopics(bankSyllabus) 
      : calcTotalTopics(sscSyllabus) + calcTotalTopics(bankSyllabus);

  // Total habits completed
  const totalHabitsCompleted = Object.values(habitLog).reduce((sum, day) => {
    return sum + Object.values(day).filter(Boolean).length;
  }, 0);

  const handleSaveExamDate = () => {
    setExamDate(examDateInput);
    setShowExamDate(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Please choose an image smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="page-content page-enter">
      {/* Profile Header */}
      <div className="profile-header">
        <div 
          className="profile-avatar" 
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative', background: profilePic ? 'none' : 'var(--gradient-primary)' }}
        >
          {profilePic ? (
            <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            '🎯'
          )}
          <div className="avatar-overlay" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '10px', padding: '2px 0' }}>Edit</div>
        </div>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImageUpload} 
        />
        <div className="profile-name-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              autoFocus
              className="form-input"
              style={{ width: '150px', textAlign: 'center', padding: '6px' }}
            />
          ) : (
            <>
              <div className="profile-name" style={{ fontSize: '24px' }}>{userName}</div>
              <button 
                onClick={() => { setTempName(userName); setIsEditingName(true); }}
                style={{ color: 'var(--text-muted)', background: 'transparent' }}
              >
                ✎
              </button>
            </>
          )}
        </div>
        <div className="profile-exam">
          {examType === 'ssc' ? 'SSC CGL' : examType === 'bank' ? 'IBPS PO' : 'SSC & Bank'} Aspirant
        </div>
      </div>

      {/* Stats Grid */}
      <div className="section-header">
        <h3 className="section-title">📊 Statistics</h3>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-value text-gradient">{streak}</div>
          <div className="stat-label">Day Streak 🔥</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{completedTopics}</div>
          <div className="stat-label">Topics Done</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{completedTasks}</div>
          <div className="stat-label">Tasks Done</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-pink)' }}>{totalHabitsCompleted}</div>
          <div className="stat-label">Habits Done</div>
        </div>
      </div>

      {/* Exam Selection */}
      <div className="section-header" style={{ marginTop: '28px' }}>
        <h3 className="section-title">🎯 Exam Selection</h3>
      </div>

      <div className="exam-select-cards">
        {[
          { value: 'ssc', name: 'SSC CGL', desc: 'Staff Selection Commission', icon: '🏛️' },
          { value: 'bank', name: 'IBPS PO', desc: 'Institute of Banking Personnel', icon: '🏦' },
          { value: 'both', name: 'Both', desc: 'SSC CGL + IBPS PO', icon: '📚' },
        ].map(option => (
          <div
            key={option.value}
            className={`exam-select-card ${examType === option.value ? 'selected' : ''}`}
            onClick={() => setExamType(option.value)}
          >
            <span style={{ fontSize: '24px' }}>{option.icon}</span>
            <div style={{ flex: 1 }}>
              <div className="exam-select-name">{option.name}</div>
              <div className="exam-select-desc">{option.desc}</div>
            </div>
            <div className={`exam-radio ${examType === option.value ? 'selected' : ''}`} />
          </div>
        ))}
      </div>

      {/* Exam Date */}
      <div className="section-header" style={{ marginTop: '28px' }}>
        <h3 className="section-title">📅 Exam Date</h3>
      </div>

      <div className="settings-item" onClick={() => setShowExamDate(true)}>
        <div className="settings-item-left">
          <div className="settings-item-icon" style={{ background: 'rgba(251, 146, 60, 0.15)' }}>📅</div>
          <div>
            <div className="settings-item-title">Set Exam Date</div>
            <div className="settings-item-subtitle">
              {examDate ? new Date(examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}
            </div>
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
      </div>

      {/* Achievements */}
      <div className="section-header" style={{ marginTop: '28px' }}>
        <h3 className="section-title">🏆 Achievements</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {[
          { icon: '🚀', label: 'First Step', unlocked: totalTasks > 0 },
          { icon: '📚', label: '10 Topics', unlocked: completedTopics >= 10 },
          { icon: '🔥', label: '7 Day Streak', unlocked: streak >= 7 },
          { icon: '💪', label: '50 Tasks', unlocked: completedTasks >= 50 },
          { icon: '🏆', label: '50% Syllabus', unlocked: completedTopics >= totalTopics * 0.5 },
          { icon: '👑', label: '100% Done', unlocked: completedTopics >= totalTopics && totalTopics > 0 },
        ].map((badge, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{
              textAlign: 'center',
              padding: '14px 8px',
              opacity: badge.unlocked ? 1 : 0.3,
              filter: badge.unlocked ? 'none' : 'grayscale(1)',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>{badge.icon}</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>{badge.label}</div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="section-header" style={{ marginTop: '28px' }}>
        <h3 className="section-title">⚙️ Settings</h3>
      </div>

      <div className="settings-item" onClick={() => setShowReset(true)}>
        <div className="settings-item-left">
          <div className="settings-item-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>🗑️</div>
          <div>
            <div className="settings-item-title" style={{ color: 'var(--accent-red)' }}>Reset All Data</div>
            <div className="settings-item-subtitle">Clear all progress and start fresh</div>
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
      </div>

      <div className="glass-card" style={{ marginTop: '16px', textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          SSC & Bank Exam Prep v1.0
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Built with ❤️ for aspirants
        </div>
      </div>

      <div style={{ height: '20px' }} />

      {/* Logout Button */}
      <button 
        onClick={async () => {
          await supabase.auth.signOut();
        }}
        className="glass-card flex-center"
        style={{ 
          width: '100%', 
          padding: '14px', 
          color: '#ff4d4f', 
          gap: '8px', 
          fontSize: '15px', 
          fontWeight: 600, 
          marginBottom: '20px',
          border: '1px solid rgba(255, 77, 79, 0.2)',
          background: 'rgba(255, 77, 79, 0.05)'
        }}
      >
        <LogOut size={18} /> Sign Out
      </button>

      {/* Reset Confirmation Modal */}
      {showReset && (
        <div className="modal-overlay" onClick={() => setShowReset(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title">⚠️ Reset All Data?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
              This will permanently delete all your progress, tasks, notes, saved questions, and habits. This action cannot be undone.
            </p>
            <button className="btn-danger" onClick={() => { onResetData(); setShowReset(false); }}>
              Yes, Reset Everything
            </button>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '8px' }} onClick={() => setShowReset(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Exam Date Modal */}
      {showExamDate && (
        <div className="modal-overlay" onClick={() => setShowExamDate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title">📅 Set Exam Date</h3>
            <div className="form-group">
              <label className="form-label">Expected Exam Date</label>
              <input
                type="date"
                className="form-input"
                value={examDateInput}
                onChange={e => setExamDateInput(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <button className="btn-primary" onClick={handleSaveExamDate}>Save Date</button>
            {examDate && (
              <button
                className="btn-danger"
                style={{ marginTop: '8px' }}
                onClick={() => { setExamDate(''); setShowExamDate(false); }}
              >
                Remove Date
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
