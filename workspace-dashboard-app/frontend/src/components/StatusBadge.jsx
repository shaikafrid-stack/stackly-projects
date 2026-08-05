export default function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-green-100 text-green-700',
    Inactive: 'bg-gray-200 text-gray-600',
    Archived: 'bg-amber-100 text-amber-700',
  };
  return <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}
