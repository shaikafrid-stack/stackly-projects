import React from 'react';
import { NavLink, useParams } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
    isActive
      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-glow'
      : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Sidebar() {
  const { datasetId } = useParams();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5">
      <div className="px-2 mb-7 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-glow">
          📊
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-900 leading-tight tracking-tight">DataLineage</p>
          <p className="text-[11px] text-slate-400 leading-tight">Versioning Console</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <NavLink to="/" end className={linkClass}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/datasets" className={linkClass}>
          🗂️ Datasets
        </NavLink>
      </nav>

      {datasetId && (
        <>
          <p className="mt-7 mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wide text-brand-500 flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-brand-500" /> Selected dataset
          </p>
          <nav className="flex flex-col gap-1">
            <NavLink to={`/datasets/${datasetId}`} end className={linkClass}>
              📁 Overview
            </NavLink>
            <NavLink to={`/datasets/${datasetId}/versions`} className={linkClass}>
              🕓 Version History
            </NavLink>
            <NavLink to={`/datasets/${datasetId}/compare`} className={linkClass}>
              🔀 Compare Versions
            </NavLink>
            <NavLink to={`/datasets/${datasetId}/lineage`} className={linkClass}>
              🌳 Lineage
            </NavLink>
            <NavLink to={`/datasets/${datasetId}/changes`} className={linkClass}>
              📝 Change History
            </NavLink>
          </nav>
        </>
      )}

      <div className="mt-auto px-3 pt-6 text-[11px] text-slate-400">
        Task 27 · v1.0.0
      </div>
    </aside>
  );
}
