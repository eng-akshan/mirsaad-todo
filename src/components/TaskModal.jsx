import { useEffect, useState } from 'react';
import { LoaderCircle, X } from 'lucide-react';

const empty = { title: '', description: '', priority: 'MEDIUM', dueDate: '' };

function inputDate(date) {
  if (!date) return '';
  const value = new Date(date);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 16);
}

export function TaskModal({ task, open, onClose, onSave }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(task ? { title: task.title, description: task.description || '', priority: task.priority, dueDate: inputDate(task.dueDate) } : empty);
  }, [task, open]);

  if (!open) return null;

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-moss">{task ? 'Refine' : 'New target'}</p>
            <h2 className="mt-1 text-2xl font-black text-ink">{task ? 'Edit task' : 'Create a task'}</h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        <form className="space-y-5" onSubmit={submit}>
          <label className="field-label">Title
            <input className="field-input" name="title" value={form.title} onChange={update} maxLength={200} required autoFocus placeholder="What needs your attention?" />
          </label>
          <label className="field-label">Description
            <textarea className="field-input min-h-28 resize-y" name="description" value={form.description} onChange={update} maxLength={5000} placeholder="Add useful context…" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field-label">Priority
              <select className="field-input" name="priority" value={form.priority} onChange={update}>
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
              </select>
            </label>
            <label className="field-label">Due date
              <input className="field-input" type="datetime-local" name="dueDate" value={form.dueDate} onChange={update} />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
            <button className="button-primary min-w-32" disabled={saving}>
              {saving ? <LoaderCircle className="animate-spin" size={18} /> : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
