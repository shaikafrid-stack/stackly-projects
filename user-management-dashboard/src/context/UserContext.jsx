import { createContext, useContext, useReducer, useEffect } from 'react';

const UserContext = createContext(null);

const initialState = {
  users: [],
  loading: false,
  error: null,
  searchQuery: '',
  filterRole: 'all',
  filterStatus: 'all',
};

function userReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, users: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_USER':
      return { ...state, users: [action.payload, ...state.users] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload.id ? action.payload : u),
      };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter(u => u.id !== action.payload) };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTER_ROLE':
      return { ...state, filterRole: action.payload };
    case 'SET_FILTER_STATUS':
      return { ...state, filterStatus: action.payload };
    default:
      return state;
  }
}

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      // Enrich API data with role and status fields
      const roles = ['Admin', 'Editor', 'Viewer', 'Manager', 'Developer'];
      const statuses = ['Active', 'Active', 'Active', 'Inactive', 'Pending'];
      const enriched = data.map((user, i) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: roles[i % roles.length],
        status: statuses[i % statuses.length],
        username: user.username,
        phone: user.phone,
        website: user.website,
        company: user.company?.name || '',
      }));
      dispatch({ type: 'FETCH_SUCCESS', payload: enriched });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
    }
  }

  function addUser(userData) {
    const newUser = {
      ...userData,
      id: Date.now(),
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
  }

  function updateUser(userData) {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  }

  function deleteUser(id) {
    dispatch({ type: 'DELETE_USER', payload: id });
  }

  const filteredUsers = state.users.filter(user => {
    const matchSearch =
      user.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchRole = state.filterRole === 'all' || user.role === state.filterRole;
    const matchStatus = state.filterStatus === 'all' || user.status === state.filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: state.users.length,
    active: state.users.filter(u => u.status === 'Active').length,
    inactive: state.users.filter(u => u.status === 'Inactive').length,
    pending: state.users.filter(u => u.status === 'Pending').length,
  };

  return (
    <UserContext.Provider value={{
      ...state,
      filteredUsers,
      stats,
      addUser,
      updateUser,
      deleteUser,
      setSearch: q => dispatch({ type: 'SET_SEARCH', payload: q }),
      setFilterRole: r => dispatch({ type: 'SET_FILTER_ROLE', payload: r }),
      setFilterStatus: s => dispatch({ type: 'SET_FILTER_STATUS', payload: s }),
      refetch: fetchUsers,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUsers must be used within UserProvider');
  return ctx;
}
