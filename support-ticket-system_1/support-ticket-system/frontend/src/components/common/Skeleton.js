import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
  </tr>
);
