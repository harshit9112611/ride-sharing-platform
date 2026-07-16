import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={`animate-spin text-accent ${sizes[size]} ${className}`}
      aria-label="Loading"
    />
  );
}
