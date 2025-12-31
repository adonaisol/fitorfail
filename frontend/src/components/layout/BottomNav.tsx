import { NavLink } from 'react-router-dom';
import { Home, History, User, Plus, LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/home/generate', icon: Plus, label: 'Generate' },
  { to: '/home/history', icon: History, label: 'History' },
  { to: '/home/profile', icon: User, label: 'Profile' },
];

export default function BottomNav(): JSX.Element {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16" role="menubar">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 ${
                isActive ? 'text-primary-500' : 'text-gray-500'
              }`
            }
            role="menuitem"
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon className="w-6 h-6" aria-hidden="true" />
                <span className="text-xs font-medium" aria-current={isActive ? 'page' : undefined}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
