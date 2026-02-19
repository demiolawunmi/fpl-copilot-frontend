import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTeamId } from '../context/TeamIdContext';

interface NavbarProps {
  teamName?: string | null;
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/gw-overview', label: 'GW Overview' },
  { to: '/command-center', label: 'Command Center' },
  { to: '/players', label: 'Players' },
  { to: '/fixtures', label: 'Fixtures' },
];

const Navbar = ({ teamName }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { teamId, clearTeamId } = useTeamId();

  const handleSignOut = () => {
    clearTeamId();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-slate-900 shadow-md w-full">
      <div className="flex items-center justify-between px-10 py-4">
        {/* Left — brand + nav links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-wide text-emerald-400">
            FPL Copilot
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200
                    ${isActive
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right — team ID badge + sign out */}
        <div className="flex items-center gap-4">
          {teamId && (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-mono text-emerald-400 border border-slate-700">
              ID: {teamId} {teamName ? `| ${teamName}` : ''}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-400/10 hover:text-red-300 transition duration-200 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;