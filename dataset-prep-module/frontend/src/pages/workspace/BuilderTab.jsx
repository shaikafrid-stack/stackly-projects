import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown, GripVertical, Wand2 } from 'lucide-react';
import { DatasetAPI, TransformAPI } from '../../api/endpoints';
import { Modal, ConfirmDialog, EmptyState, LoadingState } from '../../components/Overlay';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES, OP_LABELS, DATA_TYPES, FILTER_OPERATORS, FIELD_LABELS } from '../../utils/transformCatalog';

function StepForm({ dataset, columns, initial, onSave, onCancel }) {
  const [opType, setOpType] = useState(initial?.transformation_type || CATEGORIES[0].ops[0].type);
  const [config, setConfig] = useState(initial ? JSON.parse(initial.configuration || '{}') : {});
  const [column, setColumn] = useState(initial?.column_name || columns[0]?.name || '');

  const activeOp = useMemo(() => CATEGORIES.flatMap((c) => c.ops).find((o) => o.type === opType), [opType]);

  const setField = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    const finalConfig = { ...config };
    if (activeOp.fields.includes('column')) finalConfig.column = column;
    onSave({ transformation_type: opType, column_name: column || null, configuration: finalConfig });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Transformation Category</label>
        <div className="grid grid-cols-1 gap-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">{cat.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.ops.map((op) => (
                  <button
                    key={op.type}
                    onClick={() => { setOpType(op.type); setConfig({}); }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                      opType === op.type
                        ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-glow`
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {activeOp.fields.includes('column') && (
          <div>
            <label className="label">Column</label>
            <select className="input" value={column} onChange={(e) => setColumn(e.target.value)}>
              {columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        )}

        {activeOp.fields.filter((f) => f !== 'column').map((field) => {
          if (field === 'newType') {
            return (
              <div key={field}>
                <label className="label">{FIELD_LABELS[field]}</label>
                <select className="input" value={config.newType || DATA_TYPES[0]} onChange={(e) => setField('newType', e.target.value)}>
                  {DATA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            );
          }
          if (field === 'operator') {
            return (
              <div key={field}>
                <label className="label">{FIELD_LABELS[field]}</label>
                <select className="input" value={config.operator || FILTER_OPERATORS[0].value} onChange={(e) => setField('operator', e.target.value)}>
                  {FILTER_OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            );
          }
          const numeric = ['precision', 'amount', 'factor'].includes(field);
          return (
            <div key={field}>
              <label className="label">{FIELD_LABELS[field]}</label>
              <input
                type={numeric ? 'number' : 'text'}
                step={field === 'precision' ? 1 : 'any'}
                className="input"
                value={config[field] ?? ''}
                onChange={(e) => setField(field, numeric ? e.target.value : e.target.value)}
                placeholder={field === 'newName' ? 'e.g. customerName' : field === 'value' ? 'Replacement / filter value' : ''}
              />
            </div>
          );
        })}

        {activeOp.fields.length === 0 && (
          <p className="text-sm text-slate-500 sm:col-span-2">This operation requires no additional configuration — it applies across the whole dataset.</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={handleSubmit}>
          <Wand2 size={15} /> {initial ? 'Update Step' : 'Add Step'}
        </button>
      </div>
    </div>
  );
}

export default function BuilderTab({ dataset, onChanged }) {
  const toast = useToast();
  const [columns, setColumns] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      DatasetAPI.preview(dataset.id),
      TransformAPI.listSteps(dataset.id)
    ]).then(([p, s]) => {
      setColumns(p.data.data.columns);
      setSteps(s.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(load, [dataset.id]);

  const handleSave = async (payload) => {
    try {
      if (editingStep) {
        await TransformAPI.updateStep(editingStep.id, payload);
        toast.success('Transformation step updated.');
      } else {
        await TransformAPI.addStep(dataset.id, payload);
        toast.success('Transformation step added.');
      }
      setModalOpen(false);
      setEditingStep(null);
      load();
      onChanged && onChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transformation step.');
    }
  };

  const handleDelete = async () => {
    try {
      await TransformAPI.deleteStep(deleteTarget.id);
      toast.success('Step removed.');
      setDeleteTarget(null);
      load();
      onChanged && onChanged();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete step.');
    }
  };

  const move = async (index, dir) => {
    const newSteps = [...steps];
    const target = index + dir;
    if (target < 0 || target >= newSteps.length) return;
    [newSteps[index], newSteps[target]] = [newSteps[target], newSteps[index]];
    setSteps(newSteps);
    await TransformAPI.reorder(dataset.id, newSteps.map((s) => s.id));
    onChanged && onChanged();
  };

  if (loading) return <LoadingState label="Loading transformation builder..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-700">Transformation Steps</p>
          <p className="text-xs text-slate-400">Steps execute top to bottom, in this exact order.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingStep(null); setModalOpen(true); }}>
          <Plus size={16} /> Add Transformation
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="card">
          <EmptyState icon={Wand2} title="No transformations yet" subtitle="Add your first transformation step to start building the pipeline." />
        </div>
      ) : (
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="card p-4 flex items-center gap-3 animate-fade-in">
              <GripVertical size={16} className="text-slate-300" />
              <div className="w-8 h-8 rounded-full bg-brand-gradient text-white flex items-center justify-center text-xs font-bold shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-700 text-sm">{OP_LABELS[step.transformation_type] || step.transformation_type}</p>
                <p className="text-xs text-slate-400 truncate">
                  {step.column_name ? `Column: ${step.column_name}` : 'Applies to entire dataset'}
                  {step.configuration && Object.keys(JSON.parse(step.configuration || '{}')).length > 0 && (
                    <span> · {Object.entries(JSON.parse(step.configuration)).filter(([k]) => k !== 'column').map(([k, v]) => `${k}: ${v}`).join(', ')}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="btn-ghost !p-1.5" disabled={idx === 0} onClick={() => move(idx, -1)}><ArrowUp size={14} /></button>
                <button className="btn-ghost !p-1.5" disabled={idx === steps.length - 1} onClick={() => move(idx, 1)}><ArrowDown size={14} /></button>
                <button className="btn-ghost !p-1.5" onClick={() => { setEditingStep(step); setModalOpen(true); }}><Pencil size={14} /></button>
                <button className="btn-ghost !p-1.5 text-rose-500 hover:bg-rose-50" onClick={() => setDeleteTarget(step)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingStep(null); }} title={editingStep ? 'Edit Transformation' : 'Add Transformation'} size="lg">
        <StepForm dataset={dataset} columns={columns} initial={editingStep} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditingStep(null); }} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        danger
        title="Remove transformation step?"
        message="This step will be removed from the pipeline. This cannot be undone."
        confirmLabel="Remove"
      />
    </div>
  );
}
