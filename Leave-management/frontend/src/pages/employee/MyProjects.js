import React, { useState, useEffect } from 'react';
import { assignAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatusBadge, LoadingSpinner, EmptyState } from '../../components/shared/UIComponents';
import { FolderOpen } from 'lucide-react';

export default function MyProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignAPI.getAll()
      .then(r => {
        const mine = r.data.filter(ep => ep.employeeId === user?.id);
        setProjects(mine);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <PageHeader title="My Projects" subtitle="Projects you're currently assigned to" />
      {loading ? <LoadingSpinner /> : projects.length === 0 ? (
        <EmptyState message="You are not assigned to any projects yet" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(ep => (
            <div key={ep.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FolderOpen className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{ep.projectName}</h3>
                  <p className="text-xs text-gray-400">ID: {ep.projectId}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Assigned: {ep.assignedDate}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
