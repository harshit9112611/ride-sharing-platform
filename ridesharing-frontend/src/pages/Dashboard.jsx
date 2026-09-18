import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, PlusCircle, Search, ArrowRight, GraduationCap, Route, BookmarkCheck, Armchair } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ridesApi, bookingsApi, statsApi } from '../services/auth';
import { getRelativeGreeting } from '../utils/formatDate';
import RideCard from '../components/rides/RideCard';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestCount, setRequestCount] = useState(0);
  const [appStats, setAppStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    ridesApi.getMyRides()
      .then(({ data }) => setMyRides(data))
      .catch(() => setMyRides([]))
      .finally(() => setLoading(false));
      
    bookingsApi.received('CONFIRMED')
      .then(r => setRequestCount(r.data?.length || 0))
      .catch(() => setRequestCount(0));

    statsApi.getPublic()
      .then(({ data }) => setAppStats(data))
      .catch(() => setAppStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const openRides = myRides.filter((r) => r.status === 'OPEN');
  const totalSeats = openRides.reduce((sum, r) => sum + (r.availableSeats || 0), 0);

  const stats = [
    { label: 'Total Rides', value: myRides.length, icon: Car, accent: 'text-accent' },
    { label: 'Open Rides', value: openRides.length, icon: Search, accent: 'text-success' },
    { label: 'Available Seats', value: totalSeats, icon: Users, accent: 'text-warning' },
    { label: 'Requests', value: requestCount, icon: ArrowRight, accent: 'text-text-muted' },
  ];

  const recentRides = openRides.slice(0, 3);

  return (
    <div className="page-container animate-slide-up space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Hi, {user?.fullName?.split(' ')[0] || 'Student'} 👋
          </h1>
          {appStats && appStats.totalUsers >= 20 && (
            <p className="mt-1 text-sm font-medium text-text-secondary">
              Join {appStats.totalUsers}+ LNCTians sharing rides
            </p>
          )}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`card p-4 sm:p-5 hover:shadow-md transition-all duration-200 ${i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
          >
            <div className="flex items-center justify-between">
              <stat.icon className={`h-5 w-5 ${stat.accent}`} strokeWidth={1.5} />
              <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">{stat.value}</span>
            </div>
            <p className="mt-2 text-xs font-medium text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="relative font-display text-xl font-semibold text-text-primary">
            Your Open Rides
            <span className="absolute -bottom-[13px] left-0 h-[2px] w-16 rounded-full bg-accent" />
          </h2>
          <Link to="/my-rides" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-6">
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

      {statsLoading ? (
        <div className="card p-5 animate-pulse">
          <div className="h-5 w-48 bg-slate-200 rounded mb-4"></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      ) : appStats && appStats.totalUsers >= 5 ? (
        <div>
          <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-5">
            <h2 className="relative font-display text-xl font-semibold text-text-primary">
              LNCTShares at a glance
              <span className="absolute -bottom-[13px] left-0 h-[2px] w-16 rounded-full bg-accent" />
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold tracking-tight text-text-primary">{appStats.totalUsers}</p>
                <p className="text-xs font-medium text-text-muted">Students registered</p>
              </div>
            </div>

            <div className="card p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success shrink-0">
                <Route className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold tracking-tight text-text-primary">{appStats.totalRides}</p>
                <p className="text-xs font-medium text-text-muted">Rides posted</p>
              </div>
            </div>

            <div className="card p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/10 text-warning shrink-0">
                <BookmarkCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold tracking-tight text-text-primary">{appStats.totalBookings}</p>
                <p className="text-xs font-medium text-text-muted">Rides booked</p>
              </div>
            </div>

            <div className="card p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
                <Armchair className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold tracking-tight text-text-primary">{appStats.seatsShared}</p>
                <p className="text-xs font-medium text-text-muted">Seats shared</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
