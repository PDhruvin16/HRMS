export interface AppPermission {
  resource: string;
  action: string;
}

export interface PermissionState {
  permissions: AppPermission[];
}
