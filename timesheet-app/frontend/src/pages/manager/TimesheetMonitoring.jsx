import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function TimesheetMonitoring() {
  const [timesheets, setTimesheets] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [employees, setEmployees] = useState([])
  const [projects, setProjects] = useState([])
  const [filters, setFilters] = useState({ project_id: '', employee_id: '', start_date: '', end_date: '' })
  const [loading, setLoading] = useState(true)

  const fetchTimesheets = async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, per_page: 10 })
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v) })
    const r = await api.get(`/api/timesheets?${params}`)
    setTimesheets(r.data.timesheets); setTotal(r.data.total); setPages(r.data.pages)
    setLoading(false)
  }

  useEffect(() => {
    Promise.all([api.get('/api/employees'), api.get('/api/projects?per_page=100')]).then(([e, p]) => {
      setEmployees(e.data.employees); setProjects(p.data.projects)
    })
  }, [])
  useEffect(() => { fetchTimesheets(page) }, [page, filters])

  const handleDelete = async (id) => {
    if (!confirm('Delete this timesheet?')) return
    await api.delete(`/api/timesheets/${id}`)
    fetchTimesheets(page)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Timesheet Monitoring</div>
        <div className="page-subtitle">View all employee timesheets</div>
      </div>
      <div className="page-body">
        <div className="filters-bar">
          <div className="filter-group">
            <label>Employee</label>
            <select className="form-control" value={filters.employee_id} onChange={e => { setFilters({...filters, employee_id: e.target.value}); setPage(1) }}>
              <option value="">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Project</label>
            <select className="form-control" value={filters.project_id} onChange={e => { setFilters({...filters, project_id: e.target.value}); setPage(1) }}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>From</label>
            <input type="date" className="form-control" value={filters.start_date} onChange={e => { setFilters({...filters, start_date: e.target.value}); setPage(1) }} />
          </div>
          <div className="filter-group">
            <label>To</label>
            <input type="date" className="form-control" value={filters.end_date} onChange={e => { setFilters({...filters, end_date: e.target.value}); setPage(1) }} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">{total} entries</span></div>
          {loading ? <div className="loading"><div className="spinner" /></div> : (
            <div className="table-container">
              {timesheets.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📋</div><p>No timesheets found</p></div> : (
                <table>
                  <thead><tr><th>Employee</th><th>Project</th><th>Date</th><th>Hours</th><th>Description</th><th>Action</th></tr></thead>
                  <tbody>
                    {timesheets.map(ts => (
                      <tr key={ts.id}>
                        <td><strong>{ts.employee_name}</strong></td>
                        <td><span className="badge badge-blue">{ts.project_name}</span></td>
                        <td>{ts.work_date}</td>
                        <td><strong>{ts.hours_logged}h</strong></td>
                        <td style={{maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{ts.task_description}</td>
                        <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(ts.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {pages > 1 && (
            <div className="pagination">
              <span className="pagination-info">Page {page} of {pages}</span>
              <div className="pagination-btns">
                {Array.from({length: pages}, (_, i) => (
                  <button key={i+1} className={`page-btn${page===i+1?' active':''}`} onClick={() => setPage(i+1)}>{i+1}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
