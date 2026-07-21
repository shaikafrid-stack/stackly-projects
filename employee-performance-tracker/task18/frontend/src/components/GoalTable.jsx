import React from 'react';
import Badge from './Badge';

/**
 * Generic goals table.
 * props:
 *  - goals: array
 *  - showEmployee: bool -> show employee_name column (for manager/admin views)
 *  - onRowAction: (goal) => ReactNode  -- renders action buttons per row
 *  - filters: { search, status, priority, sort, order }
 *  - onFiltersChange: (patch) => void
 *  - pagination: { page, totalPages }
 *  - onPageChange: (page) => void
 */
export default function GoalTable({
  goals,
  showEmployee = false,
  onRowAction,
  filters,
  onFiltersChange,
  pagination,
  onPageChange,
}) {
  return (
    <div className="card">
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="input max-w-xs"
          placeholder="Search by title..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
        />
        <select
          className="input max-w-[160px]"
          value={filters.status}
          onChange={(e) => onFiltersChange({ status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <select
          className="input max-w-[160px]"
          value={filters.priority}
          onChange={(e) => onFiltersChange({ priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select
          className="input max-w-[200px]"
          value={filters.sort}
          onChange={(e) => onFiltersChange({ sort: e.target.value })}
        >
          <option value="target_date">Sort by Target Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="progress_percentage">Sort by Progress</option>
          <option value="created_at">Sort by Created</option>
        </select>
        <button
          className="btn-secondary"
          onClick={() => onFiltersChange({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
        >
          {filters.order === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 pr-4">Title</th>
              {showEmployee && <th className="py-2 pr-4">Employee</th>}
              <th className="py-2 pr-4">Priority</th>
              <th className="py-2 pr-4">Progress</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Target Date</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 && (
              <tr>
                <td colSpan={showEmployee ? 7 : 6} className="py-8 text-center text-gray-400">
                  No goals found.
                </td>
              </tr>
            )}
            {goals.map((g) => (
              <tr key={g.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 pr-4 font-medium">{g.title}</td>
                {showEmployee && <td className="py-3 pr-4">{g.employee_name}</td>}
                <td className="py-3 pr-4"><Badge>{g.priority}</Badge></td>
                <td className="py-3 pr-4">
                  <div className="w-28 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-brand-600 h-2 rounded-full"
                      style={{ width: `${g.progress_percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{g.progress_percentage}%</span>
                </td>
                <td className="py-3 pr-4"><Badge>{g.status}</Badge></td>
                <td className="py-3 pr-4">{g.target_date}</td>
                <td className="py-3 pr-4">{onRowAction?.(g)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="btn-secondary !px-3"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn-secondary !px-3"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
