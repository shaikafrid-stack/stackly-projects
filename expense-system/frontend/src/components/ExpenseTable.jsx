import React from 'react';
import StatusBadge from './StatusBadge';

export default function ExpenseTable({
  expenses,
  showEmployee = false,
  onEdit,
  onCancel,
  onApprove,
  onReject,
}) {
  if (!expenses.length) {
    return <div className="text-center text-gray-400 py-12 text-sm">No expenses found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            {showEmployee && <th className="py-2 pr-4 font-medium">Employee</th>}
            <th className="py-2 pr-4 font-medium">Title</th>
            <th className="py-2 pr-4 font-medium">Category</th>
            <th className="py-2 pr-4 font-medium">Amount</th>
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            {(onEdit || onCancel || onApprove || onReject) && (
              <th className="py-2 pr-4 font-medium">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id} className="border-b border-gray-50 hover:bg-gray-50/50">
              {showEmployee && <td className="py-3 pr-4">{exp.employee_name}</td>}
              <td className="py-3 pr-4">
                <div className="font-medium text-gray-800">{exp.title}</div>
                {exp.manager_comments && (
                  <div className="text-xs text-gray-400 mt-0.5">Note: {exp.manager_comments}</div>
                )}
              </td>
              <td className="py-3 pr-4 text-gray-600">{exp.category}</td>
              <td className="py-3 pr-4 font-medium">₹{Number(exp.amount).toLocaleString('en-IN')}</td>
              <td className="py-3 pr-4 text-gray-600">{exp.expense_date}</td>
              <td className="py-3 pr-4">
                <StatusBadge status={exp.status} />
              </td>
              {(onEdit || onCancel || onApprove || onReject) && (
                <td className="py-3 pr-4">
                  <div className="flex gap-2 flex-wrap">
                    {onEdit && exp.status === 'Pending' && (
                      <button onClick={() => onEdit(exp)} className="text-brand-600 hover:underline text-xs font-medium">
                        Edit
                      </button>
                    )}
                    {onCancel && exp.status === 'Pending' && (
                      <button onClick={() => onCancel(exp)} className="text-red-500 hover:underline text-xs font-medium">
                        Cancel
                      </button>
                    )}
                    {onApprove && exp.status === 'Pending' && (
                      <button onClick={() => onApprove(exp)} className="text-emerald-600 hover:underline text-xs font-medium">
                        Approve
                      </button>
                    )}
                    {onReject && exp.status === 'Pending' && (
                      <button onClick={() => onReject(exp)} className="text-red-500 hover:underline text-xs font-medium">
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
