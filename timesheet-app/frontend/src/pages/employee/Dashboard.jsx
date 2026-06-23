import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function EmployeeDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard/employee').then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <div className="page-title">My Dashboard</div>
        <div className="page-subtitle">Overview of your work and projects</div>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">📁</div>
            <div><div className="stat-value">{data?.assigned_projects ?? 0}</div><div className="stat-label">Assigned Projects</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">⏱️</div>
            <div><div className="stat-value">{(data?.total_hours ?? 0).toFixed(1)}</div><div className="stat-label">Total Hours Logged</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">📅</div>
            <div><div className="stat-value">{(data?.weekly_hours ?? 0).toFixed(1)}</div><div className="stat-label">This Week's Hours</div></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Recent Timesheets</span></div>
          <div className="table-container">
            {data?.recent_timesheets?.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📋</div><p>No timesheets yet</p></div>
            ) : (
              <table>
                <thead><tr><th>Date</th><th>Project</th><th>Hours</th><th>Description</th></tr></thead>
                <tbody>
                  {data?.recent_timesheets?.map(ts => (
                    <tr key={ts.id}>
                      <td>{ts.work_date}</td>
                      <td><span className="badge badge-blue">{ts.project_name}</span></td>
                      <td><strong>{ts.hours_logged}h</strong></td>
                      <td style={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{ts.task_description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
