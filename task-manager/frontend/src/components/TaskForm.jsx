import { useState } from 'react';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

export default function TaskForm({ initialValues, onSubmit, submitLabel = 'Save Task', submitting }) {
  const [values, setValues] = useState({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    priority: initialValues?.priority || 'Medium',
    due_date: initialValues?.due_date ? initialValues.due_date.slice(0, 10) : '',
    status: initialValues?.status || 'Pending',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!values.title.trim()) errs.title = 'Title is required.';
    else if (values.title.trim().length > 255) errs.title = 'Title must be under 255 characters.';
    if (values.due_date) {
      const selected = new Date(values.due_date);
      if (Number.isNaN(selected.getTime())) errs.due_date = 'Enter a valid date.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label" htmlFor="title">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
          placeholder="e.g. Prepare quarterly report"
          className="input-field"
        />
        {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={values.description}
          onChange={handleChange}
          placeholder="Add more details about this task..."
          className="input-field resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label" htmlFor="priority">
            Priority
          </label>
          <select id="priority" name="priority" value={values.priority} onChange={handleChange} className="input-field">
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" value={values.status} onChange={handleChange} className="input-field">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="due_date">
            Due Date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            value={values.due_date}
            onChange={handleChange}
            className="input-field"
          />
          {errors.due_date && <p className="text-xs text-red-600 mt-1">{errors.due_date}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
