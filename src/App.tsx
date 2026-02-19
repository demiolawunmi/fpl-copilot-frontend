import './App.css'
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import GWOverviewPage from './pages/GWOverviewPage';
import PlayersPage from './pages/PlayersPage';
import FixturesPage from './pages/FixturesPage';
import { useTeamId } from './context/TeamIdContext';
import { getEntry } from './api/fpl/client';

function App() {
  const { teamId } = useTeamId();
  const [teamName, setTeamName] = useState<string | null>(null);

  // Fetch team name when teamId changes
  useEffect(() => {
    if (teamId) {
      getEntry(parseInt(teamId))
        .then(entry => setTeamName(entry.name))
        .catch(err => {
          console.error('Failed to fetch team name:', err);
          setTeamName(null);
        });
    } else {
      setTeamName(null);
    }
  }, [teamId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Only show navbar when logged in */}
      {teamId && <Navbar teamName={teamName} />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/gw-overview" element={<GWOverviewPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
