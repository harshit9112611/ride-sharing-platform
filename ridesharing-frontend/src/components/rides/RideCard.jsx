import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, ArrowRight, Star } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatDate';

const statusStyles = {
  OPEN: 'bg-emerald-50 text-success border-emerald-200',
  FULL: 'bg-amber-50 text-warning border-amber-200',
  COMPLETED: 'bg-slate-100 text-text-muted border-border',
  CANCELLED: 'bg-red-50 text-error border-red-200',
};

export default function RideCard({ ride, onRequest, showRequest = true }) {
  const driver = ride.driver || {};
  const isFree = ride.rideType === 'FREE';
  const isFull = ride.status === 'FULL' || ride.availableSeats === 0;

  return (
    <article className="card-hover group flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="truncate font-medium text-text-primary">{ride.sourceLocation}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span className="truncate font-medium text-text-primary">{ride.destinationLocation}</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(ride.departureDate)} • {formatTime(ride.departureTime)}
            </span>
            <span className={`flex items-center gap-1 font-medium ${isFull ? 'text-warning' : 'text-success'}`}>
              <Users className="h-3.5 w-3.5" />
              {isFull ? 'FULL' : `${ride.availableSeats} seat${ride.availableSeats !== 1 ? 's' : ''} left`}
            </span>
          </div>
        </div>
        <span className={`shrink-0 rounded-lg border px-2 py-0.5 text-xs font-medium ${statusStyles[isFull ? 'FULL' : ride.status] || statusStyles.OPEN}`}>
          {isFull ? 'FULL' : ride.status}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
            {driver.fullName?.charAt(0) || 'D'}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{driver.fullName || 'Driver'}</p>
            <p className="text-xs text-text-muted">
              {driver.branch} • Year {driver.academicYear}
              {driver.rating > 0 && (
                <span className="ml-1.5 inline-flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  {driver.rating.toFixed(1)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="text-right">
          {isFree ? (
            <span className="text-sm font-semibold text-success">Free</span>
          ) : (
            <span className="text-sm font-semibold text-text-primary">₹{ride.price}</span>
          )}
          <p className="text-xs text-text-muted">{isFree ? 'Ride' : 'Fuel share'}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          to={`/rides/${ride.id}`}
          className="btn-ghost flex-1 py-2 text-xs text-center"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
