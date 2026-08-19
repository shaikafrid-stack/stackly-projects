import React from 'react';

const STYLES = {
  UPLOADED: 'bg-gray-100 text-gray-700',
  VALIDATING: 'bg-blue-100 text-blue-700',
  VALIDATION_FAILED: 'bg-red-100 text-red-700',
  VALIDATED: 'bg-teal-100 text-teal-700',
  PROCESSING: 'bg-amber-100 text-amber-700',
  PROCESSED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  PASSED: 'bg-green-100 text-green-700'
};

const LABELS = {
  UPLOADED: 'Uploaded',
  VALIDATING: 'Validating',
  VALIDATION_FAILED: 'Validation Failed',
  VALIDATED: 'Validated',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  FAILED: 'Failed',
  PASSED: 'Passed'
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-gray-100 text-gray-700';
  const label = LABELS[status] || status;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
