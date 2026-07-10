const priorityStyles = {
  Low: 'bg-green-50 text-green-700 border-green-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-red-50 text-red-700 border-red-200',
};

const statusStyles = {
  Pending: 'bg-gray-100 text-gray-700 border-gray-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${priorityStyles[priority] || priorityStyles.Medium}`}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyles[status] || statusStyles.Pending}`}
    >
      {status}
    </span>
  );
}
