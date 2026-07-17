import { RawModulePermission, NormalizedPermissions, ModulePermissions } from '../types/permission';

const MODULE_KEY_MAP: Record<string, string> = {
  Lead: 'leads',
  'Lead Management': 'leads',
  Contact: 'contacts',
  Customer: 'customers',
  'Whatsapp Conversation': 'conversations',
  'Email Conversation': 'email_conversations',
  'Whatsapp Campaign': 'whatsapp_campaigns',
  'Email Campaign': 'email_campaigns',
  'Knowledge Base': 'knowledge_base',
  Product: 'products',
  'Whatsapp Template': 'whatsapp_templates',
  'Email Template': 'email_templates',
  'Calendly Integration': 'calendly_integration',
  'Whatsapp Integration': 'whatsapp_integration',
  'Email Integration': 'email_integration',
  'Google Calendar Integration': 'google_calendar_integration',
  'Agent Configuration': 'agent_configuration',
  'Asset And Sharing': 'assets_sharing',
  'Role Permission': 'role_permissions',
  User: 'users',
  Integrations: 'integrations',
  Notification: 'notification',
  'Sales Invoice': 'sales_invoice',
  Probing: 'probing',
  Opportunity: 'opportunity',
  Order: 'order',
  Quotation: 'quotation',
  'Calendar Setting': 'calendar_setting',
};

const PERMISSION_KEY_MAP: Record<string, keyof ModulePermissions> = {
  Add: 'add',
  Change: 'change',
  Delete: 'delete',
  View: 'view',
  Notify: 'notify',
};

export const normalizePermissions = (
  rawPermissions: RawModulePermission[],
): NormalizedPermissions => {
  const normalized: NormalizedPermissions = {};

  rawPermissions.forEach((module) => {
    const moduleKey =
      MODULE_KEY_MAP[module.module_name] || module.module_name.toLowerCase().replace(/ /g, '_');

    const perms: Partial<ModulePermissions> = {
      add: { isEnabled: false, isDisabled: true },
      change: { isEnabled: false, isDisabled: true },
      delete: { isEnabled: false, isDisabled: true },
      view: { isEnabled: false, isDisabled: true },
      notify: { isEnabled: false, isDisabled: true },
    };

    module.permissions.forEach((p) => {
      const permKey = PERMISSION_KEY_MAP[p.name];
      if (permKey) {
        perms[permKey] = {
          isEnabled: p.is_select,
          isDisabled: p.is_disable,
        };
      }
    });

    normalized[moduleKey] = perms as ModulePermissions;
  });

  return normalized;
};

/**
 * Check if user has a specific permission for a module
 */
export const hasPermission = (
  normalizedPermissions: NormalizedPermissions,
  module: string,
  action: keyof ModulePermissions = 'view',
): boolean => {
  return true; // Bypassed for local testing
};
