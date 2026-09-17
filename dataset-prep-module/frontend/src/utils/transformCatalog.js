export const CATEGORIES = [
  {
    name: 'Column Operations',
    color: 'from-indigo-500 to-blue-500',
    ops: [
      { type: 'RENAME_COLUMN', label: 'Rename Column', fields: ['column', 'newName'] },
      { type: 'REMOVE_COLUMN', label: 'Remove Column', fields: ['column'] },
      { type: 'CHANGE_DATA_TYPE', label: 'Change Data Type', fields: ['column', 'newType'] }
    ]
  },
  {
    name: 'Missing Value Operations',
    color: 'from-amber-500 to-orange-500',
    ops: [
      { type: 'REMOVE_NULL_ROWS', label: 'Remove Null Rows', fields: ['column'] },
      { type: 'REPLACE_NULLS', label: 'Replace Null Values', fields: ['column', 'value'] }
    ]
  },
  {
    name: 'Text Operations',
    color: 'from-teal-500 to-emerald-500',
    ops: [
      { type: 'TRIM_WHITESPACE', label: 'Trim Whitespace', fields: ['column'] },
      { type: 'TO_UPPERCASE', label: 'Convert to Uppercase', fields: ['column'] },
      { type: 'TO_LOWERCASE', label: 'Convert to Lowercase', fields: ['column'] }
    ]
  },
  {
    name: 'Numeric Operations',
    color: 'from-fuchsia-500 to-pink-500',
    ops: [
      { type: 'ROUND_DECIMAL', label: 'Round Decimal Values', fields: ['column', 'precision'] },
      { type: 'ADD_NUMERIC', label: 'Add Numeric Value', fields: ['column', 'amount'] },
      { type: 'MULTIPLY_NUMERIC', label: 'Multiply Numeric Value', fields: ['column', 'factor'] }
    ]
  },
  {
    name: 'Row Operations',
    color: 'from-rose-500 to-red-500',
    ops: [
      { type: 'REMOVE_DUPLICATES', label: 'Remove Duplicate Rows', fields: [] },
      { type: 'FILTER_ROWS', label: 'Filter Rows', fields: ['column', 'operator', 'value'] }
    ]
  }
];

export const ALL_OPS = CATEGORIES.flatMap((c) => c.ops);

export const OP_LABELS = Object.fromEntries(ALL_OPS.map((o) => [o.type, o.label]));

export const DATA_TYPES = ['String', 'Integer', 'Decimal', 'Boolean', 'Date'];

export const FILTER_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
  { value: 'is_null', label: 'Is Null' }
];

export const FIELD_LABELS = {
  column: 'Column',
  newName: 'New Column Name',
  newType: 'New Data Type',
  value: 'Value',
  precision: 'Decimal Places',
  amount: 'Amount to Add',
  factor: 'Multiply Factor',
  operator: 'Condition'
};
