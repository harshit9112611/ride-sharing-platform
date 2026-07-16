const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

export function validateEmail(email) {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Enter a valid college email';
  return '';
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return '';
}

export function validatePhone(phone) {
  if (!phone) return 'Phone number is required';
  if (!PHONE_REGEX.test(phone)) return 'Phone must be exactly 10 digits';
  return '';
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'bg-slate-200' };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-error' };
  if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-warning' };
  if (score <= 4) return { score: 3, label: 'Good', color: 'bg-accent' };
  return { score: 4, label: 'Strong', color: 'bg-success' };
}

export function validateRegisterForm(data) {
  const errors = {};

  if (!data.fullName?.trim()) errors.fullName = 'Full name is required';
  const emailError = validateEmail(data.collegeEmail);
  if (emailError) errors.collegeEmail = emailError;
  if (!data.enrollmentNumber?.trim()) errors.enrollmentNumber = 'Enrollment number is required';
  if (!data.branch) errors.branch = 'Select your branch';
  if (!data.academicYear || data.academicYear < 1 || data.academicYear > 4) {
    errors.academicYear = 'Select a valid year (1–4)';
  }
  const phoneError = validatePhone(data.phoneNumber);
  if (phoneError) errors.phoneNumber = phoneError;
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  if (!data.acceptTerms) errors.acceptTerms = 'You must accept the terms';

  return errors;
}

export function validateRideForm(data) {
  const errors = {};

  if (!data.sourceLocation) errors.sourceLocation = 'Select a pickup location';
  if (!data.destinationLocation) errors.destinationLocation = 'Select a destination';
  if (!data.departureDate) errors.departureDate = 'Date is required';
  if (!data.departureTime) errors.departureTime = 'Time is required';
  if (!data.availableSeats || data.availableSeats < 1) {
    errors.availableSeats = 'At least 1 seat required';
  }
  if (data.rideType === 'FUEL_SHARING' && (!data.price || data.price <= 0)) {
    errors.price = 'Enter a valid fuel share amount';
  }

  return errors;
}
