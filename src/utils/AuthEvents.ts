type AuthEventCallback = (...args: unknown[]) => void;

class AuthEventEmitter {
  private listeners: Record<string, AuthEventCallback[]> = {};

  on(event: string, callback: AuthEventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: AuthEventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== callback);
  }

  emit(event: string, ...args: unknown[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((callback) => callback(...args));
  }
}

const AuthEvents = new AuthEventEmitter();
export const AUTH_LOGOUT_EVENT = 'auth:logout';

export default AuthEvents;
