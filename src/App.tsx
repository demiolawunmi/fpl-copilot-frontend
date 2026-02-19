import './App.css'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import GWOverviewPage from './pages/GWOverviewPage';
import PlayersPage from './pages/PlayersPage';
import FixturesPage from './pages/FixturesPage';
import CommandCenterPage from './pages/CommandCenterPage';
import { useTeamId } from './context/TeamIdContext';
import { getEntry } from './api/fpl/fpl';
import { useEffect, useState } from 'react';

function App() {
  const { teamId } = useTeamId();
  const [teamName, setTeamName] = useState<string | null>(null);

  // Fetch team name on app load (if logged in)
  useEffect(() => {
    if (teamId) {
      getEntry(teamId).then(entry => setTeamName(entry.name));
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
          <Route path="/command-center" element={<CommandCenterPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/fixtures" element={<FixturesPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
