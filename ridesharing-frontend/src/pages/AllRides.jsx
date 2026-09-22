import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Car, Clock, Filter, PlusCircle, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ridesApi } from '../services/auth';
import { PICKUP_LOCATIONS, DESTINATION_LOCATIONS } from '../utils/constants';
import RideCard from '../components/rides/RideCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

function sortRides(rides, sortBy) {
  const sorted = [...rides];
  if (sortBy === 'price') {
    return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
  }
  return sorted.sort((a, b) => {
    const timeA = `${a.departureDate}T${a.departureTime}`;
    const timeB = `${b.departureDate}T${b.departureTime}`;
    return timeA.localeCompare(timeB);
  });
}

export default function AllRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [filters, setFilters] = useState({
    source: '',
    destination: '',
    rideType: '',
  });

  const fetchRides = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await ridesApi.getAllAvailable();
      setRides(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Could not load rides');
      setRides([]);
      setError('Unable to load rides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const filtersActive = Boolean(filters.source || filters.destination || filters.rideType);

  const filteredRides = rides.filter((ride) => {
    if (filters.source && ride.sourceLocation !== filters.source) return false;
    if (filters.destination && ride.destinationLocation !== filters.destination) return false;
    if (filters.rideType && ride.rideType !== filters.rideType) return false;
    return true;
  });

  const sortedRides = sortRides(filteredRides, sortBy);

  const clearFilters = () => {
    setFilters({ source: '', destination: '', rideType: '' });
  };

  return (
    <div className="page-container">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary dark:text-gray-100 sm:text-3xl">
          Available Rides
        </h1>
        <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">
          Browse all rides currently open across campus
        </p>
      </div>

      <div className="card mt-8 p-5 shadow-soft dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-text-primary dark:text-gray-100">
          <Filter className="h-4 w-4 text-accent" />
          Filters
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="all-rides-source" className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-100">
              From
            </label>
            <select
              id="all-rides-source"
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="input-field dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Any source</option>
              {PICKUP_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="all-rides-destination" className="mb-2 block text-sm font-medium text-text-primary dark:text-gray-100">
              To
            </label>
            <select
              id="all-rides-destination"
              value={filters.destination}
              onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
              className="input-field dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Any destination</option>
              {DESTINATION_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-text-primary dark:text-gray-100">Ride type</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '', label: 'Any' },
                { value: 'FREE', label: 'Free' },
                { value: 'FUEL_SHARING', label: 'Fuel Sharing' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setFilters({ ...filters, rideType: opt.value })}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                    filters.rideType === opt.value
                      ? 'border-primary-500 bg-primary-50 text-primary dark:border-primary-400 dark:bg-gray-700 dark:text-gray-100'
                      : 'border-border text-text-secondary hover:bg-surface-hover dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary dark:text-gray-400">
            {loading ? 'Loading...' : `${sortedRides.length} ride${sortedRides.length !== 1 ? 's' : ''} available`}
          </p>
          <div className="flex rounded-lg border border-border bg-surface p-1 dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setSortBy('time')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                sortBy === 'time'
                  ? 'border border-primary-500 bg-primary-50 text-primary dark:bg-gray-700 dark:text-gray-100'
                  : 'text-text-secondary hover:bg-surface-hover dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Clock className="h-3.5 w-3.5" /> By Time
            </button>
            <button
              type="button"
              onClick={() => setSortBy('price')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                sortBy === 'price'
                  ? 'border border-primary-500 bg-primary-50 text-primary dark:bg-gray-700 dark:text-gray-100'
                  : 'text-text-secondary hover:bg-surface-hover dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              ₹ By Price
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card h-52 animate-pulse p-5 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-3/5 rounded bg-slate-200 dark:bg-gray-700" />
                  <div className="h-5 w-12 rounded-lg bg-slate-200 dark:bg-gray-700" />
                </div>
                <div className="mt-3 h-3 w-4/5 rounded bg-slate-200 dark:bg-gray-700" />
                <div className="mt-6 border-t border-border pt-4 dark:border-gray-700">
                  <div className="h-9 w-full rounded-lg bg-slate-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card mx-auto max-w-lg p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-error dark:bg-gray-700">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-text-primary dark:text-gray-100">
              Could not load rides
            </h2>
            <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">{error}</p>
            <button
              type="button"
              onClick={fetchRides}
              className="btn-accent mt-5 px-4 py-2.5"
            >
              {loading ? <LoadingSpinner size="sm" className="text-white" /> : <><RefreshCw className="h-4 w-4" /> Try Again</>}
            </button>
          </div>
        ) : sortedRides.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        ) : (
          <div className="card mx-auto max-w-lg p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Car className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-text-primary dark:text-gray-100">
              No rides available right now
            </h2>
            <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">
              Try clearing filters, or be the first to post a ride.
            </p>
            <Link to="/rides/create" className="btn-accent mt-5 inline-flex px-4 py-2.5">
              <PlusCircle className="h-4 w-4" /> Post a Ride
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
