import { UserRole, Permission } from '../types';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  project_manager: 'Project Manager',
  team_lead: 'Team Lead',
  team_member: 'Team Member',
  viewer: 'Viewer',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  project_manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  team_lead: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  team_member: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  viewer: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export const PERMISSIONS: Record<UserRole, Permission> = {
  super_admin: {
    canViewUsers: true,
    canCreateUser: true,
    canEditUser: true,
    canDeactivateUser: true,
    canViewProjects: true,
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canViewActivity: true,
    canExportActivity: true,
    canViewAllData: true,
    canManageRoles: true,
  },
  project_manager: {
    canViewUsers: true,
    canCreateUser: true,
    canEditUser: true,
    canDeactivateUser: false,
    canViewProjects: true,
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: false,
    canViewActivity: true,
    canExportActivity: true,
    canViewAllData: false,
    canManageRoles: false,
  },
  team_lead: {
    canViewUsers: true,
    canCreateUser: false,
    canEditUser: false,
    canDeactivateUser: false,
    canViewProjects: true,
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: false,
    canViewActivity: true,
    canExportActivity: false,
    canViewAllData: false,
    canManageRoles: false,
  },
  team_member: {
    canViewUsers: false,
    canCreateUser: false,
    canEditUser: false,
    canDeactivateUser: false,
    canViewProjects: true,
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canViewActivity: false,
    canExportActivity: false,
    canViewAllData: false,
    canManageRoles: false,
  },
  viewer: {
    canViewUsers: false,
    canCreateUser: false,
    canEditUser: false,
    canDeactivateUser: false,
    canViewProjects: true,
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canViewActivity: false,
    canExportActivity: false,
    canViewAllData: false,
    canManageRoles: false,
  },
};

export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  on_hold: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  planning: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
export const DEFAULT_PAGE_SIZE = 10;
