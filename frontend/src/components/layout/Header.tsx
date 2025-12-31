import { Link } from 'react-router-dom';
import { Dumbbell, LogOut, History, HelpCircle, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header(): JSX.Element {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 pt-safe">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2">
          <img src="/logo.png" alt="FitOrFail" className="w-7 h-7" />
          <span className="text-xl font-bold text-gray-900">FitOrFail</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/home"
            className="group relative hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 hover:text-primary-500"
          >
            <Dumbbell className="w-5 h-5" />
            <span className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Workouts
            </span>
          </Link>
          <Link
            to="/home/history"
            className="group relative hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 hover:text-primary-500"
          >
            <History className="w-5 h-5" />
            <span className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              History
            </span>
          </Link>
          <Link
            to="/home/help"
            className="group relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 hover:text-primary-500"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Help
            </span>
          </Link>
          <Link
            to="/home/profile"
            className="group relative hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 hover:text-primary-500"
          >
            <User className="w-5 h-5" />
            <span className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Profile
            </span>
          </Link>
          <button
            onClick={logout}
            className="group relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 hover:text-red-500"
          >
            <LogOut className="w-5 h-5" />
            <span className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Logout
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
