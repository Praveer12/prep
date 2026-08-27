import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { defaultHabits } from '../data/syllabusData';

export function useSupabaseData(session) {
  const [isLoading, setIsLoading] = useState(true);

  const [examType, setExamTypeState] = useState('ssc');
  const [deadline, setDeadlineState] = useState('');
  const [examDate, setExamDateState] = useState('');
  const [firstActiveDate, setFirstActiveDateState] = useState('');
  const [lastActiveDate, setLastActiveDateState] = useState('');
  const [streak, setStreakState] = useState(0);
  const [profilePic, setProfilePicState] = useState(null);
  const [userName, setUserNameState] = useState('Aspirant');

  const [tasks, setTasksState] = useState([]);
  const [completedTopicsMap, setCompletedTopicsMapState] = useState({});
  const [habits, setHabitsState] = useState(defaultHabits);
  const [habitLog, setHabitLogState] = useState({});
  const [questions, setQuestionsState] = useState([]);
  const [notes, setNotesState] = useState([]);
  const [activityLog, setActivityLogState] = useState([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      const userId = session.user.id;
      try {
        // Fetch Profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profile) {
          setExamTypeState(profile.exam_type || 'ssc');
          setUserNameState(profile.user_name || 'Aspirant');
          setProfilePicState(profile.profile_pic || null);
          setExamDateState(profile.exam_date || '');
          setStreakState(profile.streak || 0);
          setFirstActiveDateState(profile.first_active_date || '');
          setLastActiveDateState(profile.last_active_date || '');
          setDeadlineState(profile.deadline || '');
        } else {
          // Create profile if not exists
          await supabase.from('profiles').insert([{ id: userId, user_name: 'Aspirant', exam_type: 'ssc', streak: 0 }]);
        }

        // Fetch Tasks
        const { data: tasksData } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (tasksData) setTasksState(tasksData);

        // Fetch Habits
        const { data: habitsData } = await supabase.from('habits').select('*').eq('user_id', userId);
        if (habitsData && habitsData.length > 0) setHabitsState(habitsData);

        // Fetch Habit Logs
        const { data: hLogs } = await supabase.from('habit_logs').select('*').eq('user_id', userId);
        if (hLogs) {
          const formattedLogs = {};
          hLogs.forEach(log => {
            if (!formattedLogs[log.date]) formattedLogs[log.date] = {};
            formattedLogs[log.date][log.habit_id] = log.completed;
          });
          setHabitLogState(formattedLogs);
        }

        // Fetch Completed Topics
        const { data: topicsData } = await supabase.from('completed_topics').select('*').eq('user_id', userId);
        if (topicsData) {
          const topicsMap = {};
          topicsData.forEach(t => { topicsMap[t.topic_key] = true; });
          setCompletedTopicsMapState(topicsMap);
        }

        // Fetch Activity Logs
        const { data: aLogs } = await supabase.from('activity_logs').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
        if (aLogs) {
          setActivityLogState(aLogs.map(a => ({
            id: a.id,
            type: a.type,
            description: a.description,
            date: a.date,
            timestamp: new Date(a.timestamp).getTime()
          })));
        }

        // Fetch Notes & Questions
        const { data: notesData } = await supabase.from('notes').select('*').eq('user_id', userId);
        if (notesData) {
          setNotesState(notesData.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            category: 'General', // Not in DB
            createdAt: n.date,
            updatedAt: n.date
          })));
        }

        const { data: qsData } = await supabase.from('saved_questions').select('*').eq('user_id', userId);
        if (qsData) {
          setQuestionsState(qsData.map(q => ({
            id: q.id,
            text: q.question_text,
            answer: q.answer_text,
            category: q.category || 'General',
            starred: false // Not in DB
          })));
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const updateProfile = async (updates) => {
    if (!session?.user?.id) return;
    await supabase.from('profiles').update(updates).eq('id', session.user.id);
  };

  const setExamType = (val) => {
    const newVal = typeof val === 'function' ? val(examType) : val;
    setExamTypeState(newVal);
    updateProfile({ exam_type: newVal });
  };
  const setDeadline = (val) => {
    const newVal = typeof val === 'function' ? val(deadline) : val;
    setDeadlineState(newVal);
    updateProfile({ deadline: newVal });
  };
  const setExamDate = (val) => {
    const newVal = typeof val === 'function' ? val(examDate) : val;
    setExamDateState(newVal);
    updateProfile({ exam_date: newVal });
  };
  const setFirstActiveDate = (val) => {
    const newVal = typeof val === 'function' ? val(firstActiveDate) : val;
    setFirstActiveDateState(newVal);
    updateProfile({ first_active_date: newVal });
  };
  const setLastActiveDate = (val) => {
    const newVal = typeof val === 'function' ? val(lastActiveDate) : val;
    setLastActiveDateState(newVal);
    updateProfile({ last_active_date: newVal });
  };
  const setStreak = (val) => {
    const newVal = typeof val === 'function' ? val(streak) : val;
    setStreakState(newVal);
    updateProfile({ streak: newVal });
  };
  const setProfilePic = (val) => {
    const newVal = typeof val === 'function' ? val(profilePic) : val;
    setProfilePicState(newVal);
    updateProfile({ profile_pic: newVal });
  };
  const setUserName = (val) => {
    const newVal = typeof val === 'function' ? val(userName) : val;
    setUserNameState(newVal);
    updateProfile({ user_name: newVal });
  };

  // Generic updater for array state and DB
  const setTasks = async (val) => {
    const newTasks = typeof val === 'function' ? val(tasks) : val;
    setTasksState(newTasks);
    if (!session?.user?.id) return;
    await supabase.from('tasks').delete().eq('user_id', session.user.id);
    if (newTasks.length > 0) {
      const inserts = newTasks.map(t => ({ 
        id: t.id,
        user_id: session.user.id,
        title: t.title,
        priority: t.priority,
        date: t.date,
        completed: t.completed
      }));
      await supabase.from('tasks').insert(inserts);
    }
  };

  const setHabits = async (val) => {
    const newHabits = typeof val === 'function' ? val(habits) : val;
    setHabitsState(newHabits);
    if (!session?.user?.id) return;
    await supabase.from('habits').delete().eq('user_id', session.user.id);
    if (newHabits.length > 0) {
      const inserts = newHabits.map(h => ({ 
        id: h.id,
        user_id: session.user.id,
        name: h.name,
        icon: h.icon
      }));
      await supabase.from('habits').insert(inserts);
    }
  };

  const setQuestions = async (val) => {
    const newVal = typeof val === 'function' ? val(questions) : val;
    setQuestionsState(newVal);
    if (!session?.user?.id) return;
    await supabase.from('saved_questions').delete().eq('user_id', session.user.id);
    if (newVal.length > 0) {
      const inserts = newVal.map(q => ({ 
        id: q.id,
        user_id: session.user.id,
        question_text: q.text,
        answer_text: q.answer,
        category: q.category
      }));
      await supabase.from('saved_questions').insert(inserts);
    }
  };

  const setNotes = async (val) => {
    const newVal = typeof val === 'function' ? val(notes) : val;
    setNotesState(newVal);
    if (!session?.user?.id) return;
    await supabase.from('notes').delete().eq('user_id', session.user.id);
    if (newVal.length > 0) {
      const inserts = newVal.map(n => ({ 
        id: n.id,
        user_id: session.user.id,
        title: n.title,
        content: n.content,
        date: n.createdAt
      }));
      await supabase.from('notes').insert(inserts);
    }
  };

  const setActivityLog = async (val) => {
    const newVal = typeof val === 'function' ? val(activityLog) : val;
    setActivityLogState(newVal);
    if (!session?.user?.id) return;
    await supabase.from('activity_logs').delete().eq('user_id', session.user.id);
    if (newVal.length > 0) {
      const inserts = newVal.map(a => ({ 
        id: a.id,
        user_id: session.user.id,
        type: a.type,
        description: a.description,
        date: a.date,
        timestamp: new Date(a.timestamp).toISOString()
      }));
      await supabase.from('activity_logs').insert(inserts);
    }
  };

  const setCompletedTopicsMap = async (val) => {
    const newVal = typeof val === 'function' ? val(completedTopicsMap) : val;
    setCompletedTopicsMapState(newVal);
    if (!session?.user?.id) return;
    await supabase.from('completed_topics').delete().eq('user_id', session.user.id);
    const keys = Object.keys(newVal).filter(k => newVal[k]);
    if (keys.length > 0) {
      const inserts = keys.map(k => ({ topic_key: k, user_id: session.user.id }));
      await supabase.from('completed_topics').insert(inserts);
    }
  };

  const setHabitLog = async (val) => {
    const newVal = typeof val === 'function' ? val(habitLog) : val;
    setHabitLogState(newVal);
    if (!session?.user?.id) return;
    await supabase.from('habit_logs').delete().eq('user_id', session.user.id);
    const inserts = [];
    Object.entries(newVal).forEach(([date, habitsMap]) => {
      Object.entries(habitsMap).forEach(([habitId, completed]) => {
        inserts.push({ date, habit_id: habitId, completed, user_id: session.user.id });
      });
    });
    if (inserts.length > 0) {
      await supabase.from('habit_logs').insert(inserts);
    }
  };

  return {
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
  };
}
