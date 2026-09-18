import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Calendar, Car, Clock, MapPin, PlusCircle, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { ridesApi } from '../../services/auth';
import { connectWebSocket } from '../../services/websocket';
import { PICKUP_LOCATIONS, DESTINATION_LOCATIONS } from '../../utils/constants';
import { toInputDate } from '../../utils/formatDate';
import RideCard from './RideCard';
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
  const [searchError, setSearchError] = useState('');

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    if (!filters.source || !filters.destination || !filters.date) {
      toast.error('Please fill all filter fields');
      return;
    }

    setLoading(true);
    setSearchError('');
    setSearched(true);
    try {
      const { data } = await ridesApi.search(filters);
      setRides(data);
      setSearchError('');
    } catch {
      toast.error('Search failed');
      setRides([]);
      setSearchError('Unable to load rides. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleRetry = () => handleSearch();

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

      <form onSubmit={handleSearch} className="mt-8 card p-5 shadow-soft sm:p-6">
        <div className="grid gap-5 sm:grid-cols-4">
          <div>
            <label htmlFor="source" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-primary">
              <MapPin className="h-3.5 w-3.5 text-accent" /> From
            </label>
            <select
              id="source"
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="input-field transition-all duration-200 focus:ring-2 focus:ring-primary-200"
            >
              <option value="">Select source</option>
              {PICKUP_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="destination" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-primary">
              <MapPin className="h-3.5 w-3.5 text-accent" /> To
            </label>
            <select
              id="destination"
              value={filters.destination}
              onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
              className="input-field transition-all duration-200 focus:ring-2 focus:ring-primary-200"
            >
              <option value="">Select destination</option>
              {DESTINATION_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-primary">
              <Calendar className="h-3.5 w-3.5 text-accent" /> Date
            </label>
            <input
              id="date"
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              min={toInputDate()}
              className="input-field transition-all duration-200 focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-3 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2"
            >
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
            <div className="flex rounded-lg border border-border bg-surface p-1">
              <button
                type="button"
                onClick={() => setSortBy('time')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  sortBy === 'time'
                    ? 'border border-primary-500 bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-surface-hover'
                }`}
              >
                <Clock className="h-3.5 w-3.5" /> By Time
              </button>
              <button
                type="button"
                onClick={() => setSortBy('price')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  sortBy === 'price'
                    ? 'border border-primary-500 bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-surface-hover'
                }`}
              >
                ₹ By Price
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card h-52 p-5">
                  <div className="flex items-center justify-between">
                    <div className="skeleton h-4 w-3/5" />
                    <div className="skeleton h-5 w-12 rounded-lg" />
                  </div>
                  <div className="skeleton mt-3 h-3 w-4/5" />
                  <div className="mt-6 border-t border-border pt-4">
                    <div className="skeleton h-9 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchError ? (
            <div className="card mx-auto max-w-lg p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-error">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-text-primary">Couldn&apos;t load rides</h2>
              <p className="mt-2 text-sm text-text-secondary">{searchError}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="btn-accent mt-5 px-4 py-2.5 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4" /> Try Again
              </button>
            </div>
          ) : sortedRides.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onRequest={() => toast.success('Ride request sent!')}
                />
              ))}
            </div>
          ) : (
            <div className="card mx-auto max-w-lg p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Car className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-text-primary">No rides found</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Try different locations or dates, or be the first to post a ride.
              </p>
              <Link to="/rides/create" className="btn-accent mt-5 inline-flex px-4 py-2.5 transition-all duration-200 hover:shadow-md">
                <PlusCircle className="h-4 w-4" /> Post a Ride
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
