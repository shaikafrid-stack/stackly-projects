import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Project, Activity, Theme } from '../types';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_ACTIVITIES } from '../utils/mockData';
import { generateId, getInitials } from '../utils/helpers';
import { CreateUserFormValues, CreateProjectFormValues } from '../utils/validation';

// ─── State ────────────────────────────────────────────────────────────────────
interface AppState {
  users: User[];
  projects: Project[];
  activities: Activity[];
  theme: Theme;
  sidebarCollapsed: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type AppAction =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'TOGGLE_USER_STATUS'; payload: string }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR' };

// ─── Reducer ──────────────────────────────────────────────────────────────────
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USERS': return { ...state, users: action.payload };
    case 'ADD_USER': return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) };
    case 'TOGGLE_USER_STATUS':
      return {
        ...state,
        users: state.users.map(u =>
          u.id === action.payload
            ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
            : u
        ),
      };
    case 'SET_PROJECTS': return { ...state, projects: action.payload };
    case 'ADD_PROJECT': return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return { ...state, projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter(p => p.id !== action.payload) };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities] };
    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('workspace_theme', newTheme);
      return { ...state, theme: newTheme };
    }
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    default: return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addUser: (data: CreateUserFormValues, actorId: string, actorName: string) => void;
  updateUser: (user: User, actorId: string, actorName: string) => void;
  toggleUserStatus: (userId: string, actorId: string, actorName: string) => void;
  addProject: (data: CreateProjectFormValues, actorId: string, actorName: string) => void;
  updateProject: (project: Project, actorId: string, actorName: string) => void;
  deleteProject: (projectId: string, projectName: string, actorId: string, actorName: string) => void;
  logActivity: (activity: Omit<Activity, 'id'>) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  users: 'workspace_users',
  projects: 'workspace_projects',
  activities: 'workspace_activities',
};

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch { return fallback; }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const savedTheme = (localStorage.getItem('workspace_theme') as Theme) || 'light';

  const [state, dispatch] = useReducer(appReducer, {
    users: loadFromStorage<User[]>(STORAGE_KEYS.users, MOCK_USERS.map(({ password: _p, ...u }) => u as User)),
    projects: loadFromStorage<Project[]>(STORAGE_KEYS.projects, MOCK_PROJECTS),
    activities: loadFromStorage<Activity[]>(STORAGE_KEYS.activities, MOCK_ACTIVITIES),
    theme: savedTheme,
    sidebarCollapsed: false,
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(state.users));
  }, [state.users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(state.projects));
  }, [state.projects]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(state.activities));
  }, [state.activities]);

  // Theme class on html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  const logActivity = (activity: Omit<Activity, 'id'>): void => {
    dispatch({ type: 'ADD_ACTIVITY', payload: { ...activity, id: generateId() } });
  };

  const addUser = (data: CreateUserFormValues, actorId: string, actorName: string): void => {
    const newUser: User = {
      id: generateId(),
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      status: 'active',
      avatar: getInitials(data.name),
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
    logActivity({
      userId: actorId, userName: actorName, action: 'created', module: 'users',
      description: `Added new user ${data.name}`, timestamp: new Date().toISOString(), status: 'success',
    });
  };

  const updateUser = (user: User, actorId: string, actorName: string): void => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    logActivity({
      userId: actorId, userName: actorName, action: 'updated', module: 'users',
      description: `Updated user ${user.name}`, timestamp: new Date().toISOString(), status: 'success',
    });
  };

  const toggleUserStatus = (userId: string, actorId: string, actorName: string): void => {
    const user = state.users.find(u => u.id === userId);
    if (!user) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    dispatch({ type: 'TOGGLE_USER_STATUS', payload: userId });
    logActivity({
      userId: actorId, userName: actorName,
      action: newStatus === 'inactive' ? 'deactivated' : 'activated',
      module: 'users',
      description: `${newStatus === 'inactive' ? 'Deactivated' : 'Activated'} user ${user.name}`,
      timestamp: new Date().toISOString(), status: 'warning',
    });
  };

  const addProject = (data: CreateProjectFormValues, actorId: string, actorName: string): void => {
    const owner = state.users.find(u => u.id === data.ownerId);
    const newProject: Project = {
      id: generateId(),
      name: data.name,
      description: data.description,
      ownerId: data.ownerId,
      ownerName: owner?.name ?? 'Unknown',
      status: data.status,
      priority: data.priority,
      startDate: data.startDate,
      dueDate: data.dueDate,
      progress: 0,
      teamIds: [],
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    logActivity({
      userId: actorId, userName: actorName, action: 'created', module: 'projects',
      description: `Created project "${data.name}"`, timestamp: new Date().toISOString(), status: 'success',
    });
  };

  const updateProject = (project: Project, actorId: string, actorName: string): void => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { ...project, updatedAt: new Date().toISOString() } });
    logActivity({
      userId: actorId, userName: actorName, action: 'updated', module: 'projects',
      description: `Updated project "${project.name}"`, timestamp: new Date().toISOString(), status: 'success',
    });
  };

  const deleteProject = (projectId: string, projectName: string, actorId: string, actorName: string): void => {
    dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    logActivity({
      userId: actorId, userName: actorName, action: 'deleted', module: 'projects',
      description: `Deleted project "${projectName}"`, timestamp: new Date().toISOString(), status: 'warning',
    });
  };

  return (
    <AppContext.Provider value={{
      state, dispatch, addUser, updateUser, toggleUserStatus,
      addProject, updateProject, deleteProject, logActivity,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
