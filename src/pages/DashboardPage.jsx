import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, LoaderCircle, Plus, Search, Target, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatCard } from '../components/StatCard.jsx';
import { TaskCard } from '../components/TaskCard.jsx';
import { TaskModal } from '../components/TaskModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { useTasks } from '../hooks/useTasks.js';
import { api, apiError } from '../services/api.js';

export function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const stableFilters = useMemo(() => filters, [filters.search, filters.status, filters.priority]);
  const { tasks, stats, loading, refresh } = useTasks(stableFilters);
  const [modal, setModal] = useState({ open: false, task: null });

  const save = async (values) => {
    try {
      if (modal.task) await api.put(`/tasks/${modal.task.id}`, values);
      else await api.post('/tasks', values);
      toast.success(modal.task ? 'Task updated.' : 'Task created.');
      await refresh();
    } catch (error) {
      toast.error(apiError(error));
      throw error;
    }
  };

  const changeStatus = async (task, status) => {
    try {
      await api.patch(`/tasks/${task.id}/status`, { status });
      toast.success(status === 'COMPLETED' ? 'Task completed.' : 'Task reopened.');
      await refresh();
    } catch (error) { toast.error(apiError(error)); }
  };

  const remove = async (task) => {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success('Task deleted.');
      await refresh();
    } catch (error) { toast.error(apiError(error)); }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold text-moss">YOUR COMMAND CENTRE</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-ink sm:text-5xl">Good to see you, {user?.name?.split(' ')[0]}.</h1>
            <p className="mt-3 text-ink/55">Choose the next target, then make it count.</p>
          </div>
          <button className="button-primary shrink-0" onClick={() => setModal({ open: true, task: null })}><Plus size={19} /> Add task</button>
        </div>

        <section className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
          <StatCard label="All tasks" value={stats?.total ?? '—'} icon={ClipboardList} />
          <StatCard label="Completed" value={stats?.completed ?? '—'} icon={CheckCircle2} accent="bg-mint" />
          <StatCard label="Pending" value={stats?.pending ?? '—'} icon={Timer} />
          <StatCard label="Overdue" value={stats?.overdue ?? '—'} icon={AlertTriangle} accent="bg-rose-50" />
          <StatCard label="Completion" value={stats ? `${stats.completionPercentage}%` : '—'} icon={Target} accent="col-span-2 bg-lime lg:col-span-1" />
        </section>

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={19} />
              <input className="field-input bg-white pl-12" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search your tasks…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select className="field-input min-w-36 bg-white" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All statuses</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option>
              </select>
              <select className="field-input min-w-36 bg-white" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                <option value="">All priorities</option><option value="HIGH">High priority</option><option value="MEDIUM">Medium priority</option><option value="LOW">Low priority</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin text-moss" size={30} /></div>
          ) : tasks.length ? (
            <div className="grid gap-4 lg:grid-cols-2">{tasks.map((task) => <TaskCard key={task.id} task={task} onEdit={(value) => setModal({ open: true, task: value })} onDelete={remove} onStatus={changeStatus} />)}</div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/50 px-6 py-20 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-mint text-moss"><Target size={28} /></div>
              <h2 className="mt-5 text-xl font-black text-ink">No targets in sight</h2>
              <p className="mt-2 text-sm text-ink/50">{filters.search || filters.status || filters.priority ? 'Try changing your filters.' : 'Create your first task and build momentum.'}</p>
              {!filters.search && !filters.status && !filters.priority && <button className="button-primary mx-auto mt-6" onClick={() => setModal({ open: true, task: null })}><Plus size={18} /> Create first task</button>}
            </div>
          )}
        </section>
      </div>
      <TaskModal open={modal.open} task={modal.task} onClose={() => setModal({ open: false, task: null })} onSave={save} />
    </AppLayout>
  );
}
