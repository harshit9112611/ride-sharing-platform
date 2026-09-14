import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ridesApi, vehiclesApi } from '../../services/auth';
import { validateRideForm } from '../../utils/validation';
import { PICKUP_LOCATIONS, DESTINATION_LOCATIONS, RIDE_TYPES, GENDER_PREFERENCES } from '../../utils/constants';
import { toInputDate } from '../../utils/formatDate';
import LoadingSpinner from '../common/LoadingSpinner';
import RideMap from './RideMap';

export default function CreateRide() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    sourceLocation: '',
    destinationLocation: '',
    departureDate: toInputDate(),
    departureTime: '',
    availableSeats: 1,
    rideType: 'FREE',
    price: 0,
    genderPreference: 'ANYONE',
    vehicleId: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    vehiclesApi.getMy()
      .then(r => setVehicles(r.data || []))
      .catch(() => setVehicles([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'vehicleId') {
      newValue = newValue === '' ? '' : Number(newValue);
    }
    setForm({ ...form, [name]: newValue });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRideForm({
      ...form,
      availableSeats: Number(form.availableSeats),
      price: Number(form.price),
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        sourceLocation: form.sourceLocation,
        destinationLocation: form.destinationLocation,
        departureDate: form.departureDate,
        departureTime: form.departureTime.length === 5 ? `${form.departureTime}:00` : form.departureTime,
        availableSeats: Number(form.availableSeats),
        rideType: form.rideType,
        price: form.rideType === 'FUEL_SHARING' ? Number(form.price) : 0,
        vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
      };

      await ridesApi.create(payload);
      toast.success('Ride posted successfully!');
      navigate('/my-rides');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">Post a Ride</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Share your empty seats with fellow students heading the same way.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="card p-6 sm:p-8 lg:col-span-3">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="sourceLocation" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5 text-accent" /> From
                </label>
                <select id="sourceLocation" name="sourceLocation" value={form.sourceLocation} onChange={handleChange} className="input-field">
                  <option value="">Select pickup</option>
                  {PICKUP_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                {errors.sourceLocation && <p className="mt-1 text-xs text-error">{errors.sourceLocation}</p>}
              </div>
              <div>
                <label htmlFor="destinationLocation" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5 text-accent" /> To
                </label>
                <select id="destinationLocation" name="destinationLocation" value={form.destinationLocation} onChange={handleChange} className="input-field">
                  <option value="">Select destination</option>
                  {DESTINATION_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {errors.destinationLocation && <p className="mt-1 text-xs text-error">{errors.destinationLocation}</p>}
              </div>
            </div>

            {(form.sourceLocation && form.destinationLocation) && (
              <RideMap source={form.sourceLocation} destination={form.destinationLocation} />
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="departureDate" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <Calendar className="h-3.5 w-3.5 text-accent" /> Date
                </label>
                <input id="departureDate" name="departureDate" type="date" value={form.departureDate} onChange={handleChange} min={toInputDate()} className="input-field" />
                {errors.departureDate && <p className="mt-1 text-xs text-error">{errors.departureDate}</p>}
              </div>
              <div>
                <label htmlFor="departureTime" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                  <Clock className="h-3.5 w-3.5 text-accent" /> Time
                </label>
                <input id="departureTime" name="departureTime" type="time" value={form.departureTime} onChange={handleChange} className="input-field" />
                {errors.departureTime && <p className="mt-1 text-xs text-error">{errors.departureTime}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="availableSeats" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-3.5 w-3.5 text-accent" /> Available Seats
              </label>
              <input id="availableSeats" name="availableSeats" type="number" min="1" max="6" value={form.availableSeats} onChange={handleChange} className="input-field" />
              {errors.availableSeats && <p className="mt-1 text-xs text-error">{errors.availableSeats}</p>}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Ride Type</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {RIDE_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                      form.rideType === type.value
                        ? 'border-accent bg-accent/5 shadow-soft'
                        : 'border-border hover:border-border-hover'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rideType"
                      value={type.value}
                      checked={form.rideType === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <p className="text-sm font-semibold">{type.label}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{type.description}</p>
                  </label>
                ))}
              </div>
            </div>

            {form.rideType === 'FUEL_SHARING' && (
              <div className="animate-slide-up">
                <label htmlFor="price" className="mb-1.5 block text-sm font-medium">Fuel Share Amount (₹)</label>
                <input id="price" name="price" type="number" min="1" value={form.price} onChange={handleChange} className="input-field" placeholder="e.g. 50" />
                {errors.price && <p className="mt-1 text-xs text-error">{errors.price}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="card p-6">
            <p className="text-sm font-medium text-text-primary">Passenger Preference</p>
            <p className="mt-1 text-xs text-text-muted">Optional — for your comfort</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {GENDER_PREFERENCES.map((pref) => (
                <button
                  key={pref.value}
                  type="button"
                  onClick={() => setForm({ ...form, genderPreference: pref.value })}
                  className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                    form.genderPreference === pref.value
                      ? 'bg-primary text-white'
                      : 'border border-border text-text-secondary hover:border-border-hover'
                  }`}
                >
                  {pref.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">
              Vehicle (Optional)
            </label>
            <select
              name="vehicleId"
              value={form.vehicleId}
              onChange={handleChange}
              disabled={vehicles.length === 0}
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-xl
                         focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {vehicles.length === 0 ? (
                <option value="">No vehicles added</option>
              ) : (
                <>
                  <option value="">— Not linked —</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.vehicleNumber})
                    </option>
                  ))}
                </>
              )}
            </select>
            {vehicles.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                <a href="/profile" className="text-primary-600 hover:underline">Add a vehicle in Profile</a> to link it here
              </p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-accent w-full py-3">
            {loading ? <LoadingSpinner size="sm" className="text-white" /> : (
              <><PlusCircle className="h-4 w-4" /> Post Ride</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
