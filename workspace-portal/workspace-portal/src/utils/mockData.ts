import { AuthUser, Project, Activity, DashboardStats } from '../types';

export const MOCK_USERS: AuthUser[] = [
  {
    id: 'u1', name: 'Alex Carter', email: 'affu@workspace.io', password: 'admin123',
    role: 'super_admin', status: 'active', avatar: 'AC', department: 'Administration',
    lastActive: '2024-01-15T10:30:00Z', createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'u2', name: 'Maria Santos', email: 'afrid@workspace.io', password: 'pm123',
    role: 'project_manager', status: 'active', avatar: 'MS', department: 'Engineering',
    lastActive: '2024-01-15T09:15:00Z', createdAt: '2023-02-15T00:00:00Z',
  },
  {
    id: 'u3', name: 'James Wei', email: 'Affu@workspace.io', password: 'lead123',
    role: 'team_lead', status: 'active', avatar: 'JW', department: 'Design',
    lastActive: '2024-01-14T16:45:00Z', createdAt: '2023-03-10T00:00:00Z',
  },
  {
    id: 'u4', name: 'Priya Patel', email: 'msd@workspace.io', password: 'member123',
    role: 'team_member', status: 'active', avatar: 'PP', department: 'Engineering',
    lastActive: '2024-01-15T08:00:00Z', createdAt: '2023-04-20T00:00:00Z',
  },
  {
    id: 'u5', name: 'Lucas Oliveira', email: 'thala@workspace.io', password: 'view123',
    role: 'viewer', status: 'active', avatar: 'LO', department: 'Sales',
    lastActive: '2024-01-13T14:00:00Z', createdAt: '2023-05-05T00:00:00Z',
  },
  {
    id: 'u6', name: 'Sara Mitchell', email: 'sara@workspace.io', password: 'sara123',
    role: 'team_member', status: 'inactive', avatar: 'SM', department: 'Marketing',
    lastActive: '2024-01-10T11:00:00Z', createdAt: '2023-06-01T00:00:00Z',
  },
  {
    id: 'u7', name: 'Tom Nguyen', email: 'tom@workspace.io', password: 'tom123',
    role: 'project_manager', status: 'active', avatar: 'TN', department: 'Product',
    lastActive: '2024-01-15T07:45:00Z', createdAt: '2023-07-12T00:00:00Z',
  },
  {
    id: 'u8', name: 'Anya Kovač', email: 'anya@workspace.io', password: 'anya123',
    role: 'team_lead', status: 'active', avatar: 'AK', department: 'QA',
    lastActive: '2024-01-14T15:20:00Z', createdAt: '2023-08-08T00:00:00Z',
  },
  {
    id: 'u9', name: 'Ben Franklin', email: 'ben@workspace.io', password: 'ben123',
    role: 'team_member', status: 'pending', avatar: 'BF', department: 'Engineering',
    lastActive: '2024-01-12T09:30:00Z', createdAt: '2023-09-15T00:00:00Z',
  },
  {
    id: 'u10', name: 'Chloe Dumont', email: 'chloe@workspace.io', password: 'chloe123',
    role: 'viewer', status: 'active', avatar: 'CD', department: 'Finance',
    lastActive: '2024-01-11T13:00:00Z', createdAt: '2023-10-01T00:00:00Z',
  },
  {
    id: 'u11', name: 'Omar Hassan', email: 'omar@workspace.io', password: 'omar123',
    role: 'team_member', status: 'active', avatar: 'OH', department: 'Engineering',
    lastActive: '2024-01-15T10:00:00Z', createdAt: '2023-11-05T00:00:00Z',
  },
  {
    id: 'u12', name: 'Isabella Ross', email: 'isabella@workspace.io', password: 'isa123',
    role: 'team_lead', status: 'active', avatar: 'IR', department: 'Design',
    lastActive: '2024-01-14T17:00:00Z', createdAt: '2023-12-01T00:00:00Z',
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1', name: 'Platform Redesign', description: 'Complete overhaul of the main platform UI/UX',
    ownerId: 'u2', ownerName: 'Maria Santos', status: 'active', priority: 'critical',
    dueDate: '2024-03-31', startDate: '2024-01-01', progress: 45,
    teamIds: ['u3', 'u4', 'u11'], tags: ['frontend', 'design', 'ux'],
    createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-14T00:00:00Z',
  },
  {
    id: 'p2', name: 'API v3 Development', description: 'Next generation REST API with GraphQL support',
    ownerId: 'u7', ownerName: 'Tom Nguyen', status: 'active', priority: 'high',
    dueDate: '2024-04-15', startDate: '2024-01-10', progress: 30,
    teamIds: ['u4', 'u9', 'u11'], tags: ['backend', 'api', 'graphql'],
    createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'p3', name: 'Mobile App Launch', description: 'iOS and Android app for end users',
    ownerId: 'u2', ownerName: 'Maria Santos', status: 'planning', priority: 'high',
    dueDate: '2024-06-30', startDate: '2024-02-01', progress: 10,
    teamIds: ['u3', 'u8', 'u12'], tags: ['mobile', 'ios', 'android'],
    createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'p4', name: 'Data Analytics Dashboard', description: 'Business intelligence and reporting module',
    ownerId: 'u7', ownerName: 'Tom Nguyen', status: 'completed', priority: 'medium',
    dueDate: '2024-01-10', startDate: '2023-10-01', progress: 100,
    teamIds: ['u4', 'u6'], tags: ['analytics', 'reporting', 'bi'],
    createdAt: '2023-10-01T00:00:00Z', updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'p5', name: 'Security Audit 2024', description: 'Annual security assessment and hardening',
    ownerId: 'u1', ownerName: 'Alex Carter', status: 'active', priority: 'critical',
    dueDate: '2024-02-28', startDate: '2024-01-15', progress: 20,
    teamIds: ['u3', 'u8'], tags: ['security', 'compliance', 'audit'],
    createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'p6', name: 'Customer Portal', description: 'Self-service customer management portal',
    ownerId: 'u2', ownerName: 'Maria Santos', status: 'on_hold', priority: 'medium',
    dueDate: '2024-05-31', startDate: '2023-12-01', progress: 60,
    teamIds: ['u4', 'u9', 'u11'], tags: ['customer', 'portal', 'frontend'],
    createdAt: '2023-12-01T00:00:00Z', updatedAt: '2024-01-08T00:00:00Z',
  },
  {
    id: 'p7', name: 'DevOps Pipeline', description: 'CI/CD improvements and infrastructure automation',
    ownerId: 'u7', ownerName: 'Tom Nguyen', status: 'active', priority: 'high',
    dueDate: '2024-03-15', startDate: '2024-01-08', progress: 55,
    teamIds: ['u9', 'u11'], tags: ['devops', 'ci-cd', 'infrastructure'],
    createdAt: '2024-01-08T00:00:00Z', updatedAt: '2024-01-14T00:00:00Z',
  },
  {
    id: 'p8', name: 'Legacy Migration', description: 'Migrating legacy PHP systems to Node.js',
    ownerId: 'u2', ownerName: 'Maria Santos', status: 'cancelled', priority: 'low',
    dueDate: '2024-01-31', startDate: '2023-11-01', progress: 25,
    teamIds: ['u4'], tags: ['migration', 'backend', 'legacy'],
    createdAt: '2023-11-01T00:00:00Z', updatedAt: '2024-01-05T00:00:00Z',
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1', userId: 'u1', userName: 'Alex Carter', action: 'login', module: 'auth',
    description: 'Logged into the system', timestamp: '2024-01-15T10:30:00Z', status: 'success',
  },
  {
    id: 'a2', userId: 'u2', userName: 'Maria Santos', action: 'created', module: 'projects',
    description: 'Created project "Security Audit 2024"', timestamp: '2024-01-15T10:00:00Z', status: 'success',
  },
  {
    id: 'a3', userId: 'u1', userName: 'Alex Carter', action: 'created', module: 'users',
    description: 'Added new user Omar Hassan', timestamp: '2024-01-15T09:45:00Z', status: 'success',
  },
  {
    id: 'a4', userId: 'u7', userName: 'Tom Nguyen', action: 'updated', module: 'projects',
    description: 'Updated project "API v3 Development" progress to 30%', timestamp: '2024-01-15T09:30:00Z', status: 'success',
  },
  {
    id: 'a5', userId: 'u3', userName: 'James Wei', action: 'login', module: 'auth',
    description: 'Logged into the system', timestamp: '2024-01-15T08:45:00Z', status: 'success',
  },
  {
    id: 'a6', userId: 'u4', userName: 'Priya Patel', action: 'updated', module: 'projects',
    description: 'Updated task status in "Platform Redesign"', timestamp: '2024-01-14T17:30:00Z', status: 'success',
  },
  {
    id: 'a7', userId: 'u1', userName: 'Alex Carter', action: 'deactivated', module: 'users',
    description: 'Deactivated user Sara Mitchell', timestamp: '2024-01-14T16:00:00Z', status: 'warning',
  },
  {
    id: 'a8', userId: 'u2', userName: 'Maria Santos', action: 'exported', module: 'activity',
    description: 'Exported activity log to CSV', timestamp: '2024-01-14T15:00:00Z', status: 'success',
  },
  {
    id: 'a9', userId: 'u8', userName: 'Anya Kovač', action: 'completed', module: 'projects',
    description: 'Marked QA phase as complete in "Platform Redesign"', timestamp: '2024-01-14T14:30:00Z', status: 'success',
  },
  {
    id: 'a10', userId: 'u9', userName: 'Ben Franklin', action: 'login', module: 'auth',
    description: 'Failed login attempt (wrong password)', timestamp: '2024-01-14T13:00:00Z', status: 'error',
  },
  {
    id: 'a11', userId: 'u7', userName: 'Tom Nguyen', action: 'created', module: 'projects',
    description: 'Created project "DevOps Pipeline"', timestamp: '2024-01-13T11:00:00Z', status: 'success',
  },
  {
    id: 'a12', userId: 'u12', userName: 'Isabella Ross', action: 'updated', module: 'users',
    description: 'Updated profile information', timestamp: '2024-01-13T10:30:00Z', status: 'success',
  },
  {
    id: 'a13', userId: 'u2', userName: 'Maria Santos', action: 'deleted', module: 'projects',
    description: 'Cancelled project "Legacy Migration"', timestamp: '2024-01-12T16:00:00Z', status: 'warning',
  },
  {
    id: 'a14', userId: 'u1', userName: 'Alex Carter', action: 'activated', module: 'users',
    description: 'Activated user Ben Franklin', timestamp: '2024-01-12T14:00:00Z', status: 'success',
  },
  {
    id: 'a15', userId: 'u3', userName: 'James Wei', action: 'assigned', module: 'projects',
    description: 'Assigned Priya Patel to "Platform Redesign"', timestamp: '2024-01-11T10:00:00Z', status: 'success',
  },
  {
    id: 'a16', userId: 'u4', userName: 'Priya Patel', action: 'login', module: 'auth',
    description: 'Logged into the system', timestamp: '2024-01-15T08:00:00Z', status: 'success',
  },
  {
    id: 'a17', userId: 'u11', userName: 'Omar Hassan', action: 'updated', module: 'projects',
    description: 'Submitted code review for "API v3 Development"', timestamp: '2024-01-15T09:15:00Z', status: 'success',
  },
  {
    id: 'a18', userId: 'u5', userName: 'Lucas Oliveira', action: 'login', module: 'auth',
    description: 'Logged into the system', timestamp: '2024-01-13T14:00:00Z', status: 'success',
  },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalUsers: 12,
  activeProjects: 5,
  completedProjects: 1,
  totalActivities: 18,
  teamPerformance: 82,
  monthlyActivity: [
    { month: 'Aug', activities: 45, projects: 3 },
    { month: 'Sep', activities: 62, projects: 4 },
    { month: 'Oct', activities: 78, projects: 5 },
    { month: 'Nov', activities: 55, projects: 3 },
    { month: 'Dec', activities: 91, projects: 6 },
    { month: 'Jan', activities: 110, projects: 8 },
  ],
  projectsByStatus: [
    { status: 'active', count: 5 },
    { status: 'planning', count: 1 },
    { status: 'on_hold', count: 1 },
    { status: 'completed', count: 1 },
    { status: 'cancelled', count: 1 },
  ],
  recentActivities: [],
};
