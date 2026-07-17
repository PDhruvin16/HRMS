import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { AppPermission, PermissionState } from '../../types/permission';

const initialState: PermissionState = {
  permissions: [],
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    setPermissions: (state, action: PayloadAction<AppPermission[]>) => {
      state.permissions = action.payload;
    },
    clearPermissions: (state) => {
      state.permissions = [];
    },
  },
});

export const { setPermissions, clearPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;
