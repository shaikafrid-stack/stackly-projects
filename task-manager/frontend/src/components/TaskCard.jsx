import { Link } from 'react-router-dom';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import { PriorityBadge, StatusBadge } from './Badges';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];

export default function TaskCard({ task, onDelete, onStatusChange }) {
  const formattedDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'No due date';

  return (
    <div className="card flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 break-words">{task.title}</h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Calendar className="h-3.5 w-3.5" />
        {formattedDate}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <Link
            to={`/tasks/${task.id}/edit`}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand-600"
            title="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
