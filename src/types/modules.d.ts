import React from 'react';

declare module '@react-native-community/geolocation' {
  export interface GeolocationResponse {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }

  export interface GeolocationError {
    code: number;
    message: string;
    PERMISSION_DENIED: number;
    POSITION_UNAVAILABLE: number;
    TIMEOUT: number;
  }

  export interface GeolocationConfig {
    skipPermissionRequests?: boolean;
    authorizationLevel?: 'always' | 'whenInUse';
    locationProvider?: 'playServices' | 'android' | 'auto';
  }

  export interface GeolocationOptions {
    timeout?: number;
    maximumAge?: number;
    enableHighAccuracy?: boolean;
    distanceFilter?: number;
    useSignificantChanges?: boolean;
    interval?: number;
    fastestInterval?: number;
  }

  export default class Geolocation {
    static getCurrentPosition(
      success: (position: GeolocationResponse) => void,
      error?: (error: GeolocationError) => void,
      options?: GeolocationOptions,
    ): void;
    static watchPosition(
      success: (position: GeolocationResponse) => void,
      error?: (error: GeolocationError) => void,
      options?: GeolocationOptions,
    ): number;
    static clearWatch(watchID: number): void;
    static stopObserving(): void;
    static requestAuthorization(success?: () => void, error?: () => void): void;
    static setConfiguration(config: GeolocationConfig): void;
  }
}

declare module 'react-native-vision-camera' {
  export class Camera extends React.Component<Record<string, unknown>> {}
}

declare module 'events' {
  export class EventEmitter {
    addListener(event: string, listener: (...args: unknown[]) => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
    once(event: string, listener: (...args: unknown[]) => void): this;
    removeListener(event: string, listener: (...args: unknown[]) => void): this;
    off(event: string, listener: (...args: unknown[]) => void): this;
    emit(event: string, ...args: unknown[]): boolean;
  }
}

declare module '@react-native-documents/picker' {
  export interface DocumentPickerResponse {
    uri: string;
    name: string | null;
    type: string | null;
    mimeType: string | null;
    size: number | null;
    fileCopyUri: string | null;
  }

  export const types: Record<string, string>;
  export function pick(options: {
    type?: string[];
    allowMultiSelection?: boolean;
  }): Promise<DocumentPickerResponse[]>;
  export function isCancel(err: unknown): boolean;
}

declare module 'react-native-calendars' {
  export interface DateData {
    year: number;
    month: number;
    day: number;
    timestamp: number;
    dateString: string;
  }

  export interface MarkedDate {
    selected?: boolean;
    selectedColor?: string;
    selectedTextColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
  }

  export interface CalendarProps {
    current?: string;
    hideExtraDays?: boolean;
    hideArrows?: boolean;
    renderHeader?: (date: Date) => React.ReactNode;
    onDayPress?: (day: DateData) => void;
    markedDates?: Record<string, MarkedDate>;
    theme?: Record<string, unknown>;
  }

  export class Calendar extends React.Component<CalendarProps> {}
}

