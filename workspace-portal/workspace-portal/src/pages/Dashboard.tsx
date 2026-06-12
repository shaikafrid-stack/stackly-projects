import React from 'react';
import { Users, FolderOpen, Activity, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { StatCard, Avatar, ProgressBar, StatusBadge, PriorityBadge, SkeletonCard } from '../components/ui';
import { formatRelativeTime, getActionLabel } from '../utils/helpers';
import { MOCK_DASHBOARD_STATS } from '../utils/mockData';
import { PERMISSIONS } from '../constants';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

const Dashboard: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: appState } = useApp();
  const user = authState.user!;
  const perms = PERMISSIONS[user.role];

  const activeProjects = appState.projects.filter(p => p.status === 'active');
  const completedProjects = appState.projects.filter(p => p.status === 'completed');
  const myProjects = appState.projects.filter(p =>
    p.ownerId === user.id || p.teamIds.includes(user.id)
  );

  const recentActivities = appState.activities.slice(0, 8);
  const stats = MOCK_DASHBOARD_STATS;

  // Role-specific greeting
  const greetings: Record<string, string> = {
    super_admin: 'System overview is healthy.',
    project_manager: `You have ${myProjects.length} projects to manage.`,
    team_lead: `Your team has ${myProjects.length} active assignments.`,
    team_member: `You have ${myProjects.length} projects assigned.`,
    viewer: 'Here\'s the latest workspace summary.',
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar initials={user.avatar} name={user.name} size="lg" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Welcome back, {user.name.split(' ')[0]}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{greetings[user.role]}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded-lg">
          <Clock size={13} />
          <span>Last login: {formatRelativeTime(user.lastActive)}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {perms.canViewUsers && (
          <StatCard
            label="Total Users" value={appState.users.length}
            icon={<Users size={20} />} color="blue"
            trend={{ value: 8, positive: true }}
          />
        )}
        <StatCard
          label="Active Projects" value={activeProjects.length}
          icon={<FolderOpen size={20} />} color="purple"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          label="Completed" value={completedProjects.length}
          icon={<CheckCircle size={20} />} color="green"
        />
        {perms.canViewActivity ? (
          <StatCard
            label="Activities Today" value={appState.activities.filter(a => {
              const d = new Date(a.timestamp);
              const now = new Date();
              return d.toDateString() === now.toDateString();
            }).length}
            icon={<Activity size={20} />} color="orange"
          />
        ) : (
          <StatCard
            label="My Projects" value={myProjects.length}
            icon={<FolderOpen size={20} />} color="orange"
          />
        )}
      </div>

      {/* Charts row */}
      {perms.canViewAllData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area chart */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Activity Overview</h3>
                <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
              </div>
              <TrendingUp size={16} className="text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.monthlyActivity}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="activities" stroke="#3b82f6" strokeWidth={2} fill="url(#actGrad)" name="Activities" />
                <Area type="monotone" dataKey="projects" stroke="#8b5cf6" strokeWidth={2} fill="url(#projGrad)" name="Projects" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Projects by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.projectsByStatus.map(s => ({ name: s.status, value: s.count }))}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value"
                >
                  {stats.projectsByStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent projects */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {perms.canViewAllData ? 'Recent Projects' : 'My Projects'}
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {(perms.canViewAllData ? appState.projects : myProjects).slice(0, 5).map(project => (
              <div key={project.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{project.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{project.ownerName}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <PriorityBadge priority={project.priority} />
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <ProgressBar value={project.progress} />
                <div className="text-xs text-slate-400 mt-1.5">{project.progress}% complete</div>
              </div>
            ))}
            {(perms.canViewAllData ? appState.projects : myProjects).length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">No projects assigned</div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentActivities.map(activity => (
              <div key={activity.id} className="p-3.5 flex items-start gap-3">
                <Avatar initials={activity.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)} name={activity.userName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                    <span className="font-medium">{activity.userName}</span>
                    {' '}
                    <span className="text-slate-500">{getActionLabel(activity.action).toLowerCase()}</span>
                    {' '}
                    <span>in {activity.module}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(activity.timestamp)}</div>
                </div>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  activity.status === 'success' ? 'bg-green-400' :
                  activity.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts for non-admin roles */}
      {(user.role === 'team_member' || user.role === 'viewer') && (
        <div className="card p-4 flex items-center gap-3 border-l-4 border-l-orange-400">
          <AlertTriangle size={16} className="text-orange-500 shrink-0" />
          <div className="text-sm text-slate-600 dark:text-slate-300">
            You have read-only access to some sections. Contact your project manager for elevated permissions.
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
