import { useState, useMemo, useEffect } from 'react';
import { Home, BookOpen, ClipboardList, Wrench, User } from 'lucide-react';
import { useLocalStorage, getTodayKey } from './hooks/useApp';
import { sscSyllabus, bankSyllabus, defaultHabits } from './data/syllabusData';
import HomePage from './pages/HomePage';
import SyllabusPage from './pages/SyllabusPage';
import PlannerPage from './pages/PlannerPage';
import ToolsPage from './pages/ToolsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import { supabase } from './supabaseClient';
import { useSupabaseData } from './hooks/useSupabaseData';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  const [session, setSession] = useState(null);
  const [activePage, setActivePage] = useState('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ═══ PERSISTENT STATE (Supabase Sync) ═══
  const {
    isLoading,
    examType, setExamType,
    tasks, setTasks,
    completedTopicsMap, setCompletedTopicsMap,
    deadline, setDeadline,
    habits, setHabits,
    habitLog, setHabitLog,
    questions, setQuestions,
    notes, setNotes,
    examDate, setExamDate,
    firstActiveDate, setFirstActiveDate,
    lastActiveDate, setLastActiveDate,
    streak, setStreak,
    activityLog, setActivityLog,
    profilePic, setProfilePic,
    userName, setUserName
  } = useSupabaseData(session);

  // ═══ ACTIVITY TRACKER ═══
  const addActivity = (type, description) => {
    const today = getTodayKey();
    const newActivity = {
      id: Date.now().toString(),
      type,
      description,
      date: today,
      timestamp: Date.now()
    };
    setActivityLog(prev => [newActivity, ...prev]);
  };

  // ═══ STREAK LOGIC ═══
  useEffect(() => {
    const today = getTodayKey();
    if (lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split('T')[0];

      if (lastActiveDate === yesterdayKey) {
        setStreak(prev => prev + 1);
      } else if (lastActiveDate && lastActiveDate !== today) {
        setStreak(1);
      } else if (!lastActiveDate) {
        setStreak(1);
      }
      setLastActiveDate(today);
      if (!firstActiveDate) {
        setFirstActiveDate(today);
      }
    }
  }, [lastActiveDate, firstActiveDate, setLastActiveDate, setFirstActiveDate, setStreak]);

  // ═══ TOPIC TOGGLE ═══
  const toggleTopic = (topicKey) => {
    setCompletedTopicsMap(prev => ({
      ...prev,
      [topicKey]: !prev[topicKey],
    }));
  };

  // ═══ CALCULATE PROGRESS ═══
  const { completedTopicsCount, totalTopicsCount } = useMemo(() => {
    let total = 0;
    let completed = 0;
    const syllabus = examType === 'ssc' ? sscSyllabus : bankSyllabus;

    Object.entries(syllabus).forEach(([tierName, tier]) => {
      Object.entries(tier).forEach(([sectionName, section]) => {
        section.topics.forEach(topic => {
          total++;
          const key = `${examType}-${tierName}-${sectionName}-${topic}`;
          if (completedTopicsMap[key]) completed++;
        });
      });
    });

    return { completedTopicsCount: completed, totalTopicsCount: total };
  }, [examType, completedTopicsMap]);

  // ═══ RESET ═══
  const resetAllData = () => {
    setTasks([]);
    setCompletedTopicsMap({});
    setDeadline('');
    setHabits(defaultHabits);
    setHabitLog({});
    setQuestions([]);
    setNotes([]);
    setExamDate('');
    setStreak(0);
    setLastActiveDate('');
    setFirstActiveDate('');
    setActivityLog([]);
    setProfilePic(null);
    setUserName('Aspirant');
  };

  // ═══ NAV ITEMS ═══
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'planner', label: 'Planner', icon: ClipboardList },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (!session) {
    return (
      <>
        <AuthPage />
        <InstallPrompt />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-500)' }}>
          Loading your data...
        </div>
        <InstallPrompt />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* ═══ PAGES ═══ */}
      {activePage === 'home' && (
        <HomePage
          tasks={tasks}
          completedTopics={completedTopicsCount}
          totalTopics={totalTopicsCount}
          examType={examType}
          examDate={examDate}
          streak={streak}
          firstActiveDate={firstActiveDate}
          lastActiveDate={lastActiveDate}
          activityLog={activityLog}
          profilePic={profilePic}
          userName={userName}
          onNavigate={setActivePage}
        />
      )}

      {activePage === 'syllabus' && (
        <SyllabusPage
          examType={examType === 'both' ? 'ssc' : examType}
          completedTopicsMap={completedTopicsMap}
          onToggleTopic={toggleTopic}
          deadline={deadline}
          onSetDeadline={setDeadline}
          addActivity={addActivity}
        />
      )}

      {activePage === 'planner' && (
        <PlannerPage
          tasks={tasks}
          setTasks={setTasks}
          habits={habits}
          setHabits={setHabits}
          habitLog={habitLog}
          setHabitLog={setHabitLog}
          addActivity={addActivity}
        />
      )}

      {activePage === 'tools' && (
        <ToolsPage
          questions={questions}
          setQuestions={setQuestions}
          notes={notes}
          setNotes={setNotes}
        />
      )}

      {activePage === 'profile' && (
        <ProfilePage
          examType={examType}
          setExamType={setExamType}
          tasks={tasks}
          completedTopicsMap={completedTopicsMap}
          streak={streak}
          habitLog={habitLog}
          examDate={examDate}
          setExamDate={setExamDate}
          profilePic={profilePic}
          setProfilePic={setProfilePic}
          userName={userName}
          setUserName={setUserName}
          onResetData={resetAllData}
        />
      )}

      {/* ═══ BOTTOM NAVIGATION ═══ */}
      <nav className="bottom-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* ═══ PWA INSTALL BANNER ═══ */}
      <InstallPrompt />
    </div>
  );
}
