/**
 * Network Helper - Handles network bridge and connectivity issues
 * Provides utilities to detect and recover from network failures
 */

import log from './Logger';
import { Platform } from 'react-native';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: 'none' | 'unknown' | 'cellular' | 'wifi' | 'bluetooth' | 'ethernet' | 'vpn' | 'other';
}

class NetworkHelper {
  private static instance: NetworkHelper;
  private networkState: NetworkStatus = {
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  };

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): NetworkHelper {
    if (!NetworkHelper.instance) {
      NetworkHelper.instance = new NetworkHelper();
    }
    return NetworkHelper.instance;
  }

  private initializeNetworkListener(): void {
    try {
      // Dynamically import NetInfo only when needed
      // This is optional - the app will work even if it's not available
      Promise.resolve()
        .then(() => require('@react-native-community/netinfo'))
        .then((NetInfo: any) => {
          // Subscribe to network state updates
          NetInfo.fetch().then((state: any) => {
            this.updateNetworkState(state);
          });

          NetInfo.addEventListener(
            (state: any) => {
              this.updateNetworkState(state);
            },
          );
        })
        .catch((error: unknown) => {
          if (__DEV__) {
            log.warn('NetInfo not available (optional):', error);
          }
        });
    } catch (error) {
      if (__DEV__) {
        log.warn('Failed to initialize network listener:', error);
      }
    }
  }

  private updateNetworkState(state: any): void {
    this.networkState = {
      isConnected: state.isConnected ?? true,
      isInternetReachable: state.isInternetReachable,
      type: (state.type as NetworkStatus['type']) ?? 'unknown',
    };

    if (__DEV__) {
      log.debug('📡 Network State Updated:', this.networkState);
    }
  }

  /**
   * Get current network status
   */
  getNetworkStatus(): NetworkStatus {
    return this.networkState;
  }

  /**
   * Check if device has active internet connection
   */
  isOnline(): boolean {
    return this.networkState.isConnected && this.networkState.isInternetReachable !== false;
  }

  /**
   * Check if we're on cellular data
   */
  isCellular(): boolean {
    return this.networkState.type === 'cellular';
  }

  /**
   * Get network type
   */
  getNetworkType(): string {
    return this.networkState.type;
  }

  /**
   * Wait for network to be available
   * Used for retry logic after network failures
   */
  async waitForNetwork(timeoutMs: number = 10000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      if (this.isOnline()) {
        log.debug('✅ Network available');
        return true;
      }

      // Wait 500ms before checking again
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    }

    log.warn(`⏱️ Network timeout after ${timeoutMs}ms`);
    return false;
  }

  /**
   * Diagnose network connectivity issues
   * Returns detailed information for debugging
   */
  diagnose(): {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    networkType: string;
    platform: string;
    recommendation: string;
  } {
    const status = this.getNetworkStatus();
    let recommendation = '';

    if (!status.isConnected) {
      recommendation = '📱 Device is not connected to a network. Enable WiFi or cellular data.';
    } else if (status.isInternetReachable === false) {
      recommendation =
        '🔌 Connected to network but no internet access. Check your WiFi/data connection.';
    } else if (status.isInternetReachable === null) {
      recommendation =
        '⚠️ Internet reachability unknown. Try toggling network on/off or restarting the app.';
    } else {
      recommendation = '✅ Network looks good. The issue might be with the API server.';
    }

    return {
      isConnected: status.isConnected,
      isInternetReachable: status.isInternetReachable,
      networkType: status.type,
      platform: Platform.OS,
      recommendation,
    };
  }
}

export const networkHelper = NetworkHelper.getInstance();

export default networkHelper;
