import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function SubmitTimesheet() {
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({ project_id: '', work_date: new Date().toISOString().split('T')[0], hours_logged: '', task_description: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/employee-projects').then(r => setProjects(r.data.assignments))
  }, [])

  const validate = () => {
    const e = {}
    if (!form.project_id) e.project_id = 'Select a project'
    if (!form.work_date) e.work_date = 'Work date is required'
    if (!form.hours_logged) e.hours_logged = 'Hours is required'
    else if (parseFloat(form.hours_logged) <= 0 || parseFloat(form.hours_logged) > 24) e.hours_logged = 'Hours must be between 0.1 and 24'
    if (!form.task_description.trim()) e.task_description = 'Task description is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setSuccess('')
    try {
      await api.post('/api/timesheets', form)
      setSuccess('Timesheet submitted successfully!')
      setForm({ project_id: '', work_date: new Date().toISOString().split('T')[0], hours_logged: '', task_description: '' })
      setErrors({})
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Submission failed' })
    } finally { setLoading(false) }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Submit Timesheet</div>
        <div className="page-subtitle">Log your work hours for a project</div>
      </div>
      <div className="page-body">
        <div className="card" style={{maxWidth: 560}}>
          <div className="card-header"><span className="card-title">New Timesheet Entry</span></div>
          <div className="card-body">
            {success && <div className="alert alert-success">✅ {success}</div>}
            {errors.submit && <div className="alert alert-error">⚠️ {errors.submit}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select className={`form-control${errors.project_id ? ' error' : ''}`}
                  value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})}>
                  <option value="">Select a project...</option>
                  {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                </select>
                {errors.project_id && <div className="form-error">{errors.project_id}</div>}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Work Date *</label>
                  <input type="date" className={`form-control${errors.work_date ? ' error' : ''}`}
                    value={form.work_date} onChange={e => setForm({...form, work_date: e.target.value})}
                    max={new Date().toISOString().split('T')[0]} />
                  {errors.work_date && <div className="form-error">{errors.work_date}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Hours Logged *</label>
                  <input type="number" className={`form-control${errors.hours_logged ? ' error' : ''}`}
                    placeholder="e.g. 8" min="0.1" max="24" step="0.5"
                    value={form.hours_logged} onChange={e => setForm({...form, hours_logged: e.target.value})} />
                  {errors.hours_logged && <div className="form-error">{errors.hours_logged}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Task Description *</label>
                <textarea className={`form-control${errors.task_description ? ' error' : ''}`}
                  placeholder="Describe what you worked on..."
                  value={form.task_description} onChange={e => setForm({...form, task_description: e.target.value})} />
                {errors.task_description && <div className="form-error">{errors.task_description}</div>}
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : '⏱️ Submit Timesheet'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
