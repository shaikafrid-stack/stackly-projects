import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function EmployeeAssignment() {
  const [employees, setEmployees] = useState([])
  const [projects, setProjects] = useState([])
  const [assignments, setAssignments] = useState([])
  const [form, setForm] = useState({ employee_id: '', project_id: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    const [empRes, projRes, asnRes] = await Promise.all([
      api.get('/api/employees'),
      api.get('/api/projects?per_page=100'),
      api.get('/api/employee-projects')
    ])
    setEmployees(empRes.data.employees)
    setProjects(projRes.data.projects)
    setAssignments(asnRes.data.assignments)
  }

  useEffect(() => { fetchData() }, [])

  const handleAssign = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.employee_id || !form.project_id) { setError('Select both employee and project'); return }
    setLoading(true)
    try {
      await api.post('/api/assign-project', form)
      setSuccess('Employee assigned successfully!'); setForm({ employee_id: '', project_id: '' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Assignment failed')
    } finally { setLoading(false) }
  }

  const handleUnassign = async (id) => {
    if (!confirm('Remove this assignment?')) return
    await api.delete(`/api/unassign-project/${id}`)
    fetchData()
  }

  const filtered = assignments.filter(a =>
    a.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.project_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="page-header">
        <div className="page-title">Employee Assignment</div>
        <div className="page-subtitle">Assign employees to projects</div>
      </div>
      <div className="page-body">
        <div className="card" style={{maxWidth: 560, marginBottom: 24}}>
          <div className="card-header"><span className="card-title">Assign Employee to Project</span></div>
          <div className="card-body">
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}
            <form onSubmit={handleAssign}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select className="form-control" value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})}>
                    <option value="">Select employee...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select className="form-control" value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})}>
                    <option value="">Select project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Assigning...' : '👥 Assign'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Current Assignments ({filtered.length})</span>
            <input className="form-control" placeholder="Search..." style={{width:200}}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="table-container">
            {filtered.length === 0 ? <div className="empty-state"><div className="empty-state-icon">👥</div><p>No assignments</p></div> : (
              <table>
                <thead><tr><th>Employee</th><th>Project</th><th>Assigned Date</th><th>Action</th></tr></thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.employee_name}</strong></td>
                      <td><span className="badge badge-blue">{a.project_name}</span></td>
                      <td>{a.assigned_date}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => handleUnassign(a.id)}>Remove</button></td>
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
