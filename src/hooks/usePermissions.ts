import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setPermissions } from '../store/slices/permissionSlice';
// import { updateUser } from '../store/slices/authSlice';
// import usersApi from '../api/usersApi';
import socketService from '../services/SocketService';
import { normalizePermissions } from '../utils/permissionUtils';
import { RawModulePermission } from '../types/permission';

export const usePermissions = () => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.access);
  const userPermissions = useAppSelector((state) => state.auth.user?.permissions);

  const fetchPermissions = useCallback(async () => {
    if (!accessToken) return;

    try {
      if (userPermissions && Array.isArray(userPermissions) && userPermissions.length > 0) {
        dispatch(setPermissions(userPermissions));
        return;
      }

      // Mocked permissions response for HRMS App
      const res: any = [
        { module: 'dashboard', read: true, write: true },
        { module: 'leave', read: true, write: true },
        { module: 'attendance', read: true, write: true },
        { module: 'setting', read: true, write: true },
      ];
      console.log('🔐 [DEBUG] MOCK PERMISSIONS APPLIED:', JSON.stringify(res, null, 2));

      const permissionsData = Array.isArray(res) ? res : res?.data || [];

      if (permissionsData && Array.isArray(permissionsData) && permissionsData.length > 0) {
        const normalized = normalizePermissions(permissionsData as RawModulePermission[]);
        dispatch(setPermissions(normalized));
      }
    } catch (error) {
      console.error('[usePermissions] Error fetching permissions:', error);
    }
  }, [accessToken, userPermissions, dispatch]);

  // Explicitly trigger fetch on mount
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    const handlePermissionUpdate = () => {
      console.log(
        '[usePermissions] ⚡ IMMEDIATE SYNC TRIGGERED: Permission update received via WebSocket',
      );
      fetchPermissions();
    };

    socketService.on('system:permission_update', handlePermissionUpdate);

    return () => {
      socketService.off('system:permission_update', handlePermissionUpdate);
    };
  }, [fetchPermissions]);

  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[usePermissions] App came to foreground, refreshing permissions...');
        fetchPermissions();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [fetchPermissions]);

  return { fetchPermissions };
};

export default usePermissions;
