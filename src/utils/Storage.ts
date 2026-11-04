import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  accessToken: 'authToken',
  refreshToken: 'refreshToken',
  user: 'userData',
  permissions: 'userPermissions',
  appTheme: 'app_theme',
  attendanceState: 'attendance_state',
  attendanceDate: 'attendance_date',
} as const;

type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys] | string;

// In-memory cache for synchronous access throughout the application
let _accessToken: string | undefined;
let _refreshToken: string | undefined;
let _user: any = null;
let _permissions: any[] = [];

function safeParse<T>(value: string | null | undefined): T | null {
  if (value == null) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/** Call this once on app startup to warm the storage cache */
export async function warmTokenCache(): Promise<void> {
  try {
    const [access, refresh, userData, permData] = await AsyncStorage.multiGet([
      StorageKeys.accessToken,
      StorageKeys.refreshToken,
      StorageKeys.user,
      StorageKeys.permissions,
    ]);
    _accessToken = access[1] ?? undefined;
    _refreshToken = refresh[1] ?? undefined;
    _user = safeParse(userData[1]);
    _permissions = safeParse(permData[1]) || [];
  } catch {
    // Ignore — app continues without cached storage values
  }
}

export const storage = {
  // ─── Async helpers ────────────────────────────────────────────────────────

  async setStringAsync(key: StorageKey, value: string): Promise<void> {
    if (key === StorageKeys.accessToken) _accessToken = value;
    if (key === StorageKeys.refreshToken) _refreshToken = value;
    if (value != null) {
      await AsyncStorage.setItem(key, String(value));
    }
  },

  async getStringAsync(key: StorageKey): Promise<string | undefined> {
    const val = await AsyncStorage.getItem(key);
    return val ?? undefined;
  },

  async setJSONAsync<T>(key: StorageKey, value: T): Promise<void> {
    if (key === StorageKeys.user) _user = value;
    if (key === StorageKeys.permissions) _permissions = (value as any) || [];
    if (value !== undefined) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  },

  async getJSONAsync<T>(key: StorageKey): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return safeParse<T>(raw);
  },

  async remove(key: StorageKey): Promise<void> {
    if (key === StorageKeys.accessToken) _accessToken = undefined;
    if (key === StorageKeys.refreshToken) _refreshToken = undefined;
    if (key === StorageKeys.user) _user = null;
    if (key === StorageKeys.permissions) _permissions = [];
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    _accessToken = undefined;
    _refreshToken = undefined;
    _user = null;
    _permissions = [];
    await AsyncStorage.clear();
  },

  // ─── Sync Accessors ───────────────────────────────────────────────────────

  /** Synchronous — uses in-memory cache populated by warmTokenCache() */
  getAccessToken(): string | undefined {
    return _accessToken;
  },

  /** Synchronous — uses in-memory cache populated by warmTokenCache() */
  getRefreshToken(): string | undefined {
    return _refreshToken;
  },

  /** Synchronous — uses in-memory cache populated by warmTokenCache() */
  getUser<T extends object = Record<string, unknown>>(): T | null {
    return _user as T | null;
  },

  /** Synchronous — uses in-memory cache populated by warmTokenCache() */
  getPermissions<T = unknown>(): T[] {
    return _permissions || [];
  },

  // ─── Setter helper routines ───────────────────────────────────────────────

  async setTokens(tokens: { accessToken?: string; refreshToken?: string; access?: string; refresh?: string }): Promise<void> {
    const access = tokens.accessToken || tokens.access;
    const refresh = tokens.refreshToken || tokens.refresh;
    if (access) {
      _accessToken = access;
      await AsyncStorage.setItem(StorageKeys.accessToken, access);
    }
    if (refresh) {
      _refreshToken = refresh;
      await AsyncStorage.setItem(StorageKeys.refreshToken, refresh);
    }
  },

  async clearAuth(): Promise<void> {
    _accessToken = undefined;
    _refreshToken = undefined;
    _user = null;
    _permissions = [];
    await AsyncStorage.multiRemove([
      StorageKeys.accessToken,
      StorageKeys.refreshToken,
      StorageKeys.user,
      StorageKeys.permissions,
      'persist:auth',
    ]);
  },

  async setUser<T extends object = Record<string, unknown>>(user: T): Promise<void> {
    _user = user;
    if (user != null) {
      await AsyncStorage.setItem(StorageKeys.user, JSON.stringify(user));
    }
  },

  async getPersistedAuthToken(): Promise<string | undefined> {
    try {
      const persistedAuth = await AsyncStorage.getItem('persist:auth');
      if (persistedAuth) {
        const parsed = JSON.parse(persistedAuth);
        const access = parsed.access;
        if (typeof access === 'string' && access !== 'null' && access.trim() !== '') {
          return access;
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  },
};

/**
 * Storage engine for redux-persist — uses AsyncStorage directly.
 */
export const storageEngine = AsyncStorage;

export default storage;
