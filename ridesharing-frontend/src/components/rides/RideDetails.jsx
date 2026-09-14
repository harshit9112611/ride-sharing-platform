import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Star, ArrowLeft, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import { ridesApi, bookingsApi } from '../../services/auth';
import { formatDate, formatTime } from '../../utils/formatDate';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

export default function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [userBooking, setUserBooking] = useState(null);

  useEffect(() => {
    fetchRide();
    if (user) fetchUserBooking();
  }, [id, user]);

  const fetchUserBooking = async () => {
    try {
      const { data } = await bookingsApi.getMyBookings();
      const booking = data.find(b => b.rideId === Number(id) && b.status === 'CONFIRMED');
      if (booking) setUserBooking(booking);
    } catch (e) {
      // ignore
    }
  };

  const fetchRide = () => {
    ridesApi.getById(id)
      .then(({ data }) => setRide(data))
      .catch(() => toast.error('Ride not found'))
      .finally(() => setLoading(false));
  };

  const handleBookRide = async () => {
    try {
      setBookingLoading(true);
      await bookingsApi.book(id, seatsToBook);
      toast.success('Ride booked successfully!');
      setBookingModalOpen(false);
      navigate('/my-rides');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book ride');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="page-container text-center">
        <p className="text-text-secondary">Ride not found.</p>
        <Link to="/rides/search" className="btn-accent mt-4 inline-flex">Back to Search</Link>
      </div>
    );
  }

  const driver = ride.driver || {};
  const isFree = ride.rideType === 'FREE';
  const isDriver = user?.id === driver.id;
  const isFull = ride.status === 'FULL';
  const hasBooked = !!userBooking;
  const canBook = ride.status === 'OPEN' && !isDriver && !hasBooked;

  return (
    <div className="page-container relative space-y-4">
      <Link to="/rides/search" className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to search
      </Link>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className={`card p-4 sm:p-6 ${hasBooked ? 'border-2 border-success shadow-success/10 bg-success/5' : ''}`}>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent">
              <Car className="h-4 w-4" />
              Ride Details
            </div>

            <h1 className="mt-3 font-display text-xl font-bold text-text-primary sm:text-2xl">
              {ride.sourceLocation} → {ride.destinationLocation}
            </h1>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-background p-4">
                <MapPin className="h-4 w-4 text-accent" />
                <p className="mt-2 text-xs text-text-muted">Route</p>
                <p className="text-xs font-medium">{ride.sourceLocation}</p>
                <p className="text-xs text-text-secondary">to {ride.destinationLocation}</p>
              </div>
              <div className="rounded-xl bg-background p-4">
                <Clock className="h-4 w-4 text-accent" />
                <p className="mt-2 text-xs text-text-muted">Departure</p>
                <p className="text-xs font-medium">{formatDate(ride.departureDate)}</p>
                <p className="text-xs text-text-secondary">{formatTime(ride.departureTime)}</p>
              </div>
              <div className="rounded-xl bg-background p-4">
                <Users className="h-4 w-4 text-accent" />
                <p className="mt-2 text-xs text-text-muted">Availability</p>
                <p className="text-xs font-medium">{ride.availableSeats} seats left</p>
                <p className="text-xs text-text-secondary">{ride.status}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="text-xs text-text-muted">Ride type</p>
                <p className="font-display text-base font-semibold">
                  {isFree ? 'Free Ride' : 'Fuel Sharing'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-muted">Cost</p>
                <p className="font-display text-2xl font-bold text-text-primary">
                  {isFree ? 'Free' : `₹${ride.price}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-4">
            <h2 className="font-display text-base font-semibold">Driver & Vehicle</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                  {driver.fullName?.charAt(0) || 'D'}
                </div>
                <div>
                  <p className="font-medium text-sm text-text-primary">{driver.fullName}</p>
                  <p className="text-xs text-text-secondary">{driver.branch}</p>
                  {driver.rating > 0 && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      {driver.rating.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
              {ride.vehicle && (
                <div className="flex items-center gap-3 border-l border-border pl-4">
                  <Car className="h-8 w-8 text-text-muted" />
                  <div>
                    <p className="font-medium text-sm text-text-primary">{ride.vehicle.model}</p>
                    <p className="text-xs text-text-secondary">{ride.vehicle.registrationNumber}</p>
                  </div>
                </div>
              )}
            </div>

            {hasBooked ? (
              <div className="mt-5 flex flex-col items-center justify-center rounded-xl bg-success/10 p-3 text-success">
                <span className="font-semibold text-sm">✓ You have booked this ride</span>
                <span className="text-xs">{userBooking.seatsBooked} seat(s) booked</span>
              </div>
            ) : isDriver ? (
              <button disabled className="btn-accent mt-5 w-full opacity-50 cursor-not-allowed">You are the driver</button>
            ) : isFull ? (
              <div className="mt-5 flex items-center justify-center rounded-xl bg-error/10 p-3 font-semibold text-error">
                This ride is full
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setSeatsToBook(1); setBookingModalOpen(true); }}
                className="btn-accent mt-5 w-full"
              >
                Book This Ride
              </button>
            )}
          </div>
        </div>
      </div>

      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Confirm Booking</h2>
            <p className="mt-2 text-sm text-text-secondary">
              How many seats would you like to book?
            </p>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-text-primary">Seats</label>
              <input
                type="number"
                min="1"
                max={ride.availableSeats}
                value={seatsToBook}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isNaN(val)) { setSeatsToBook(1); return; }
                  setSeatsToBook(Math.min(Math.max(val, 1), ride.availableSeats));
                }}
                className="input-field mt-1 w-full"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="btn-ghost px-4 py-2"
                disabled={bookingLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBookRide}
                className="btn-accent px-4 py-2"
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Booking...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
