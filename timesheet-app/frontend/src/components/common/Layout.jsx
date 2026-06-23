import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const employeeNav = [
  { to: '/employee', label: 'Dashboard', icon: '📊', end: true },
  { to: '/employee/projects', label: 'My Projects', icon: '📁' },
  { to: '/employee/submit-timesheet', label: 'Submit Timesheet', icon: '⏱️' },
  { to: '/employee/timesheets', label: 'Timesheet History', icon: '📋' },
]

const managerNav = [
  { to: '/manager', label: 'Dashboard', icon: '📊', end: true },
  { to: '/manager/projects', label: 'Projects', icon: '📁' },
  { to: '/manager/assignments', label: 'Assignments', icon: '👥' },
  { to: '/manager/timesheets', label: 'Timesheets', icon: '📋' },
  { to: '/manager/reports', label: 'Reports', icon: '📈' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nav = user?.role === 'manager' ? managerNav : employeeNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            ⏰ Time<span>Track</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Navigation</div>
            {nav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
