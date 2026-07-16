import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Car, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { validateRegisterForm, getPasswordStrength } from '../../utils/validation';
import { BRANCHES, ACADEMIC_YEARS } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    collegeEmail: '',
    enrollmentNumber: '',
    branch: '',
    academicYear: '',
    phoneNumber: '',
    password: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm({
      ...form,
      academicYear: form.academicYear ? Number(form.academicYear) : null,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        collegeEmail: form.collegeEmail,
        enrollmentNumber: form.enrollmentNumber,
        branch: form.branch,
        academicYear: Number(form.academicYear),
        phoneNumber: form.phoneNumber,
        password: form.password,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-lg animate-slide-up">
        <Link to="/login" className="mb-8 inline-flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Car className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-display text-lg font-bold">
            Ride<span className="text-accent">Share</span>
          </span>
        </Link>

        <h1 className="font-display text-2xl font-bold text-text-primary">Create your account</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">Full Name</label>
            <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} className="input-field" placeholder="John Doe" />
            {errors.fullName && <p className="mt-1 text-xs text-error">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="collegeEmail" className="mb-1.5 block text-sm font-medium">College Email</label>
            <input id="collegeEmail" name="collegeEmail" type="email" value={form.collegeEmail} onChange={handleChange} className="input-field" placeholder="you@college.edu" />
            {errors.collegeEmail && <p className="mt-1 text-xs text-error">{errors.collegeEmail}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="enrollmentNumber" className="mb-1.5 block text-sm font-medium">Enrollment No.</label>
              <input id="enrollmentNumber" name="enrollmentNumber" value={form.enrollmentNumber} onChange={handleChange} className="input-field" placeholder="EN2024001" />
              {errors.enrollmentNumber && <p className="mt-1 text-xs text-error">{errors.enrollmentNumber}</p>}
            </div>
            <div>
              <label htmlFor="phoneNumber" className="mb-1.5 block text-sm font-medium">Phone</label>
              <input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="input-field" placeholder="9876543210" maxLength={10} />
              {errors.phoneNumber && <p className="mt-1 text-xs text-error">{errors.phoneNumber}</p>}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="branch" className="mb-1.5 block text-sm font-medium">Branch</label>
              <select id="branch" name="branch" value={form.branch} onChange={handleChange} className="input-field">
                <option value="">Select branch</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {errors.branch && <p className="mt-1 text-xs text-error">{errors.branch}</p>}
            </div>
            <div>
              <label htmlFor="academicYear" className="mb-1.5 block text-sm font-medium">Year</label>
              <select id="academicYear" name="academicYear" value={form.academicYear} onChange={handleChange} className="input-field">
                <option value="">Select year</option>
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y.value} value={y.value}>{y.label}</option>
                ))}
              </select>
              {errors.academicYear && <p className="mt-1 text-xs text-error">{errors.academicYear}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className="input-field pr-10"
                placeholder="Min. 6 characters"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-slate-200'}`} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-text-muted">{strength.label}</p>
              </div>
            )}
            {errors.password && <p className="mt-1 text-xs text-error">{errors.password}</p>}
          </div>

          <label className="flex items-start gap-2.5 text-sm text-text-secondary">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={form.acceptTerms}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span>I agree to the RideShare terms of service and campus ride-sharing guidelines</span>
          </label>
          {errors.acceptTerms && <p className="text-xs text-error">{errors.acceptTerms}</p>}

          <button type="submit" disabled={loading} className="btn-accent w-full py-3">
            {loading ? <LoadingSpinner size="sm" className="text-white" /> : (
              <><Check className="h-4 w-4" /> Create Account</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
