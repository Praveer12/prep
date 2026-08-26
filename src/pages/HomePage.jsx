import { useState, useMemo } from 'react';
import { useClock, getGreeting, getTodayKey } from '../hooks/useApp';
import { Clock, Flame, CheckCircle, BookOpen, ChevronLeft, ChevronRight, X, Activity, Target } from 'lucide-react';

export default function HomePage({ 
  tasks, 
  completedTopics, 
  totalTopics, 
  examType, 
  examDate, 
  streak,
  firstActiveDate,
  lastActiveDate,
  activityLog,
  profilePic,
  userName,
  onNavigate 
}) {
  const { hoursStr, minutes, seconds, ampm, dateStr, hours } = useClock();
  const greeting = getGreeting(hours);
  const todayKey = getTodayKey();

  // ═══ STATE FOR CALENDAR & MODAL ═══
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [showActivities, setShowActivities] = useState(false);

  // ═══ PROGRESS DATA ═══
  const todayTasks = tasks.filter(t => t.date === todayKey);
  const completedTasks = todayTasks.filter(t => t.completed).length;

  const daysUntilExam = examDate
    ? Math.max(0, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  // ═══ CALENDAR LOGIC ═══
  const changeMonth = (delta) => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonthDate(newDate);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Make Monday = 0, Sunday = 6
  };

  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const today = new Date(todayKey);
    const firstActive = firstActiveDate ? new Date(firstActiveDate) : today;
    
    // Map of dates with activity
    const activityDatesMap = {};
    activityLog.forEach(log => {
      activityDatesMap[log.date] = true;
    });
    if (lastActiveDate) activityDatesMap[lastActiveDate] = true;
    if (firstActiveDate) activityDatesMap[firstActiveDate] = true;
    activityDatesMap[todayKey] = true; // Today is always active if logged in

    // Empty slots before 1st day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      // Format as YYYY-MM-DD local
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${d}`;
      
      let status = 'upcoming'; // default for future or before first active
      
      if (dateObj >= firstActive && dateObj <= today) {
        if (activityDatesMap[dateKey]) {
          status = 'delivered'; // active/green
        } else {
          status = 'absent'; // missed/red
        }
      } else if (dateObj > today) {
        status = 'upcoming';
      }

      days.push({ day: i, dateKey, status, isToday: dateKey === todayKey });
    }
    return days;
  }, [currentMonthDate, firstActiveDate, lastActiveDate, activityLog, todayKey]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="page-content page-enter" style={{ paddingBottom: '90px' }}>
      
      {/* ═══ HEADER ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {profilePic && (
            <img src={profilePic} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green-500)' }} />
          )}
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {greeting} 🌙
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {userName}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="glass-card flex-center" 
            style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)', gap: '6px', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setShowActivities(true)}
          >
            Activity <ChevronRight size={14} />
          </button>
          <div className="glass-card" style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {dateStr}
          </div>
        </div>
      </div>

      <div className="glass-card digital-clock-container" style={{ marginBottom: '20px', padding: '16px', textAlign: 'center' }}>
        <div className="digital-clock" style={{ fontSize: '46px', color: 'var(--green-600)', fontWeight: '800', lineHeight: '1.1' }}>
          {hoursStr}
          <span className="clock-separator">:</span>
          {minutes}
          <span className="clock-separator" style={{ opacity: 0.6, fontSize: '0.8em' }}>:</span>
          <span style={{ opacity: 0.6, fontSize: '0.8em' }}>{seconds}</span>
          <span className="clock-ampm" style={{ color: 'var(--green-700)', fontSize: '20px', verticalAlign: 'super' }}> {ampm}</span>
        </div>
      </div>

      {/* ═══ 2x2 GRID ═══ */}
      <div className="dashboard-grid">
        {/* Exam Card */}
        <div className="dash-card">
          <div className="dash-icon" style={{ color: 'var(--accent-blue)', background: 'var(--accent-blue-bg)' }}>
            <Target size={18} />
          </div>
          <div className="dash-value">
            {daysUntilExam !== null ? daysUntilExam : '--'}
          </div>
          <div className="dash-label">{daysUntilExam !== null ? 'Days to Exam' : 'Set Exam Date'}</div>
        </div>

        {/* Streak Card */}
        <div className="dash-card">
          <div className="dash-icon" style={{ color: 'var(--accent-orange)', background: 'var(--accent-orange-light)' }}>
            <Flame size={18} />
          </div>
          <div className="dash-value">{streak}</div>
          <div className="dash-label">Day Streak</div>
        </div>

        {/* Tasks Card */}
        <div className="dash-card">
          <div className="dash-icon" style={{ color: 'var(--green-600)', background: 'var(--green-50)' }}>
            <CheckCircle size={18} />
          </div>
          <div className="dash-value">{completedTasks}/{todayTasks.length}</div>
          <div className="dash-label">Tasks Done Today</div>
        </div>

        {/* Syllabus Card */}
        <div className="dash-card">
          <div className="dash-icon" style={{ color: 'var(--accent-purple)', background: 'var(--accent-purple-light)' }}>
            <BookOpen size={18} />
          </div>
          <div className="dash-value">{completedTopics}/{totalTopics}</div>
          <div className="dash-label">Topics Completed</div>
        </div>
      </div>

      {/* ═══ CALENDAR ═══ */}
      <div className="glass-card" style={{ marginTop: '20px', padding: '20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => changeMonth(-1)} style={{ color: 'var(--text-muted)' }}><ChevronLeft size={20} /></button>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
          </div>
          <button onClick={() => changeMonth(1)} style={{ color: 'var(--text-muted)' }}><ChevronRight size={20} /></button>
        </div>

        <div className="calendar-grid">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
            <div key={day} className="cal-day-header">{day}</div>
          ))}
          
          {calendarDays.map((item, idx) => (
            <div key={idx} className="cal-cell">
              {item && (
                <div className={`cal-date-wrapper ${item.isToday ? 'today' : ''}`}>
                  <span className={`cal-date ${item.status === 'upcoming' ? 'upcoming' : ''}`}>
                    {item.day}
                  </span>
                  {item.status !== 'upcoming' && (
                    <span className={`cal-dot ${item.status}`} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="cal-legend">
          <div className="cal-legend-item">
            <span className="cal-dot delivered" style={{ position: 'static' }} /> Active
          </div>
          <div className="cal-legend-item">
            <span className="cal-dot absent" style={{ position: 'static' }} /> Missed
          </div>
          <div className="cal-legend-item">
            <span className="cal-dot upcoming" style={{ position: 'static', background: 'var(--border-light)' }} /> Upcoming
          </div>
        </div>
      </div>

      {/* ═══ ACTIVITY MODAL ═══ */}
      {showActivities && (
        <div className="modal-overlay" onClick={() => setShowActivities(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Activity History</h3>
              <button className="modal-close" onClick={() => setShowActivities(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {activityLog.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <div className="empty-state-icon" style={{ fontSize: '32px' }}>📝</div>
                  <div className="empty-state-desc">No activities recorded yet. Complete tasks or topics to see them here!</div>
                </div>
              ) : (
                <div className="activity-ladder">
                  {activityLog.slice(0, 15).map((log, idx) => {
                    const logDate = new Date(log.timestamp);
                    const timeStr = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    let icon = <CheckCircle size={14} />;
                    let iconBg = 'var(--green-50)';
                    let iconColor = 'var(--green-600)';
                    
                    if (log.type === 'topic') {
                      icon = <BookOpen size={14} />;
                      iconBg = 'var(--accent-purple-light)';
                      iconColor = 'var(--accent-purple)';
                    } else if (log.type === 'habit') {
                      icon = <Flame size={14} />;
                      iconBg = 'var(--accent-orange-light)';
                      iconColor = 'var(--accent-orange)';
                    }

                    return (
                      <div key={log.id} className="activity-item">
                        <div className="act-line" style={{ display: idx === activityLog.slice(0,15).length - 1 ? 'none' : 'block' }}></div>
                        <div className="act-icon-wrapper" style={{ background: iconBg, color: iconColor }}>
                          {icon}
                        </div>
                        <div className="act-content">
                          <div className="act-desc">{log.description}</div>
                          <div className="act-time">{log.date === todayKey ? 'Today' : log.date} • {timeStr}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
