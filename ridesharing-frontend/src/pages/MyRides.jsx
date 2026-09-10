import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, XCircle } from 'lucide-react';
import { ridesApi, bookingsApi } from '../services/auth';
import RideCard from '../components/rides/RideCard';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MyRides() {
  const [activeTab, setActiveTab] = useState('POSTED'); // 'POSTED' or 'BOOKINGS'
  
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [loadingRides, setLoadingRides] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchRides();
    fetchBookings();
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
          <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">My Activity</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage your posted rides and bookings</p>
        </div>
        <Link to="/rides/create" className="btn-accent">
          <PlusCircle className="h-4 w-4" /> Post New Ride
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => { setActiveTab('POSTED'); setFilter('ALL'); }}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'POSTED'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:border-border hover:text-text-primary'
            }`}
          >
            My Posted Rides
          </button>
          <button
            onClick={() => { setActiveTab('BOOKINGS'); setFilter('ALL'); }}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'BOOKINGS'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:border-border hover:text-text-primary'
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
                ? 'bg-primary text-white'
                : 'border border-border text-text-secondary hover:border-border-hover'
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
                <RideCard key={ride.id} ride={ride} showRequest={false} />
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
                        booking.status === 'CANCELLED' ? 'bg-error/10 text-error' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-sm font-semibold">{booking.sourceLocation} → {booking.destinationLocation}</span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
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
