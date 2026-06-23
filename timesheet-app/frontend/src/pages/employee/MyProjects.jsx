import { useState, useEffect } from 'react'
import api from '../../services/api'

const statusBadge = s => s === 'active' ? 'badge-green' : s === 'completed' ? 'badge-gray' : 'badge-yellow'

export default function MyProjects() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/employee-projects').then(r => { setAssignments(r.data.assignments); setLoading(false) })
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <div className="page-title">My Projects</div>
        <div className="page-subtitle">Projects you are assigned to</div>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-header"><span className="card-title">{assignments.length} Project(s)</span></div>
          <div className="table-container">
            {assignments.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">📁</div><p>No projects assigned yet</p></div>
            ) : (
              <table>
                <thead><tr><th>Project</th><th>Assigned Date</th></tr></thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.project_name}</strong></td>
                      <td>{a.assigned_date}</td>
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
