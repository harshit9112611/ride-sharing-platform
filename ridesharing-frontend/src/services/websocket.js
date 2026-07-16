import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

let client = null;

export function connectWebSocket(onNewRide) {
  if (client?.active) return client;

  client = new Client({
    webSocketFactory: () => new SockJS(`${API_URL}/ws`),
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe('/topic/rides/new', (message) => {
        try {
          const ride = JSON.parse(message.body);
          onNewRide(ride);
        } catch {
          // ignore parse errors
        }
      });
    },
    onStompError: () => {
      client?.deactivate();
    },
  });

  client.activate();
  return client;
}

export function disconnectWebSocket() {
  if (client?.active) {
    client.deactivate();
  }
  client = null;
}
