import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PatientProfile from './pages/PatientProfile';
import MemoryLibrary from './pages/MemoryLibrary';
import Activities from './pages/Activities';
import MemoryJourney from './pages/MemoryJourney';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import MemoryFinder from './pages/MemoryFinder';
import { initializeDemoData } from './utils/storage';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

function App() {
  const [isLanding, setIsLanding] = useState(true);

  useEffect(() => {
    // Initialize demo data on first load
    initializeDemoData();
  }, []);

  const enterDemo = async () => {
    await initializeDemoData();
    setIsLanding(false);
  };

  if (isLanding) {
    return (
      <LanguageProvider>
        <LandingPage onEnterDemo={enterDemo} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout onReturnHome={() => setIsLanding(true)} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="memory-library" element={<MemoryLibrary />} />
            <Route path="activities" element={<Activities />} />
            <Route path="memory-finder" element={<MemoryFinder />} />
            <Route path="journey" element={<MemoryJourney />} />
            <Route path="insights" element={<Insights />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;