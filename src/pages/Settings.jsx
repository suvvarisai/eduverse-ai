import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Palette, Monitor, Globe, Zap, Moon, Sun, Check, ChevronRight, Volume2, Eye, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/PageHeader';

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'learning', label: 'Learning', icon: Zap },
];

const Toggle = ({ value, onChange, color = '#6366f1' }) => (
  <button
    onClick={() => onChange(!value)}
    className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300"
    style={{ background: value ? color : 'rgba(255,255,255,0.1)' }}
  >
    <motion.div
      animate={{ x: value ? 20 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
    />
  </button>
);

const Select = ({ value, onChange, options, isDark }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`px-3 py-1.5 rounded-xl text-sm border outline-none transition-all ${isDark ? 'bg-white/[0.05] border-white/[0.1] text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}
  >
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({ name: 'Alex Kumar', email: 'alex@eduverse.ai', username: 'alex_kumar', bio: 'Lifelong learner. Frontend dev by day, AI explorer by night. 🚀', location: 'Mumbai, India', website: 'alexkumar.dev' });
  const [notifs, setNotifs] = useState({ courseUpdates: true, quizReminders: true, achievements: true, weeklyReport: false, emailDigest: true, pushNotifs: false });
  const [learning, setLearning] = useState({ dailyGoal: '1 hour', difficulty: 'Adaptive', language: 'English', autoplay: true, subtitles: false, speed: '1x' });
  const [privacy, setPrivacy] = useState({ publicProfile: true, showProgress: true, showActivity: false, dataCollection: true });

  const cardBg = isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-white border-slate-200 shadow-sm';
  const subText = isDark ? 'text-white/45' : 'text-slate-500';
  const text = isDark ? 'text-white' : 'text-slate-900';
  const inputBg = isDark ? 'bg-white/[0.05] border-white/[0.1] text-white placeholder-white/30 focus:border-primary-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary-400';
  const divider = isDark ? 'border-white/[0.06]' : 'border-slate-100';

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const SettingRow = ({ icon: Icon, label, desc, color = '#6366f1', children }) => (
    <div className={`flex items-center justify-between py-4 border-b last:border-0 ${divider}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '22' }}><Icon size={15} style={{ color }} /></div>}
        <div className="min-w-0">
          <p className={`text-sm font-medium ${text}`}>{label}</p>
          {desc && <p className={`text-xs mt-0.5 ${subText}`}>{desc}</p>}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Avatar */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <h3 className={`text-sm font-semibold mb-4 ${text}`}>Profile Picture</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold glow-primary">AK</div>
                <div>
                  <button className="text-sm font-medium px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-violet-600 text-white hover:opacity-90 transition-all mr-2">Upload Photo</button>
                  <button className={`text-sm font-medium px-4 py-2 rounded-xl border transition-all ${isDark ? 'border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Remove</button>
                </div>
              </div>
            </div>
            {/* Fields */}
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <h3 className={`text-sm font-semibold mb-4 ${text}`}>Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'Alex Kumar' },
                  { label: 'Username', key: 'username', placeholder: 'alex_kumar' },
                  { label: 'Email', key: 'email', placeholder: 'alex@eduverse.ai' },
                  { label: 'Location', key: 'location', placeholder: 'Mumbai, India' },
                  { label: 'Website', key: 'website', placeholder: 'alexkumar.dev' },
                ].map(f => (
                  <div key={f.key}>
                    <label className={`block text-xs font-medium mb-1.5 ${subText}`}>{f.label}</label>
                    <input
                      type="text"
                      value={profile[f.key]}
                      onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all ${inputBg}`}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className={`block text-xs font-medium mb-1.5 ${subText}`}>Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all resize-none ${inputBg}`}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <h3 className={`text-sm font-semibold mb-4 ${text}`}>Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Dark Mode', icon: Moon, active: isDark },
                  { label: 'Light Mode', icon: Sun, active: !isDark },
                ].map(t => (
                  <button key={t.label} onClick={toggleTheme}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${t.active ? 'border-primary-500 bg-primary-500/10' : isDark ? 'border-white/[0.07] hover:border-white/[0.14] bg-white/[0.02]' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}>
                    <t.icon size={22} className={t.active ? 'text-primary-400' : isDark ? 'text-white/40' : 'text-slate-400'} />
                    <span className={`text-sm font-medium ${t.active ? 'text-primary-400' : subText}`}>{t.label}</span>
                    {t.active && <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />}
                  </button>
                ))}
              </div>
            </div>
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <h3 className={`text-sm font-semibold mb-2 ${text}`}>Accent Color</h3>
              <p className={`text-xs mb-4 ${subText}`}>Choose your primary accent color</p>
              <div className="flex gap-3 flex-wrap">
                {['#6366f1', '#22d3ee', '#a78bfa', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map(c => (
                  <button key={c} className={`w-8 h-8 rounded-full transition-all hover:scale-110 border-2 ${c === '#6366f1' ? 'border-white' : 'border-transparent'}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <h3 className={`text-sm font-semibold mb-4 ${text}`}>Display</h3>
              <SettingRow icon={Monitor} label="Compact Mode" desc="Reduce spacing and padding" color="#6366f1">
                <Toggle value={false} onChange={() => {}} />
              </SettingRow>
              <SettingRow icon={Eye} label="Reduced Motion" desc="Minimize animations" color="#22d3ee">
                <Toggle value={false} onChange={() => {}} color="#22d3ee" />
              </SettingRow>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <h3 className={`text-sm font-semibold mb-4 ${text}`}>Notification Preferences</h3>
            <SettingRow icon={Bell} label="Course Updates" desc="New lessons and content added" color="#6366f1">
              <Toggle value={notifs.courseUpdates} onChange={v => setNotifs(n => ({ ...n, courseUpdates: v }))} />
            </SettingRow>
            <SettingRow icon={Zap} label="Quiz Reminders" desc="Daily practice nudges" color="#f59e0b">
              <Toggle value={notifs.quizReminders} onChange={v => setNotifs(n => ({ ...n, quizReminders: v }))} color="#f59e0b" />
            </SettingRow>
            <SettingRow icon={Check} label="Achievements" desc="Badges, streaks, and milestones" color="#10b981">
              <Toggle value={notifs.achievements} onChange={v => setNotifs(n => ({ ...n, achievements: v }))} color="#10b981" />
            </SettingRow>
            <SettingRow icon={Globe} label="Weekly Report" desc="Summary of your learning activity" color="#22d3ee">
              <Toggle value={notifs.weeklyReport} onChange={v => setNotifs(n => ({ ...n, weeklyReport: v }))} color="#22d3ee" />
            </SettingRow>
            <SettingRow icon={Download} label="Email Digest" desc="Weekly learning digest via email" color="#a78bfa">
              <Toggle value={notifs.emailDigest} onChange={v => setNotifs(n => ({ ...n, emailDigest: v }))} color="#a78bfa" />
            </SettingRow>
            <SettingRow icon={Volume2} label="Push Notifications" desc="Browser push alerts" color="#ef4444">
              <Toggle value={notifs.pushNotifs} onChange={v => setNotifs(n => ({ ...n, pushNotifs: v }))} color="#ef4444" />
            </SettingRow>
          </div>
        );

      case 'privacy':
        return (
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <h3 className={`text-sm font-semibold mb-4 ${text}`}>Privacy Settings</h3>
            <SettingRow icon={User} label="Public Profile" desc="Anyone can view your profile and stats" color="#6366f1">
              <Toggle value={privacy.publicProfile} onChange={v => setPrivacy(p => ({ ...p, publicProfile: v }))} />
            </SettingRow>
            <SettingRow icon={Eye} label="Show Progress" desc="Display learning progress on profile" color="#22d3ee">
              <Toggle value={privacy.showProgress} onChange={v => setPrivacy(p => ({ ...p, showProgress: v }))} color="#22d3ee" />
            </SettingRow>
            <SettingRow icon={Bell} label="Activity Feed" desc="Let others see your recent activity" color="#a78bfa">
              <Toggle value={privacy.showActivity} onChange={v => setPrivacy(p => ({ ...p, showActivity: v }))} color="#a78bfa" />
            </SettingRow>
            <SettingRow icon={Shield} label="Usage Analytics" desc="Help improve EduVerse with anonymous data" color="#f59e0b">
              <Toggle value={privacy.dataCollection} onChange={v => setPrivacy(p => ({ ...p, dataCollection: v }))} color="#f59e0b" />
            </SettingRow>
          </div>
        );

      case 'learning':
        return (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <h3 className={`text-sm font-semibold mb-4 ${text}`}>Learning Preferences</h3>
              <SettingRow icon={Zap} label="Daily Goal" desc="How much you aim to learn each day" color="#6366f1">
                <Select value={learning.dailyGoal} onChange={v => setLearning(l => ({ ...l, dailyGoal: v }))} options={['30 min', '1 hour', '2 hours', '3+ hours']} isDark={isDark} />
              </SettingRow>
              <SettingRow icon={Monitor} label="Difficulty" desc="Course recommendation difficulty" color="#22d3ee">
                <Select value={learning.difficulty} onChange={v => setLearning(l => ({ ...l, difficulty: v }))} options={['Beginner', 'Intermediate', 'Advanced', 'Adaptive']} isDark={isDark} />
              </SettingRow>
              <SettingRow icon={Globe} label="Language" desc="Preferred content language" color="#a78bfa">
                <Select value={learning.language} onChange={v => setLearning(l => ({ ...l, language: v }))} options={['English', 'Hindi', 'Spanish', 'French']} isDark={isDark} />
              </SettingRow>
              <SettingRow icon={Volume2} label="Video Speed" desc="Default playback speed" color="#f59e0b">
                <Select value={learning.speed} onChange={v => setLearning(l => ({ ...l, speed: v }))} options={['0.75x', '1x', '1.25x', '1.5x', '2x']} isDark={isDark} />
              </SettingRow>
              <SettingRow icon={ChevronRight} label="Autoplay" desc="Automatically play next lesson" color="#10b981">
                <Toggle value={learning.autoplay} onChange={v => setLearning(l => ({ ...l, autoplay: v }))} color="#10b981" />
              </SettingRow>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account, preferences, and privacy">
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.96 }}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-primary-500 to-violet-600 text-white hover:opacity-90 glow-primary'}`}
        >
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Check size={15} /> Saved!
              </motion.span>
            ) : (
              <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Save Changes
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </PageHeader>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className={`lg:w-52 flex-shrink-0 rounded-2xl border p-2 h-fit ${cardBg}`}>
          {settingsTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-primary-500/15 text-primary-400' : isDark ? 'text-white/50 hover:text-white hover:bg-white/[0.05]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
