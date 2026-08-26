import { useState, useEffect, useCallback } from 'react';

// Generic localStorage hook
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [key, value]);

  return [value, setValue];
}

// Clock hook
export function useClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const hoursStr = h12.toString().padStart(2, '0');

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${days[time.getDay()]}, ${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}`;

  return { hoursStr, minutes, seconds, ampm, dateStr, hours };
}

// Stopwatch hook
export function useStopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState([]);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const start = useCallback(() => {
    setStartTime(Date.now() - elapsedTime);
    setIsRunning(true);
  }, [elapsedTime]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
    setStartTime(null);
  }, []);

  const lap = useCallback(() => {
    setLaps(prev => [elapsedTime, ...prev]);
  }, [elapsedTime]);

  const formatTime = useCallback((ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    const millis = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return { hrs, mins, secs, millis };
  }, []);

  return { isRunning, elapsedTime, laps, start, pause, reset, lap, formatTime };
}

// Pomodoro hook
export function usePomodoro() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const totalTime = isBreak ? 5 * 60 : 25 * 60;

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (!isBreak) {
        setSessions(prev => prev + 1);
        setIsBreak(true);
        setTimeLeft(5 * 60);
      } else {
        setIsBreak(false);
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak]);

  const toggle = useCallback(() => setIsRunning(prev => !prev), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  }, []);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return { isRunning, isBreak, sessions, mins, secs, progress, toggle, reset, totalTime, timeLeft };
}

// Get greeting based on time
export function getGreeting(hours) {
  if (hours < 12) return 'Good Morning';
  if (hours < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Get today's date key
export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

// Format date for display
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
