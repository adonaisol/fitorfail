import { NavLink } from 'react-router-dom';
import { Home, History, User, Plus, LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/generate', icon: Plus, label: 'Generate' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav(): JSX.Element {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
                isActive ? 'text-primary-500' : 'text-gray-500'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
