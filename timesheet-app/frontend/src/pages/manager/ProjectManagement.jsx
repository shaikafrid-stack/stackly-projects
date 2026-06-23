import { useState, useEffect } from 'react'
import api from '../../services/api'

const statusBadge = s => s === 'active' ? 'badge-green' : s === 'completed' ? 'badge-gray' : 'badge-yellow'

export default function ProjectManagement() {
  const [projects, setProjects] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | project_obj
  const [form, setForm] = useState({ project_name: '', project_description: '', start_date: '', end_date: '', status: 'active' })
  const [errors, setErrors] = useState({})

  const fetchProjects = async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, per_page: 8 })
    if (search) params.append('search', search)
    const r = await api.get(`/api/projects?${params}`)
    setProjects(r.data.projects); setTotal(r.data.total); setPages(r.data.pages)
    setLoading(false)
  }

  useEffect(() => { fetchProjects(page) }, [page, search])

  const openCreate = () => { setForm({ project_name: '', project_description: '', start_date: '', end_date: '', status: 'active' }); setErrors({}); setModal('create') }
  const openEdit = (p) => { setForm({ project_name: p.project_name, project_description: p.project_description || '', start_date: p.start_date || '', end_date: p.end_date || '', status: p.status }); setErrors({}); setModal(p) }

  const validate = () => {
    const e = {}
    if (!form.project_name.trim()) e.project_name = 'Project name is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    if (modal === 'create') {
      await api.post('/api/projects', form)
    } else {
      await api.put(`/api/projects/${modal.id}`, form)
    }
    setModal(null); fetchProjects(page)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    await api.delete(`/api/projects/${id}`)
    fetchProjects(page)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Project Management</div>
        <div className="page-subtitle">Create and manage all projects</div>
      </div>
      <div className="page-body">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:16, alignItems:'center', flexWrap:'wrap', gap:12}}>
          <input className="form-control" placeholder="🔍 Search projects..." style={{width:260}}
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          <button className="btn btn-primary" onClick={openCreate}>+ New Project</button>
        </div>
        <div className="card">
          {loading ? <div className="loading"><div className="spinner" /></div> : (
            <div className="table-container">
              {projects.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📁</div><p>No projects found</p></div> : (
                <table>
                  <thead><tr><th>Project Name</th><th>Description</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.project_name}</strong></td>
                        <td style={{maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{p.project_description}</td>
                        <td>{p.start_date || '—'}</td>
                        <td>{p.end_date || '—'}</td>
                        <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
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
              <span className="pagination-info">Page {page} of {pages} · {total} projects</span>
              <div className="pagination-btns">
                {Array.from({length: pages}, (_, i) => (
                  <button key={i+1} className={`page-btn${page===i+1?' active':''}`} onClick={() => setPage(i+1)}>{i+1}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === 'create' ? 'New Project' : 'Edit Project'}</span>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input className={`form-control${errors.project_name?' error':''}`} value={form.project_name} onChange={e => setForm({...form, project_name: e.target.value})} />
                {errors.project_name && <div className="form-error">{errors.project_name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.project_description} onChange={e => setForm({...form, project_description: e.target.value})} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-control" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-control" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Project</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
