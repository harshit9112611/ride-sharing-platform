import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  isPushSupported,
  isSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
} from '../../services/pushService';

export default function NotificationButton() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!isPushSupported()) {
        setSupported(false);
        return;
      }
      setSupported(true);
      const subbed = await isSubscribed();
      setSubscribed(subbed);
    };
    check();
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
        toast.success('Notifications disabled');
      } else {
        await subscribeToPush();
        setSubscribed(true);
        toast.success('Notifications enabled!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface-hover"
      title={subscribed ? 'Disable notifications' : 'Enable notifications'}
    >
      {subscribed ? <Bell className="h-4 w-4 text-accent" /> : <BellOff className="h-4 w-4" />}
      <span className="hidden sm:inline">
        {subscribed ? 'Notifications On' : 'Enable Notifications'}
      </span>
    </button>
  );
}