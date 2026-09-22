import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, XCircle, Trash2 } from 'lucide-react';
import { ridesApi, bookingsApi } from '../services/auth';
import RideCard from '../components/rides/RideCard';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MyRides() {
  const [activeTab, setActiveTab] = useState('POSTED'); // 'POSTED' or 'BOOKINGS'

  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const [loadingRides, setLoadingRides] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchRides();
    fetchBookings();
    fetchPendingRequests();
  }, []);

  const fetchRides = () => {
    ridesApi.getMyRides()
      .then(({ data }) => setRides(data))
      .catch(() => setRides([]))
      .finally(() => setLoadingRides(false));
  };

  const fetchBookings = () => {
    bookingsApi.getMyBookings()
      .then(({ data }) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  };

  const fetchPendingRequests = () => {
    bookingsApi.received('PENDING')
      .then(({ data }) => setPendingRequests(Array.isArray(data) ? data : []))
      .catch(() => setPendingRequests([]));
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await bookingsApi.accept(bookingId);
      toast.success('Booking accepted');
      fetchPendingRequests();
      fetchRides();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to accept booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!window.confirm('Reject this booking?')) return;
    try {
      await bookingsApi.reject(bookingId);
      toast.success('Booking rejected');
      fetchPendingRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject booking');
    }
  };

  const handleDeleteRide = async (rideId) => {
    if (!window.confirm('Delete this ride? This cannot be undone.')) return;

    try {
      await ridesApi.remove(rideId);
      toast.success('Ride deleted');
      fetchRides();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete ride');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingsApi.cancel(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const filteredRides = filter === 'ALL' ? rides : rides.filter((r) => r.status === filter);
  const filteredBookings = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  const filters = ['ALL', 'OPEN', 'FULL', 'COMPLETED', 'CANCELLED'];
  const bookingFilters = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'];

  return (
    <div className="page-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary dark:text-gray-100 sm:text-3xl">
            My Activity
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">
            Manage your posted rides and bookings
          </p>
        </div>
        <Link to="/rides/create" className="btn-accent">
          <PlusCircle className="h-4 w-4" /> Post New Ride
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-border dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => { setActiveTab('POSTED'); setFilter('ALL'); }}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
              activeTab === 'POSTED'
                ? 'border-primary text-primary dark:border-accent dark:text-accent'
                : 'border-transparent text-text-secondary hover:border-border hover:text-text-primary dark:text-gray-300 dark:hover:text-gray-100'
            }`}
          >
            My Posted Rides
          </button>
          <button
            onClick={() => { setActiveTab('BOOKINGS'); setFilter('ALL'); }}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
              activeTab === 'BOOKINGS'
                ? 'border-primary text-primary dark:border-accent dark:text-accent'
                : 'border-transparent text-text-secondary hover:border-border hover:text-text-primary dark:text-gray-300 dark:hover:text-gray-100'
            }`}
          >
            My Bookings
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(activeTab === 'POSTED' ? filters : bookingFilters).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
              filter === f
                ? 'bg-primary text-white dark:bg-accent'
                : 'border border-border text-text-secondary hover:border-border-hover dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-gray-100'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === 'POSTED' ? (
          loadingRides ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredRides.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRides.map((ride) => (
                <div key={ride.id} className="relative group">
                  <RideCard ride={ride} showRequest={false} />
                  {ride.status === 'OPEN' && (
                    <button
                      onClick={() => handleDeleteRide(ride.id)}
                      className="absolute top-2 right-2 rounded-lg bg-white/90 p-1.5 text-error shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error hover:text-white dark:bg-gray-800/90"
                      title="Delete Ride"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {pendingRequests.filter(pr => pr.rideId === ride.id).length > 0 && (
                    <div className="mt-3 rounded-xl border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20">
                      <p className="mb-2 text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                        Pending Requests
                      </p>
                      {pendingRequests.filter(pr => pr.rideId === ride.id).map(pr => (
                        <div key={pr.id} className="flex items-center justify-between py-1.5 text-sm">
                          <div>
                            <p className="font-medium text-text-primary dark:text-gray-100">{pr.passengerName}</p>
                            <p className="text-xs text-text-secondary dark:text-gray-400">
                              {pr.passengerBranch} · Year {pr.passengerAcademicYear} · {pr.seatsBooked} seat(s)
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleAcceptBooking(pr.id)}
                              className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectBooking(pr.id)}
                              className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No rides found"
              description="You haven't posted any rides matching this filter."
              action={
                <Link to="/rides/create" className="btn-accent">
                  <PlusCircle className="h-4 w-4" /> Post Your First Ride
                </Link>
              }
            />
          )
        ) : (
          loadingBookings ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-success/10 text-success' :
                        booking.status === 'CANCELLED' ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-sm font-semibold text-text-primary dark:text-gray-100">
                        {booking.sourceLocation} → {booking.destinationLocation}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">
                      {booking.departureDate} at {booking.departureTime} • {booking.seatsBooked} seat(s) booked
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link to={`/rides/${booking.rideId}`} className="btn-ghost flex-1 sm:flex-none text-center">
                      View Ride
                    </Link>
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="btn-ghost text-error hover:bg-error/10 flex-1 sm:flex-none flex items-center justify-center gap-1"
                      >
                        <XCircle className="h-4 w-4" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No bookings found"
              description="You haven't booked any rides matching this filter."
              action={
                <Link to="/rides/search" className="btn-accent">
                  Search for Rides
                </Link>
              }
            />
          )
        )}
      </div>
    </div>
  );
}