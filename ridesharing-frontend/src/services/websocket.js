import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

let client = null;
let newRideSub = null;
let newBookingSub = null;

export function connectWebSocket(options) {
  if (client?.active) return client;

  // Handle backwards compatibility (when passed a single function from SearchRides.jsx)
  let onNewRide, onNewBooking, driverId;
  if (typeof options === 'function') {
    onNewRide = options;
  } else if (options) {
    ({ onNewRide, onNewBooking, driverId } = options);
  }

  client = new Client({
    webSocketFactory: () => new SockJS(`${API_URL}/ws`),
    reconnectDelay: 5000,
    onConnect: () => {
      if (onNewRide) {
        newRideSub = client.subscribe('/topic/rides/new', (message) => {
          try {
            const ride = JSON.parse(message.body);
            onNewRide(ride);
          } catch {
            // ignore parse errors
          }
        });
      }
      if (driverId && onNewBooking) {
        newBookingSub = client.subscribe(`/topic/driver/${driverId}/bookings`, (message) => {
          try {
            const booking = JSON.parse(message.body);
            onNewBooking(booking);
          } catch {
            // ignore parse errors
          }
        });
      }
    },
    onStompError: () => {
      client?.deactivate();
    },
  });

  client.activate();
  return client;
}

export function disconnectWebSocket() {
  if (newRideSub) {
    newRideSub.unsubscribe();
    newRideSub = null;
  }
  if (newBookingSub) {
    newBookingSub.unsubscribe();
    newBookingSub = null;
  }
  if (client?.active) {
    client.deactivate();
  }
  client = null;
}
