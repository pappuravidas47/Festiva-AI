import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { eventService, taskService } from '../services/api';
import { EventItem, TaskItem, TaskCategory, TaskPriority, TaskStatus, TaskMetrics } from '../types';
import { EventNavTabs } from '../components/layout/EventNavTabs';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  PlusCircle,
  Sparkles,
  Calendar,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  Flag,
} from 'lucide-react';

const CATEGORIES: TaskCategory[] = [
  'Venue',
  'Catering',
  'Decoration',
  'Invitations',
  'Vendors',
  'Entertainment',
  'Final Preparation',
];

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const TimelinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium' as TaskPriority,
    category: 'Final Preparation' as TaskCategory,
    status: 'Pending' as TaskStatus,
    assignedTo: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id, selectedCategory, selectedStatus, search, sortBy]);

  const loadData = async (eventId: string) => {
    try {
      setIsLoading(true);
      const [evRes, taskRes] = await Promise.all([
        eventService.getById(eventId),
        taskService.getTasks(eventId, {
          category: selectedCategory,
          status: selectedStatus,
          search,
          sortBy,
        }),
      ]);

      if (evRes.success) setEvent(evRes.event);
      if (taskRes.success) {
        setTasks(taskRes.tasks);
        setMetrics(taskRes.metrics);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load timeline tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await taskService.toggleTask(taskId);
      if (res.success) {
        if (res.task.status === 'Completed') {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        }
        if (id) loadData(id);
      }
    } catch (err) {
      toast.error('Failed to update task.');
    }
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      dueDate: event ? event.eventDate.split('T')[0] : new Date().toISOString().split('T')[0],
      priority: 'Medium',
      category: 'Final Preparation',
      status: 'Pending',
      assignedTo: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate.split('T')[0],
      priority: task.priority,
      category: task.category,
      status: task.status,
      assignedTo: task.assignedTo || '',
      notes: task.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData.title.trim()) return;

    try {
      setIsSaving(true);
      if (editingTask) {
        await taskService.updateTask(editingTask._id, formData);
        toast.success('Task updated.');
      } else {
        await taskService.createTask({
          ...formData,
          eventId: id,
        });
        toast.success('Task added to timeline.');
      }
      setModalOpen(false);
      loadData(id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      const res = await taskService.deleteTask(taskId);
      if (res.success) {
        toast.success('Task deleted.');
        if (id) loadData(id);
      }
    } catch (err) {
      toast.error('Failed to delete task.');
    }
  };

  const handleAutoMilestones = async () => {
    if (!id) return;
    try {
      const res = await taskService.autoGenerateMilestones(id);
      if (res.success) {
        toast.success(res.message);
        loadData(id);
      }
    } catch (err: any) {
      toast.error('Failed to auto-generate milestones.');
    }
  };

  if (isLoading && !event) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Organizing your celebration milestones..." />
      </div>
    );
  }

  if (!event) return null;

  const now = new Date();

  return (
    <div className="pb-16 animate-fade-in">
      <EventNavTabs event={event} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top 4 Metric Badges */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Tasks
              </span>
              <span className="text-2xl font-black font-display text-slate-900 mt-1 block">
                {metrics.totalCount}
              </span>
              <span className="text-xs text-brand-600 font-semibold mt-0.5 block">
                {metrics.completionPercentage}% Done
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Completed
              </span>
              <span className="text-2xl font-black font-display text-emerald-600 mt-1 block">
                {metrics.completedCount}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">Checked off</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Pending
              </span>
              <span className="text-2xl font-black font-display text-amber-600 mt-1 block">
                {metrics.pendingCount + metrics.inProgressCount}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">In flight</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Overdue
              </span>
              <span
                className={`text-2xl font-black font-display mt-1 block ${
                  metrics.overdueCount > 0 ? 'text-rose-600' : 'text-slate-400'
                }`}
              >
                {metrics.overdueCount}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">Requires attention</span>
            </div>
          </div>
        )}

        {/* Task Control Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleAutoMilestones}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-festiva-purple text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Generate Milestones</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:shadow-glow hover:scale-[1.02] transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Chronological Tasks Timeline */}
        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No Tasks Found"
            description="Add custom tasks or click 'Auto-Generate Milestones' to automatically construct a celebration roadmap based on your event date!"
            actionText="Auto-Generate Milestones"
            onAction={handleAutoMilestones}
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="relative pl-6 sm:pl-8 border-l-2 border-brand-100 space-y-6">
              {tasks.map((task) => {
                const dueDateObj = new Date(task.dueDate);
                const isOverdue = task.status !== 'Completed' && dueDateObj < now;
                const isCompleted = task.status === 'Completed';

                return (
                  <div key={task._id} className="relative group">
                    {/* Circle Node on Timeline */}
                    <button
                      onClick={() => handleToggleTask(task._id)}
                      className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-600 border-2 border-rose-400'
                          : 'bg-white border-2 border-slate-300 text-slate-300 hover:border-brand-500 hover:text-brand-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Task Card Box */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        isCompleted
                          ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                          : isOverdue
                          ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                          : 'bg-white border-slate-200/80 hover:border-brand-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              task.priority === 'Urgent'
                                ? 'bg-rose-100 text-rose-700'
                                : task.priority === 'High'
                                ? 'bg-amber-100 text-amber-700'
                                : task.priority === 'Medium'
                                ? 'bg-brand-100 text-brand-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {task.category}
                          </span>
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                              Overdue
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4
                        className={`text-sm sm:text-base font-bold font-display mt-2 ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-500" />
                          <span>
                            Due:{' '}
                            <strong className="text-slate-700">
                              {dueDateObj.toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                            </strong>
                          </span>
                        </div>
                        {task.assignedTo && <span>Assigned: {task.assignedTo}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-slide-up space-y-4">
            <h3 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-3">
              {editingTask ? 'Edit Milestone Task' : 'Add New Milestone Task'}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Schedule Food Tasting with Caterer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details, deliverable requirements, or instructions..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as TaskPriority })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as TaskCategory })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as TaskStatus })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Assigned Person (Optional)
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="e.g. Sister, Best Friend, Host"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl gradient-brand text-xs font-bold text-white shadow-md hover:shadow-glow disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : editingTask ? 'Save Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
