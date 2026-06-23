import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../services/api'

export default function ManagerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard/manager').then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <div className="page-title">Manager Dashboard</div>
        <div className="page-subtitle">Organization-wide overview</div>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">👥</div>
            <div><div className="stat-value">{data?.total_employees ?? 0}</div><div className="stat-label">Total Employees</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">📁</div>
            <div><div className="stat-value">{data?.active_projects ?? 0}</div><div className="stat-label">Active Projects</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">⏱️</div>
            <div><div className="stat-value">{(data?.total_hours ?? 0).toFixed(0)}</div><div className="stat-label">Total Hours Logged</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">📋</div>
            <div><div className="stat-value">{data?.pending_entries ?? 0}</div><div className="stat-label">Timesheet Entries</div></div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-title">Hours by Employee</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.employee_hours || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize:11}} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip />
                <Bar dataKey="hours" fill="#4f46e5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <div className="chart-title">Hours by Project</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.project_hours || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize:11}} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip />
                <Bar dataKey="hours" fill="#059669" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🏆 Top 5 Most Active Employees</span></div>
          <div className="table-container">
            {(data?.top_employees || []).length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📊</div><p>No data yet</p></div>
            ) : (
              <table>
                <thead><tr><th>#</th><th>Employee</th><th>Total Hours</th></tr></thead>
                <tbody>
                  {data?.top_employees?.map((e, i) => (
                    <tr key={i}>
                      <td><span className="badge badge-blue">#{i+1}</span></td>
                      <td><strong>{e.name}</strong></td>
                      <td>{e.hours.toFixed(1)}h</td>
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
