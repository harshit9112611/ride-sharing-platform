import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { ridesApi } from '../services/auth';
import RideCard from '../components/rides/RideCard';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function MyRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    ridesApi.getMyRides()
      .then(({ data }) => setRides(data))
      .catch(() => setRides([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? rides : rides.filter((r) => r.status === filter);

  const filters = ['ALL', 'OPEN', 'FULL', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="page-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">My Rides</h1>
          <p className="mt-1 text-sm text-text-secondary">Rides you&apos;ve posted as a driver</p>
        </div>
        <Link to="/rides/create" className="btn-accent">
          <PlusCircle className="h-4 w-4" /> Post New Ride
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
              filter === f
                ? 'bg-primary text-white'
                : 'border border-border text-text-secondary hover:border-border-hover'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ride) => (
              <RideCard key={ride.id} ride={ride} showRequest={false} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No rides yet"
            description="When you post rides, they'll appear here for easy management."
            action={
              <Link to="/rides/create" className="btn-accent">
                <PlusCircle className="h-4 w-4" /> Post Your First Ride
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
