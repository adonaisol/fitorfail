import { Link } from 'react-router-dom';
import { Dumbbell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header(): JSX.Element {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 pt-safe">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Dumbbell className="w-7 h-7 text-primary-500" />
          <span className="text-xl font-bold text-gray-900">FitOrFail</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-primary-500 font-medium">
            Workouts
          </Link>
          <Link to="/history" className="text-gray-600 hover:text-primary-500 font-medium">
            History
          </Link>
          <Link to="/profile" className="text-gray-600 hover:text-primary-500 font-medium">
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:block text-sm text-gray-600">
              {user.username}
            </span>
          )}
          <button
            onClick={logout}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-red-500"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <Link to="/profile" className="md:hidden p-2 rounded-full hover:bg-gray-100">
            <User className="w-6 h-6 text-gray-600" />
          </Link>
        </div>
      </div>
    </header>
  );
}
