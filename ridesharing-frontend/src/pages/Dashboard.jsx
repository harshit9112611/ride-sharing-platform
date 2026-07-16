import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, PlusCircle, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ridesApi } from '../services/auth';
import { getRelativeGreeting } from '../utils/formatDate';
import RideCard from '../components/rides/RideCard';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ridesApi.getMyRides()
      .then(({ data }) => setMyRides(data))
      .catch(() => setMyRides([]))
      .finally(() => setLoading(false));
  }, []);

  const openRides = myRides.filter((r) => r.status === 'OPEN');
  const totalSeats = openRides.reduce((sum, r) => sum + (r.availableSeats || 0), 0);

  const stats = [
    { label: 'Total Rides', value: myRides.length, icon: Car, accent: 'text-accent' },
    { label: 'Open Rides', value: openRides.length, icon: Search, accent: 'text-success' },
    { label: 'Available Seats', value: totalSeats, icon: Users, accent: 'text-warning' },
    { label: 'Requests', value: 0, icon: ArrowRight, accent: 'text-text-muted' },
  ];

  const recentRides = openRides.slice(0, 3);

  return (
    <div className="page-container">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted">{getRelativeGreeting()}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary sm:text-3xl">
            {user?.fullName?.split(' ')[0] || 'Student'}
          </h1>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            Buses leave at 3:30 PM and 5:30 PM. Share or find rides for everything in between.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/rides/create" className="btn-accent">
            <PlusCircle className="h-4 w-4" /> Post a Ride
          </Link>
          <Link to="/rides/search" className="btn-ghost">
            <Search className="h-4 w-4" /> Find a Ride
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`card p-5 ${i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
          >
            <div className="flex items-center justify-between">
              <stat.icon className={`h-5 w-5 ${stat.accent}`} strokeWidth={1.5} />
              <span className="font-display text-2xl font-bold text-text-primary">{stat.value}</span>
            </div>
            <p className="mt-3 text-xs font-medium text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text-primary">Your Open Rides</h2>
          <Link to="/my-rides" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : recentRides.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} showRequest={false} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No open rides yet"
              description="Post your first ride and help fellow students get where they need to go."
              action={
                <Link to="/rides/create" className="btn-accent">
                  <PlusCircle className="h-4 w-4" /> Post a Ride
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
