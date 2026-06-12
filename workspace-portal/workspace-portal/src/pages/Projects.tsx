import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FolderPlus, Edit2, Trash2, Search, Filter, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { usePermissions, usePagination, useSearch } from '../hooks';
import { Project, ProjectStatus, ProjectPriority } from '../types';
import {
  Modal, ConfirmDialog, Avatar, StatusBadge, PriorityBadge,
  ProgressBar, Pagination, SearchInput, FormField, EmptyState,
} from '../components/ui';
import { createProjectSchema, CreateProjectFormValues } from '../utils/validation';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Projects: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: appState, addProject, updateProject, deleteProject } = useApp();
  const perms = usePermissions();
  const user = authState.user!;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const { query, setQuery, filtered: searchFiltered } = useSearch(
    appState.projects, ['name', 'description', 'ownerName']
  );

  const filtered = useMemo(() => {
    let result = searchFiltered;
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (priorityFilter !== 'all') result = result.filter(p => p.priority === priorityFilter);
    return result;
  }, [searchFiltered, statusFilter, priorityFilter]);

  const { paginatedItems, pagination, totalPages, setPage, setPageSize } = usePagination(filtered);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<CreateProjectFormValues>({ resolver: zodResolver(createProjectSchema) });

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setValue('name', p.name);
    setValue('description', p.description);
    setValue('ownerId', p.ownerId);
    setValue('status', p.status);
    setValue('priority', p.priority);
    setValue('startDate', p.startDate);
    setValue('dueDate', p.dueDate);
    setValue('tags', p.tags.join(', '));
  };

  const onSubmit = async (data: CreateProjectFormValues) => {
    await new Promise(r => setTimeout(r, 400));
    if (editingProject) {
      const owner = appState.users.find(u => u.id === data.ownerId);
      updateProject({
        ...editingProject, ...data,
        ownerName: owner?.name ?? editingProject.ownerName,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }, user.id, user.name);
      toast.success('Project updated');
      setEditingProject(null);
    } else {
      addProject(data, user.id, user.name);
      toast.success('Project created');
      setShowAddModal(false);
    }
    reset();
  };

  const handleClose = () => {
    setShowAddModal(false);
    setEditingProject(null);
    reset();
  };

  const eligibleOwners = appState.users.filter(u =>
    ['super_admin', 'project_manager', 'team_lead'].includes(u.role) && u.status === 'active'
  );

  const ProjectForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Project Name" error={errors.name?.message as string | undefined} required>
        <input {...register('name')} className="input-field" placeholder="My Awesome Project" />
      </FormField>
      <FormField label="Description" error={errors.description?.message as string | undefined} required>
        <textarea {...register('description')} rows={3} className="input-field resize-none" placeholder="Describe the project goals and scope..." />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Owner" error={errors.ownerId?.message as string | undefined} required>
          <select {...register('ownerId')} className="input-field">
            <option value="">Select owner</option>
            {eligibleOwners.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </FormField>
        <FormField label="Status" error={errors.status?.message as string | undefined} required>
          <select {...register('status')} className="input-field">
            <option value="">Select status</option>
            {(['active', 'planning', 'on_hold', 'completed', 'cancelled'] as ProjectStatus[]).map(s => (
              <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <FormField label="Priority" error={errors.priority?.message as string | undefined} required>
          <select {...register('priority')} className="input-field">
            <option value="">Priority</option>
            {(['low', 'medium', 'high', 'critical'] as ProjectPriority[]).map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Start Date" error={errors.startDate?.message as string | undefined} required>
          <input {...register('startDate')} type="date" className="input-field" />
        </FormField>
        <FormField label="Due Date" error={errors.dueDate?.message as string | undefined} required>
          <input {...register('dueDate')} type="date" className="input-field" />
        </FormField>
      </div>
      <FormField label="Tags" error={errors.tags?.message as string | undefined} hint="Comma-separated (e.g. frontend, api, design)">
        <input {...register('tags')} className="input-field" placeholder="frontend, design, api" />
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={handleClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : editingProject ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput value={query} onChange={setQuery} placeholder="Search projects…" />
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ProjectStatus | 'all')} className="input-field py-2 text-xs w-auto">
              <option value="all">All Status</option>
              {['active', 'planning', 'on_hold', 'completed', 'cancelled'].map(s => (
                <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as ProjectPriority | 'all')} className="input-field py-2 text-xs w-auto">
              <option value="all">All Priority</option>
              {['low', 'medium', 'high', 'critical'].map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {(['table', 'cards'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          {perms.canCreateProject && (
            <button className="btn-primary" onClick={() => { reset(); setShowAddModal(true); }}>
              <FolderPlus size={15} />New Project
            </button>
          )}
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedItems.map(project => {
            const owner = appState.users.find(u => u.id === project.ownerId);
            return (
              <div key={project.id} className="card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{project.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.description}</p>
                  </div>
                  {(perms.canEditProject || perms.canDeleteProject) && (
                    <div className="flex gap-1 ml-2 shrink-0">
                      {perms.canEditProject && (
                        <button onClick={() => openEdit(project)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                          <Edit2 size={13} />
                        </button>
                      )}
                      {perms.canDeleteProject && (
                        <button onClick={() => setDeletingProject(project)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={project.status} />
                  <PriorityBadge priority={project.priority} />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span><span>{project.progress}%</span>
                  </div>
                  <ProgressBar value={project.progress} />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {owner && <Avatar initials={owner.avatar} name={owner.name} size="sm" />}
                    <span>{project.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar size={11} />
                    <span>{formatDate(project.dueDate)}</span>
                  </div>
                </div>
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {paginatedItems.length === 0 && (
            <div className="col-span-3">
              <EmptyState icon={<Search size={24} />} title="No projects found" description="Try adjusting your filters." />
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="table-header">Project</th>
                  <th className="table-header">Owner</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Priority</th>
                  <th className="table-header hidden md:table-cell">Progress</th>
                  <th className="table-header hidden lg:table-cell">Due Date</th>
                  {(perms.canEditProject || perms.canDeleteProject) && <th className="table-header text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(project => {
                  const owner = appState.users.find(u => u.id === project.ownerId);
                  return (
                    <tr key={project.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5 hidden sm:block">{project.description.slice(0, 50)}…</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          {owner && <Avatar initials={owner.avatar} name={owner.name} size="sm" />}
                          <span className="text-sm text-slate-600 dark:text-slate-300">{project.ownerName}</span>
                        </div>
                      </td>
                      <td className="table-cell"><StatusBadge status={project.status} /></td>
                      <td className="table-cell"><PriorityBadge priority={project.priority} /></td>
                      <td className="table-cell hidden md:table-cell w-36">
                        <ProgressBar value={project.progress} />
                        <span className="text-xs text-slate-400 mt-1 block">{project.progress}%</span>
                      </td>
                      <td className="table-cell hidden lg:table-cell text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(project.dueDate)}
                        </div>
                      </td>
                      {(perms.canEditProject || perms.canDeleteProject) && (
                        <td className="table-cell text-right">
                          <div className="flex items-center gap-1 justify-end">
                            {perms.canEditProject && (
                              <button onClick={() => openEdit(project)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors" title="Edit">
                                <Edit2 size={14} />
                              </button>
                            )}
                            {perms.canDeleteProject && (
                              <button onClick={() => setDeletingProject(project)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {paginatedItems.length === 0 && (
                  <tr><td colSpan={7} className="py-12">
                    <EmptyState icon={<Search size={24} />} title="No projects found" description="Try adjusting your search or filters." />
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            pagination={pagination} totalPages={totalPages}
            onPageChange={setPage} onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showAddModal} onClose={handleClose} title="Create New Project" size="lg">
        <ProjectForm />
      </Modal>
      <Modal isOpen={!!editingProject} onClose={handleClose} title="Edit Project" size="lg">
        <ProjectForm />
      </Modal>
      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={() => {
          if (deletingProject) {
            deleteProject(deletingProject.id, deletingProject.name, user.id, user.name);
            toast.success('Project deleted');
          }
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Project"
      />
    </div>
  );
};

export default Projects;
