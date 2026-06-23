import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '../../services/api'

const COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2']

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard/manager').then(r => { setData(r.data); setLoading(false) })
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <div className="page-title">Reports & Analytics</div>
        <div className="page-subtitle">Productivity and utilization insights</div>
      </div>
      <div className="page-body">
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-title">📊 Employee-wise Hours Logged</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.employee_hours || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize:11}} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip formatter={(v) => [`${v.toFixed(1)}h`, 'Hours']} />
                <Bar dataKey="hours" fill="#4f46e5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-title">📁 Project-wise Hours Logged</div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data?.project_hours || []} dataKey="hours" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {(data?.project_hours || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v.toFixed(1)}h`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="charts-grid">
          <div className="card">
            <div className="card-header"><span className="card-title">🏆 Top 5 Most Active Employees</span></div>
            <div className="table-container">
              {(data?.top_employees || []).length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">👥</div><p>No data</p></div>
              ) : (
                <table>
                  <thead><tr><th>Rank</th><th>Employee</th><th>Total Hours</th><th>Progress</th></tr></thead>
                  <tbody>
                    {data.top_employees.map((e, i) => {
                      const max = data.top_employees[0]?.hours || 1
                      return (
                        <tr key={i}>
                          <td><span className="badge badge-blue">#{i+1}</span></td>
                          <td><strong>{e.name}</strong></td>
                          <td>{e.hours.toFixed(1)}h</td>
                          <td>
                            <div style={{background:'var(--gray-100)',borderRadius:4,height:8,width:120}}>
                              <div style={{background:'var(--primary)',height:'100%',borderRadius:4,width:`${(e.hours/max)*100}%`}} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">📋 Project Utilization Summary</span></div>
            <div className="table-container">
              {(data?.project_hours || []).length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📁</div><p>No data</p></div>
              ) : (
                <table>
                  <thead><tr><th>Project</th><th>Hours</th><th>Share</th></tr></thead>
                  <tbody>
                    {data.project_hours.map((p, i) => {
                      const totalH = data.project_hours.reduce((s, x) => s + x.hours, 0)
                      return (
                        <tr key={i}>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.hours.toFixed(1)}h</td>
                          <td>
                            <span className="badge" style={{background: COLORS[i%COLORS.length]+'22', color: COLORS[i%COLORS.length]}}>
                              {totalH ? ((p.hours/totalH)*100).toFixed(1) : 0}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
