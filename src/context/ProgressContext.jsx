import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const ProgressContext = createContext();

const defaultProgress = {
  totalXp: 1200,
  level: 1,
  completedModules: [],
  quizScores: {
    'biology': 0,
    'physics': 0,
    'cs': 0,
    '1': 80, // javascript mock
    '2': 0,
    '3': 100, // python mock
    '4': 0,
    '5': 0
  },
  quizAttempts: {
    '1': 2,
    '3': 4
  },
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  badges: ['first-step'],
  studyActivity: [
    { day: 'Mon', hours: 1.5, sessions: 2 },
    { day: 'Tue', hours: 2.2, sessions: 3 },
    { day: 'Wed', hours: 3.0, sessions: 4 },
    { day: 'Thu', hours: 1.8, sessions: 2 },
    { day: 'Fri', hours: 4.2, sessions: 5 },
    { day: 'Sat', hours: 1.2, sessions: 1 },
    { day: 'Sun', hours: 0.8, sessions: 1 },
  ],
  subjectPerformance: [
    { subject: 'React', score: 80 },
    { subject: 'JS Basics', score: 90 },
    { subject: 'TypeScript', score: 65 },
    { subject: 'AI/ML', score: 75 },
    { subject: 'UI/UX', score: 85 },
    { subject: 'Node.js', score: 70 },
  ]
};

export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(defaultProgress);
  const [loading, setLoading] = useState(true);

  // Load progress from Firestore or LocalStorage
  const loadProgress = async (uid) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProgress(data.progress || defaultProgress);
      } else {
        // Create initial record in Firestore
        await setDoc(docRef, { progress: defaultProgress }, { merge: true });
        setProgress(defaultProgress);
      }
    } catch (err) {
      console.warn("Firestore progress load failed, falling back to LocalStorage:", err);
      const local = localStorage.getItem(`progress_${uid}`);
      if (local) {
        try {
          setProgress(JSON.parse(local));
        } catch (_) {
          setProgress(defaultProgress);
        }
      } else {
        setProgress(defaultProgress);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync state changes with backend & cache locally
  const saveProgressState = async (newProgress, uid = user?.uid) => {
    setProgress(newProgress);
    if (!uid) return;

    // Local Storage caching
    localStorage.setItem(`progress_${uid}`, JSON.stringify(newProgress));

    // Firestore saving
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, { progress: newProgress }, { merge: true });
    } catch (err) {
      console.warn("Failed to sync progress with Firestore:", err);
    }
  };

  // Trigger loading state on login
  useEffect(() => {
    if (user) {
      loadProgress(user.uid);
    } else {
      setProgress(defaultProgress);
      setLoading(false);
    }
  }, [user]);

  // Complete a learning module
  const completeModule = async (moduleId, xpEarned = 150) => {
    if (!progress) return;
    if (progress.completedModules.includes(moduleId)) return;

    const newCompleted = [...progress.completedModules, moduleId];
    const newXp = progress.totalXp + xpEarned;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const newBadges = [...progress.badges];

    // Badge Check: first-step
    if (!newBadges.includes('first-step')) {
      newBadges.push('first-step');
    }

    // Badge Check: code-warrior (completed 3 modules)
    if (newCompleted.length >= 3 && !newBadges.includes('code-warrior')) {
      newBadges.push('code-warrior');
    }

    const updated = {
      ...progress,
      completedModules: newCompleted,
      totalXp: newXp,
      level: newLevel,
      badges: newBadges
    };

    await saveProgressState(updated);
  };

  // Save quiz score
  const saveQuizScore = async (quizId, scorePct, xpEarned = 100) => {
    if (!progress) return;

    const currentBest = progress.quizScores[quizId] || 0;
    const attempts = (progress.quizAttempts[quizId] || 0) + 1;

    const newScores = {
      ...progress.quizScores,
      [quizId]: Math.max(currentBest, scorePct)
    };

    const newAttempts = {
      ...progress.quizAttempts,
      [quizId]: attempts
    };

    const newBadges = [...progress.badges];

    // Badge check: speed-demon (scored 100%)
    if (scorePct === 100 && !newBadges.includes('speed-demon')) {
      newBadges.push('speed-demon');
    }

    // Badge check: brainiac (scored >= 90%)
    if (scorePct >= 90 && !newBadges.includes('brainiac')) {
      newBadges.push('brainiac');
    }

    // Badge Check: first-step
    if (!newBadges.includes('first-step')) {
      newBadges.push('first-step');
    }

    // Update study hours logged
    const newStudy = progress.studyActivity.map(dayLog => {
      const todayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });
      if (dayLog.day === todayName) {
        return {
          ...dayLog,
          hours: dayLog.hours + 0.3,
          sessions: dayLog.sessions + 1
        };
      }
      return dayLog;
    });

    const newXp = progress.totalXp + xpEarned;
    const newLevel = Math.floor(newXp / 1000) + 1;

    // Check subjects metrics mapping updates (for recharts radar)
    const newSubjects = progress.subjectPerformance.map(sub => {
      // Standard mapping: React -> React hooks / Frontend quizzes
      if (quizId === '2' && sub.subject === 'React') {
        return { ...sub, score: Math.max(sub.score, scorePct) };
      }
      if (quizId === '1' && sub.subject === 'JS Basics') {
        return { ...sub, score: Math.max(sub.score, scorePct) };
      }
      if (quizId === '3' && sub.subject === 'AI/ML') {
        return { ...sub, score: Math.max(sub.score, scorePct) };
      }
      return sub;
    });

    const updated = {
      ...progress,
      quizScores: newScores,
      quizAttempts: newAttempts,
      studyActivity: newStudy,
      totalXp: newXp,
      level: newLevel,
      badges: newBadges,
      subjectPerformance: newSubjects
    };

    await saveProgressState(updated);
  };

  // Record daily study session
  const recordStudyHours = async (hours = 0.5) => {
    if (!progress) return;

    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const newStudy = progress.studyActivity.map(dayLog => {
      if (dayLog.day === todayName) {
        return {
          ...dayLog,
          hours: dayLog.hours + hours,
          sessions: dayLog.sessions + 1
        };
      }
      return dayLog;
    });

    const updated = {
      ...progress,
      studyActivity: newStudy
    };

    await saveProgressState(updated);
  };

  // Update streak logic on load
  const verifyStreak = async (uid) => {
    if (!progress) return;
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (progress.lastActiveDate === todayStr) return; // already active today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = progress.streak;
    if (progress.lastActiveDate === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1; // streak reset
    }

    const newBadges = [...progress.badges];
    // Badge Check: daily-devotee (3-day streak)
    if (newStreak >= 3 && !newBadges.includes('daily-devotee')) {
      newBadges.push('daily-devotee');
    }

    const updated = {
      ...progress,
      streak: newStreak,
      lastActiveDate: todayStr,
      badges: newBadges
    };

    await saveProgressState(updated, uid);
  };

  // Trigger streak check on user login
  useEffect(() => {
    if (user && progress) {
      verifyStreak(user.uid);
    }
  }, [user, loading]);

  return (
    <ProgressContext.Provider value={{ progress, loading, completeModule, saveQuizScore, recordStudyHours }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
