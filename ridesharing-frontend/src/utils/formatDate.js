export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(dateStr, timeStr) {
  return `${formatDate(dateStr)} · ${formatTime(timeStr)}`;
}

export function toInputDate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

export function getRelativeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
