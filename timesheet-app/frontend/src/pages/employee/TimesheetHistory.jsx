import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function TimesheetHistory() {
  const [timesheets, setTimesheets] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [projects, setProjects] = useState([])
  const [filters, setFilters] = useState({ project_id: '', start_date: '', end_date: '' })
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(null)
  const [editForm, setEditForm] = useState({})

  const fetchTimesheets = async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, per_page: 10 })
    if (filters.project_id) params.append('project_id', filters.project_id)
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)
    const r = await api.get(`/api/timesheets/my?${params}`)
    setTimesheets(r.data.timesheets); setTotal(r.data.total); setPages(r.data.pages)
    setLoading(false)
  }

  useEffect(() => { api.get('/api/employee-projects').then(r => setProjects(r.data.assignments)) }, [])
  useEffect(() => { fetchTimesheets(page) }, [page, filters])

  const handleDelete = async (id) => {
    if (!confirm('Delete this timesheet?')) return
    await api.delete(`/api/timesheets/${id}`)
    fetchTimesheets(page)
  }

  const openEdit = (ts) => { setEditModal(ts.id); setEditForm({ hours_logged: ts.hours_logged, work_date: ts.work_date, task_description: ts.task_description }) }
  const handleEdit = async () => {
    await api.put(`/api/timesheets/${editModal}`, editForm)
    setEditModal(null); fetchTimesheets(page)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Timesheet History</div>
        <div className="page-subtitle">View and manage your submitted timesheets</div>
      </div>
      <div className="page-body">
        <div className="filters-bar">
          <div className="filter-group">
            <label>Project</label>
            <select className="form-control" value={filters.project_id} onChange={e => { setFilters({...filters, project_id: e.target.value}); setPage(1) }}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
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
                  <thead><tr><th>Date</th><th>Project</th><th>Hours</th><th>Description</th><th>Actions</th></tr></thead>
                  <tbody>
                    {timesheets.map(ts => (
                      <tr key={ts.id}>
                        <td>{ts.work_date}</td>
                        <td><span className="badge badge-blue">{ts.project_name}</span></td>
                        <td><strong>{ts.hours_logged}h</strong></td>
                        <td style={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{ts.task_description}</td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ts)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ts.id)}>Delete</button>
                          </div>
                        </td>
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
                  <button key={i+1} className={`page-btn${page === i+1 ? ' active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit Timesheet</span>
              <button className="modal-close" onClick={() => setEditModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Work Date</label>
                <input type="date" className="form-control" value={editForm.work_date} onChange={e => setEditForm({...editForm, work_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Hours Logged</label>
                <input type="number" className="form-control" min="0.1" max="24" step="0.5" value={editForm.hours_logged} onChange={e => setEditForm({...editForm, hours_logged: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Task Description</label>
                <textarea className="form-control" value={editForm.task_description} onChange={e => setEditForm({...editForm, task_description: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
