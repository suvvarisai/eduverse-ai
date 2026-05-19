import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import Quiz from './pages/Quiz';
import Settings from './pages/Settings';
import AiAssistant from './pages/AiAssistant';
import BiologyLab from './pages/BiologyLab';
import PhysicsLab from './pages/PhysicsLab';
import CsLab from './pages/CsLab';
import MathLab from './pages/MathLab';
import ChemistryLab from './pages/ChemistryLab';
import AnatomyLab from './pages/AnatomyLab';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020314] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wider opacity-60">Syncing Quest States...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AuthProvider>
          <ProgressProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />

                {/* Protected App pages with sidebar + navbar */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/modules" element={<Modules />} />
                  <Route path="/modules/biology" element={<BiologyLab />} />
                  <Route path="/modules/physics" element={<PhysicsLab />} />
                  <Route path="/modules/cs" element={<CsLab />} />
                  <Route path="/modules/math" element={<MathLab />} />
                  <Route path="/modules/chemistry" element={<ChemistryLab />} />
                  <Route path="/modules/anatomy" element={<AnatomyLab />} />
                  <Route path="/ai-assistant" element={<AiAssistant />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/settings" element={<Settings />} />
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ProgressProvider>
        </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
