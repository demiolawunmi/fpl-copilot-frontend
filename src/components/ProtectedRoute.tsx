import { Navigate, Outlet } from 'react-router-dom';
import { useTeamId } from '../context/TeamIdContext';
import {getEntry} from '../api/fpl/fpl';

const ProtectedRoute = () => {
  const { teamId } = useTeamId();

  if (!teamId) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

