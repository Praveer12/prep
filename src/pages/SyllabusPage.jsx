import { useState, useMemo } from 'react';
import { sscSyllabus, bankSyllabus } from '../data/syllabusData';
import { ChevronDown, Check, Calendar } from 'lucide-react';

export default function SyllabusPage({ examType, completedTopicsMap, onToggleTopic, deadline, onSetDeadline, addActivity }) {
  const [activeTier, setActiveTier] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState(deadline || '');

  const syllabus = examType === 'ssc' ? sscSyllabus : bankSyllabus;
  const tiers = Object.keys(syllabus);
  const currentTier = activeTier || tiers[0];

  // Calculate progress for each section
  const sectionProgress = useMemo(() => {
    const progress = {};
    const sections = syllabus[currentTier];
    Object.entries(sections).forEach(([sectionName, sectionData]) => {
      const total = sectionData.topics.length;
      const completed = sectionData.topics.filter(
        topic => completedTopicsMap[`${examType}-${currentTier}-${sectionName}-${topic}`]
      ).length;
      progress[sectionName] = { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    });
    return progress;
  }, [syllabus, currentTier, completedTopicsMap, examType]);

  // Overall tier progress
  const overallProgress = useMemo(() => {
    const vals = Object.values(sectionProgress);
    const totalAll = vals.reduce((s, v) => s + v.total, 0);
    const completedAll = vals.reduce((s, v) => s + v.completed, 0);
    return totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;
  }, [sectionProgress]);

  const toggleSection = (name) => {
    setOpenSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Days remaining
  const daysRemaining = deadline
    ? Math.max(0, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const getDeadlineColor = () => {
    if (!daysRemaining) return 'safe';
    if (daysRemaining <= 7) return 'urgent';
    if (daysRemaining <= 30) return 'warning';
    return 'safe';
  };

  const handleSaveDeadline = () => {
    onSetDeadline(deadlineInput);
    setShowDeadlineModal(false);
  };

  return (
    <div className="page-content page-enter">
      {/* Exam Toggle */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
          📚 {examType === 'ssc' ? 'SSC CGL' : 'IBPS PO'} Syllabus
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Track your preparation progress
        </p>
      </div>

      {/* Overall Progress */}
      <div className="glass-card-gradient" style={{ textAlign: 'center', marginBottom: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div className="progress-ring-wrapper">
            <svg width={80} height={80}>
              <defs>
                <linearGradient id="overall-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <circle className="progress-ring-bg" cx={40} cy={40} r={34} strokeWidth={6} />
              <circle
                className="progress-ring-fill"
                cx={40} cy={40} r={34}
                strokeWidth={6}
                stroke="url(#overall-grad)"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 - (overallProgress / 100) * 2 * Math.PI * 34}
              />
            </svg>
            <div className="progress-ring-text">
              <div className="progress-ring-percent text-gradient" style={{ fontSize: '16px' }}>{overallProgress}%</div>
            </div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{currentTier} Progress</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {Object.values(sectionProgress).reduce((s, v) => s + v.completed, 0)} / {Object.values(sectionProgress).reduce((s, v) => s + v.total, 0)} topics
            </div>
          </div>
        </div>
      </div>

      {/* Deadline Banner */}
      <div className="deadline-banner">
        <div className="deadline-info">
          <div className="deadline-label">Target Completion</div>
          {daysRemaining !== null ? (
            <div className={`deadline-days ${getDeadlineColor()}`}>
              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
            </div>
          ) : (
            <div className="deadline-days" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              No deadline set
            </div>
          )}
        </div>
        <button className="deadline-set-btn" onClick={() => setShowDeadlineModal(true)}>
          <Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          {deadline ? 'Edit' : 'Set'}
        </button>
      </div>

      {/* Tier Tabs */}
      <div className="syllabus-tier-tabs">
        {tiers.map(tier => (
          <button
            key={tier}
            className={`tier-tab ${currentTier === tier ? 'active' : ''}`}
            onClick={() => { setActiveTier(tier); setOpenSections({}); }}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Accordion Sections */}
      {Object.entries(syllabus[currentTier]).map(([sectionName, sectionData]) => {
        const isOpen = openSections[sectionName];
        const progress = sectionProgress[sectionName];
        return (
          <div className="accordion-section" key={sectionName}>
            <div className="accordion-header" onClick={() => toggleSection(sectionName)}>
              <div className="accordion-header-left">
                <div className="accordion-icon" style={{ background: sectionData.color }}>
                  {sectionData.icon}
                </div>
                <div>
                  <div className="accordion-title">{sectionName}</div>
                  <div className="accordion-count">
                    {progress.completed}/{progress.total} topics • {progress.percent}%
                  </div>
                </div>
              </div>
              <div className="accordion-progress">
                <div className="accordion-progress-fill" style={{ width: `${progress.percent}%` }} />
              </div>
              <ChevronDown size={18} className={`accordion-chevron ${isOpen ? 'open' : ''}`} />
            </div>
            <div className={`accordion-body ${isOpen ? 'open' : ''}`}>
              {sectionData.topics.map((topic) => {
                const topicKey = `${examType}-${currentTier}-${sectionName}-${topic}`;
                const isCompleted = !!completedTopicsMap[topicKey];
                return (
                  <div
                    key={topicKey}
                    className="topic-item"
                    onClick={() => {
                      if (!isCompleted) {
                        addActivity('topic', `Completed topic: ${topic}`);
                      }
                      onToggleTopic(topicKey);
                    }}
                  >
                    <div className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}>
                      <Check size={12} />
                    </div>
                    <span className={`topic-text ${isCompleted ? 'completed' : ''}`}>
                      {topic}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Deadline Modal */}
      {showDeadlineModal && (
        <div className="modal-overlay" onClick={() => setShowDeadlineModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title">📅 Set Deadline</h3>
            <div className="form-group">
              <label className="form-label">Target Completion Date</label>
              <input
                type="date"
                className="form-input"
                value={deadlineInput}
                onChange={e => setDeadlineInput(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <button className="btn-primary" onClick={handleSaveDeadline}>Save Deadline</button>
            {deadline && (
              <button
                className="btn-danger"
                style={{ marginTop: '8px' }}
                onClick={() => { onSetDeadline(''); setShowDeadlineModal(false); }}
              >
                Remove Deadline
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
