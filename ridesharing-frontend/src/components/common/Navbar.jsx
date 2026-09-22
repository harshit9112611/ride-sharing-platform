import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationButton from './NotificationButton';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/rides/search', label: 'Find Rides' },
  { to: '/rides/available', label: 'All Rides' },
  { to: '/rides/create', label: 'Post Ride' },
  { to: '/my-rides', label: 'My Rides' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
    }`;

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Main navigation">
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="group">
          <img src="/logo.png" alt="LNCTShares" className="h-9 w-auto transition-transform duration-200 group-hover:scale-105" />
        </Link>

        {isAuthenticated && (
          <>
            <div className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop right side */}
            <div className="hidden items-center gap-3 md:flex">
              <ThemeToggle />
              <NotificationButton />

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:border-border-hover hover:bg-surface-hover dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.fullName?.split(' ')[0]}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-surface py-1.5 shadow-hard animate-fade-in dark:border-gray-700 dark:bg-gray-800">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="rounded-lg p-2 text-text-secondary hover:bg-surface-hover md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </>
        )}
      </nav>

      {mobileOpen && isAuthenticated && (
        <div className="border-t border-border bg-surface px-5 py-4 md:hidden animate-slide-up dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="my-2 border-border" />

            <div className="rounded-lg px-3 py-2">
              <ThemeToggle />
            </div>
            <div className="rounded-lg px-3 py-2">
              <NotificationButton />
            </div>

            <NavLink
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary"
            >
              Profile
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
