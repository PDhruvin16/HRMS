import storage from '../utils/Storage';
import { API_ENDPOINTS } from '../api/endpoints';

export enum SocketStatus {
  CONNECTED = 'CONNECTED',
  CONNECTING = 'CONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}

type SocketListener = (data: unknown) => void;

class BaseSocket {
  private socket: WebSocket | null = null;
  private status: SocketStatus = SocketStatus.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 2000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Record<string, SocketListener[]> = {};
  private url: string;
  private name: string;

  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
  }

  getUrl() {
    return this.url;
  }

  getStatus() {
    return this.status;
  }

  on(event: string, callback: SocketListener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    if (!this.listeners[event].includes(callback)) {
      this.listeners[event].push(callback);
    }
  }

  off(event: string, callback: SocketListener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== callback);
  }

  private emit(event: string, data: unknown) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  private setStatus(status: SocketStatus) {
    this.status = status;
    this.emit('statusChange', { name: this.name, status });
  }

  connect() {
    if (this.socket) {
      this.disconnect();
    }

    this.setStatus(SocketStatus.CONNECTING);

    try {
      console.log(`[SocketService:${this.name}] 🟡 Connecting to:`, this.url);
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log(`[SocketService:${this.name}] 🟢 Connected`);
        this.setStatus(SocketStatus.CONNECTED);
        this.reconnectAttempts = 0;
        this.reconnectDelay = 2000;
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`[SocketService:${this.name}] 📩 Message received:`, data);
          this.emit('message', data);
          if (data.type && data.type !== 'message') {
            this.emit(data.type, data.payload || data.data || data);
          }
        } catch (err) {
          console.error(`[Socket:${this.name}] Error parsing message:`, err);
        }
      };

      this.socket.onerror = (error) => {
        console.error(`[Socket:${this.name}] Error:`, error);
        this.setStatus(SocketStatus.ERROR);
      };

      this.socket.onclose = (event) => {
        console.log(`[Socket:${this.name}] Closed:`, event.code, event.reason);
        this.setStatus(SocketStatus.DISCONNECTED);
        this.handleReconnect();
      };
    } catch (err) {
      console.error(`[Socket:${this.name}] Connection failed:`, err);
      this.setStatus(SocketStatus.ERROR);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[Socket:${this.name}] Max reconnect attempts reached`);
      return;
    }

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    }, this.reconnectDelay);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }

    this.setStatus(SocketStatus.DISCONNECTED);
  }

  send(data: unknown) {
    if (this.socket && this.status === SocketStatus.CONNECTED) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn(`[Socket:${this.name}] Cannot send, not connected`);
    }
  }
}

class SocketService {
  private sockets: Map<string, BaseSocket> = new Map();
  private globalListeners: Record<string, SocketListener[]> = {};
  // Track listeners registered for specific sockets (e.g. 'system:etl_tracker_update')
  private registry: Map<string, Set<SocketListener>> = new Map();

  getStatus() {
    return this.sockets.get('system')?.getStatus() || SocketStatus.DISCONNECTED;
  }

  on(event: string, callback: SocketListener) {
    if (!this.registry.has(event)) {
      this.registry.set(event, new Set());
    }
    this.registry.get(event)!.add(callback);

    // If it's a statusChange, handle it specially (it's often global)
    if (event === 'statusChange') {
      if (!this.globalListeners[event]) this.globalListeners[event] = [];
      this.globalListeners[event].push(callback);
    }

    // Attach to existing socket if available
    const [socketName, eventName] = event.includes(':') ? event.split(':') : ['system', event];
    const socket = this.sockets.get(socketName);
    if (socket) {
      socket.on(eventName || event, callback);
    }
  }

  off(event: string, callback: SocketListener) {
    if (this.registry.has(event)) {
      this.registry.get(event)!.delete(callback);
    }

    if (event === 'statusChange') {
      if (this.globalListeners[event]) {
        this.globalListeners[event] = this.globalListeners[event].filter((l) => l !== callback);
      }
    }

    const [socketName, eventName] = event.includes(':') ? event.split(':') : ['system', event];
    this.sockets.get(socketName)?.off(eventName || event, callback);
  }

  connect(name: string = 'system', customUrl?: string) {
    const token = storage.getAccessToken();
    if (token === 'mock-access-token') {
      console.log(`[SocketService] 🔌 Bypassing socket connection for ${name} during mock testing.`);
      return;
    }

    let url = customUrl;

    if (!url) {
      const user = storage.getUser<{ tenant?: { id: string } }>();
      const tenantId = user?.tenant?.id;

      if (!token || !tenantId) {
        console.warn(
          `[SocketService:${name}] ❌ Cannot connect: Missing ${!token ? 'token' : ''}${
            !token && !tenantId ? ' and ' : ''
          }${!tenantId ? 'tenantId' : ''}`,
        );
        return;
      }

      const api = API_ENDPOINTS.API as any;
      if (name === 'system' && api.SYSTEM_STATUS) {
        url = api.SYSTEM_STATUS.WEBSOCKET_URL(tenantId, token);
      } else if (name === 'conversations' && api.CONVERSATIONS) {
        url = api.CONVERSATIONS.CONTACT_SOCKET(tenantId, token);
      } else if (name === 'email_conversations' && api.EMAIL_CONVERSATION_SOCKET) {
        url = api.EMAIL_CONVERSATION_SOCKET.EMAIL_CONVERSATION_WEBSOCKET_URL(
          tenantId,
          token,
        );
      } else if (name === 'email_trail_updates') {
        // Requires customUrl in most cases as it needs trailId
      } else if (name === 'email_messages') {
        // Requires customUrl in most cases as it needs expandedTrailId
      } else if (name === 'notifications' && api.NOTIFICATION) {
        url = api.NOTIFICATION.WEBSOCKET_URL(tenantId, token);
      } else if (name === 'setup_wizard' && api.QUICK_START) {
        url = api.QUICK_START.SETUP_WIZARD_SOCKET(tenantId, token);
      }
    }

    if (!url) {
      console.error(`[SocketService] No URL found for socket: ${name}`);
      return;
    }

    // Don't reconnect if the EXACT same socket URL is already connected or connecting
    const existing = this.sockets.get(name);
    if (existing) {
      const status = existing.getStatus();
      const existingUrl = existing.getUrl();

      // If status is active AND URL is the same, just re-attach listeners if needed
      if (
        (status === SocketStatus.CONNECTED || status === SocketStatus.CONNECTING) &&
        existingUrl === url
      ) {
        // Already connected with correct URL — just re-attach any pending registry listeners
        this.registry.forEach((listeners, fullEventName) => {
          const [sName, eName] = fullEventName.includes(':')
            ? fullEventName.split(':')
            : ['system', fullEventName];
          if (sName === name) {
            listeners.forEach((cb) => existing.on(eName || fullEventName, cb));
          }
        });
        return existing;
      }

      // If URL changed or status is disconnected/error, drop old socket and start over
      console.log(`[SocketService:${name}] 🔄 URL changed or status bad, forcing reconnect...`);
      existing.disconnect();
      this.sockets.delete(name);
    }

    const socket = new BaseSocket(name, url);

    // Propagate statusChange to global listeners
    socket.on('statusChange', (data) => {
      this.globalListeners.statusChange?.forEach((cb) => cb(data));
    });

    this.sockets.set(name, socket);

    // CRITICAL: Re-attach all existing listeners from the registry for this specific socket name
    this.registry.forEach((listeners, fullEventName) => {
      const [sName, eName] = fullEventName.includes(':')
        ? fullEventName.split(':')
        : ['system', fullEventName];

      if (sName === name) {
        listeners.forEach((cb) => socket.on(eName || fullEventName, cb));
      }
    });

    socket.connect();
    return socket;
  }

  disconnect(name?: string) {
    if (name) {
      this.sockets.get(name)?.disconnect();
      this.sockets.delete(name);
    } else {
      this.sockets.forEach((s) => s.disconnect());
      this.sockets.clear();
    }
  }

  send(data: unknown, name: string = 'system') {
    this.sockets.get(name)?.send(data);
  }

  getSocket(name: string): BaseSocket | undefined {
    return this.sockets.get(name);
  }
}

export const socketService = new SocketService();
export default socketService;
