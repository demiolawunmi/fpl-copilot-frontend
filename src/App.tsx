import './App.css'
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import GWOverviewPage from './pages/GWOverviewPage';
import PlayersPage from './pages/PlayersPage';
import FixturesPage from './pages/FixturesPage';
import { useTeamId } from './context/TeamIdContext';

function App() {
  const { teamId } = useTeamId();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Only show navbar when logged in */}
      {teamId && <Navbar />}

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
