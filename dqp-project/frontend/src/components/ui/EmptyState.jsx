import React from 'react';

export default function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl mb-3">∅</div>
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
