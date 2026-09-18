import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-5 py-8 sm:flex-row sm:items-center sm:px-8">
        <div>
          <img src="/logo.png" alt="LNCTShares" className="h-8 w-auto" />
          <p className="mt-1 text-xs text-text-muted">
            Campus ride-sharing platform
          </p>
        </div>
        <div className="flex gap-6 text-xs text-text-muted">
          <Link to="/rides/search" className="transition-colors hover:text-text-secondary">
            Find Rides
          </Link>
          <span>© {new Date().getFullYear()} LNCTShares</span>
        </div>
      </div>
    </footer>
  );
}
