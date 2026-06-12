// ─── User & Auth ────────────────────────────────────────────────────────────
export type UserRole = 'super_admin' | 'project_manager' | 'team_lead' | 'team_member' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  department: string;
  lastActive: string;
  createdAt: string;
}

export interface AuthUser extends User {
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ─── Project ─────────────────────────────────────────────────────────────────
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled' | 'planning';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate: string;
  startDate: string;
  progress: number;
  teamIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Activity ─────────────────────────────────────────────────────────────────
export type ActivityAction =
  | 'created' | 'updated' | 'deleted' | 'login' | 'logout'
  | 'assigned' | 'completed' | 'exported' | 'deactivated' | 'activated';
export type ActivityModule = 'auth' | 'users' | 'projects' | 'activity' | 'dashboard' | 'settings';
export type ActivityStatus = 'success' | 'warning' | 'error';

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  module: ActivityModule;
  description: string;
  timestamp: string;
  status: ActivityStatus;
  metadata?: Record<string, string>;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  activeProjects: number;
  completedProjects: number;
  totalActivities: number;
  teamPerformance: number;
  monthlyActivity: MonthlyActivity[];
  projectsByStatus: ProjectStatusCount[];
  recentActivities: Activity[];
}

export interface MonthlyActivity {
  month: string;
  activities: number;
  projects: number;
}

export interface ProjectStatusCount {
  status: ProjectStatus;
  count: number;
}

// ─── Permissions ─────────────────────────────────────────────────────────────
export interface Permission {
  canViewUsers: boolean;
  canCreateUser: boolean;
  canEditUser: boolean;
  canDeactivateUser: boolean;
  canViewProjects: boolean;
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canViewActivity: boolean;
  canExportActivity: boolean;
  canViewAllData: boolean;
  canManageRoles: boolean;
}

// ─── UI ───────────────────────────────────────────────────────────────────────
export interface SidebarItem {
  icon: string;
  label: string;
  path: string;
  roles: UserRole[];
  badge?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// ─── Form Types ───────────────────────────────────────────────────────────────
export interface LoginFormData {
  email: string;
  password: string;
}

export interface CreateUserFormData {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  password: string;
}

export interface CreateProjectFormData {
  name: string;
  description: string;
  ownerId: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate: string;
  startDate: string;
  tags: string;
}

// ─── Theme ────────────────────────────────────────────────────────────────────
export type Theme = 'light' | 'dark';
