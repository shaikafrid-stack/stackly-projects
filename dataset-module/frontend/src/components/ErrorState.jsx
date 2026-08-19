import React from 'react';

export default function ErrorState({ message = 'Something went wrong.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50">
      <p className="text-red-700 font-medium">{message}</p>
    </div>
  );
}
