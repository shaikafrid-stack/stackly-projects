import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../constants';
import { Permission, PaginationState } from '../types';
import { paginate, filterBySearch } from '../utils/helpers';

export const usePermissions = (): Permission => {
  const { state } = useAuth();
  if (!state.user) {
    return {
      canViewUsers: false, canCreateUser: false, canEditUser: false, canDeactivateUser: false,
      canViewProjects: false, canCreateProject: false, canEditProject: false, canDeleteProject: false,
      canViewActivity: false, canExportActivity: false, canViewAllData: false, canManageRoles: false,
    };
  }
  return PERMISSIONS[state.user.role];
};

export function usePagination<T>(items: T[], defaultPageSize = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, pageSize: defaultPageSize, total: items.length,
  });

  const paginatedItems = useMemo(() => {
    return paginate(items, pagination.page, pagination.pageSize);
  }, [items, pagination.page, pagination.pageSize]);

  const totalPages = Math.ceil(items.length / pagination.pageSize);

  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, page: Math.max(1, Math.min(page, totalPages)) }));
  };

  const setPageSize = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };

  // Reset to page 1 when items change length
  useMemo(() => {
    setPagination(prev => ({ ...prev, total: items.length, page: 1 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return {
    paginatedItems,
    pagination: { ...pagination, total: items.length },
    totalPages,
    setPage,
    setPageSize,
  };
}

export function useSearch<T>(items: T[], searchFields: (keyof T)[]) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => filterBySearch(items, query, searchFields),
    [items, query, searchFields]
  );

  return { query, setQuery, filtered };
}
