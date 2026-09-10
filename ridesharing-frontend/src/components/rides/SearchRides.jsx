import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { ridesApi } from '../../services/auth';
import { connectWebSocket } from '../../services/websocket';
import { PICKUP_LOCATIONS, DESTINATION_LOCATIONS, SORT_OPTIONS } from '../../utils/constants';
import { toInputDate } from '../../utils/formatDate';
import RideCard from './RideCard';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';

function sortRides(rides, sortBy) {
  const sorted = [...rides];
  switch (sortBy) {
    case 'price':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'rating':
      return sorted.sort((a, b) => (b.driver?.rating || 0) - (a.driver?.rating || 0));
    case 'time':
    default:
      return sorted.sort((a, b) => {
        const timeA = `${a.departureDate}T${a.departureTime}`;
        const timeB = `${b.departureDate}T${b.departureTime}`;
        return timeA.localeCompare(timeB);
      });
  }
}

export default function SearchRides() {
  const [filters, setFilters] = useState({
    source: '',
    destination: '',
    date: toInputDate(),
  });
  const [sortBy, setSortBy] = useState('time');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    if (!filters.source || !filters.destination || !filters.date) {
      toast.error('Please fill all filter fields');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data } = await ridesApi.search(filters);
      setRides(data);
    } catch {
      toast.error('Search failed');
      setRides([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const handleNewRide = (ride) => {
      toast.success(`New ride: ${ride.sourceLocation} → ${ride.destinationLocation}`, {
        duration: 5000,
      });
      if (
        searched &&
        ride.sourceLocation === filters.source &&
        ride.destinationLocation === filters.destination &&
        ride.departureDate === filters.date
      ) {
        setRides((prev) => {
          if (prev.some((r) => r.id === ride.id)) return prev;
          return sortRides([ride, ...prev], sortBy);
        });
      }
    };

    connectWebSocket(handleNewRide);
  }, [searched, filters, sortBy]);

  const sortedRides = sortRides(rides, sortBy);

  return (
    <div className="page-container">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">Find a Ride</h1>
          <p className="mt-1 text-sm text-text-secondary">Search available rides</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mt-8 card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="source" className="mb-1.5 block text-xs font-medium text-text-muted">From</label>
            <select id="source" value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className="input-field">
              <option value="">Select source</option>
              {PICKUP_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="destination" className="mb-1.5 block text-xs font-medium text-text-muted">To</label>
            <select id="destination" value={filters.destination} onChange={(e) => setFilters({ ...filters, destination: e.target.value })} className="input-field">
              <option value="">Select destination</option>
              {DESTINATION_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="mb-1.5 block text-xs font-medium text-text-muted">Date</label>
            <input id="date" type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} min={toInputDate()} className="input-field" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="btn-accent w-full">
              {loading ? <LoadingSpinner size="sm" className="text-white" /> : <><Search className="h-4 w-4" /> Search</>}
            </button>
          </div>
        </div>
      </form>

      {searched && (
        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {loading ? 'Searching...' : `${sortedRides.length} ride${sortedRides.length !== 1 ? 's' : ''} found`}
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-text-muted" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary">
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card h-48 p-5">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton mt-3 h-3 w-1/2" />
                  <div className="skeleton mt-8 h-10 w-full" />
                </div>
              ))}
            </div>
          ) : sortedRides.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sortedRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onRequest={() => toast.success('Ride request sent!')}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No rides found"
              description="Try different locations or dates. New rides are posted throughout the day."
            />
          )}
        </div>
      )}
    </div>
  );
}
