import { CalendarDays, Check, Pencil, RotateCcw, Trash2 } from 'lucide-react';

const priorityStyles = {
  LOW: 'bg-sky-100 text-sky-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-rose-100 text-rose-800',
};

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function TaskCard({ task, onEdit, onDelete, onStatus }) {
  const complete = task.status === 'COMPLETED';
  const overdue = !complete && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <article className={`group rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${complete ? 'border-emerald-100 opacity-75' : 'border-black/5'}`}>
      <div className="flex gap-4">
        <button
          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${complete ? 'border-moss bg-moss text-white' : 'border-ink/20 hover:border-moss hover:bg-mint'}`}
          onClick={() => onStatus(task, complete ? 'PENDING' : 'COMPLETED')}
          aria-label={complete ? 'Reopen task' : 'Complete task'}
        >
          {complete && <Check size={15} strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className={`font-bold text-ink ${complete ? 'line-through decoration-2' : ''}`}>{task.title}</h3>
              {task.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/60">{task.description}</p>}
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black tracking-wide ${priorityStyles[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${overdue ? 'text-rose-600' : 'text-ink/45'}`}>
              {task.dueDate ? <><CalendarDays size={14} />{overdue ? 'Overdue · ' : ''}{formatDate(task.dueDate)}</> : 'No due date'}
            </div>
            <div className="flex gap-1">
              <button className="icon-button" onClick={() => onStatus(task, complete ? 'PENDING' : 'COMPLETED')} title={complete ? 'Reopen' : 'Complete'}>
                {complete ? <RotateCcw size={16} /> : <Check size={16} />}
              </button>
              <button className="icon-button" onClick={() => onEdit(task)} title="Edit"><Pencil size={16} /></button>
              <button className="icon-button hover:!bg-rose-50 hover:!text-rose-600" onClick={() => onDelete(task)} title="Delete"><Trash2 size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
