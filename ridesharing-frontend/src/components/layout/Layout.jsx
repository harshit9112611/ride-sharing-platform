import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { useAuth } from '../../hooks/useAuth';
import { connectWebSocket, disconnectWebSocket } from '../../services/websocket';

export default function Layout() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connectWebSocket({
        onNewRide: (msg) => toast(`New ride posted: ${msg.sourceLocation} → ${msg.destinationLocation}`),
        onNewBooking: (msg) => toast.success(`New booking on your ride! ${msg.seatsBooked} seat(s)`),
        driverId: user.id
      });
    }
    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
