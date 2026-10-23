import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService, budgetService } from '../services/api';
import { EventItem, BudgetSummary, BudgetItem, BudgetCategory, PaymentStatus } from '../types';
import { EventNavTabs } from '../components/layout/EventNavTabs';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  Wallet,
  PlusCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit,
  Download,
  CheckCircle2,
  PieChart as PieIcon,
  Tag,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const CATEGORIES: BudgetCategory[] = [
  'Venue',
  'Catering',
  'Decoration',
  'Photography',
  'Entertainment',
  'Invitations',
  'Transportation',
  'Gifts',
  'Miscellaneous',
  'Contingency',
];

const CATEGORY_COLORS: Record<string, string> = {
  Venue: '#6366F1',
  Catering: '#EC4899',
  Decoration: '#F59E0B',
  Photography: '#10B981',
  Entertainment: '#8B5CF6',
  Invitations: '#3B82F6',
  Transportation: '#14B8A6',
  Gifts: '#F97316',
  Miscellaneous: '#64748B',
  Contingency: '#EF4444',
};

export const BudgetManagerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Venue' as BudgetCategory,
    description: '',
    estimatedCost: 0,
    actualCost: 0,
    paidStatus: 'Unpaid' as PaymentStatus,
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (eventId: string) => {
    try {
      setIsLoading(true);
      const [evRes, budRes] = await Promise.all([
        eventService.getById(eventId),
        budgetService.getSummary(eventId),
      ]);

      if (evRes.success) setEvent(evRes.event);
      if (budRes.success) {
        setSummary(budRes.summary);
        setItems(budRes.items);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load budget data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      category: 'Venue',
      description: '',
      estimatedCost: 0,
      actualCost: 0,
      paidStatus: 'Unpaid',
      dueDate: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      description: item.description,
      estimatedCost: item.estimatedCost,
      actualCost: item.actualCost,
      paidStatus: item.paidStatus,
      dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
      notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData.description.trim()) return;

    if (formData.estimatedCost < 0 || formData.actualCost < 0) {
      toast.error('Cost values cannot be negative');
      return;
    }

    try {
      setIsSaving(true);
      if (editingItem) {
        const res = await budgetService.updateItem(editingItem._id, formData);
        if (res.success) {
          toast.success('Budget item updated.');
        }
      } else {
        const res = await budgetService.addItem({
          ...formData,
          eventId: id,
        });
        if (res.success) {
          toast.success('Budget item added.');
        }
      }
      setModalOpen(false);
      loadData(id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save budget item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this expense line item?')) return;
    try {
      const res = await budgetService.deleteItem(itemId);
      if (res.success) {
        toast.success('Item deleted.');
        if (id) loadData(id);
      }
    } catch (err: any) {
      toast.error('Failed to delete item.');
    }
  };

  const exportBudgetCSV = () => {
    if (!items.length || !event) return;
    const headers = ['Category', 'Description', 'Estimated Cost (INR)', 'Actual Cost (INR)', 'Paid Status', 'Notes'];
    const rows = items.map((i) => [
      `"${i.category}"`,
      `"${i.description.replace(/"/g, '""')}"`,
      i.estimatedCost,
      i.actualCost,
      `"${i.paidStatus}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_Budget.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Budget CSV exported successfully!');
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Crunching financial allocations..." />
      </div>
    );
  }

  if (!event || !summary) {
    return null;
  }

  // Format Recharts Donut data
  const pieData = summary.categoryBreakdown.map((cat) => ({
    name: cat.category,
    value: cat.actual > 0 ? cat.actual : cat.estimated,
  }));

  return (
    <div className="pb-16 animate-fade-in">
      <EventNavTabs event={event} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Over-Budget Alert Callout */}
        {summary.isOverBudget && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-sm animate-slide-up">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Over-Budget Warning</h4>
              <p className="text-xs mt-0.5">
                Total actual expenses (₹{summary.totalActual.toLocaleString('en-IN')}) exceed your target budget (₹{summary.totalBudget.toLocaleString('en-IN')}) by{' '}
                <strong className="text-rose-700">
                  ₹{(summary.totalActual - summary.totalBudget).toLocaleString('en-IN')}
                </strong>
                . Review your high-cost categories or see Festiva savings recommendations below.
              </p>
            </div>
          </div>
        )}

        {/* Top 4 Budget Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Target Budget
            </span>
            <span className="text-2xl font-black font-display text-slate-900 mt-1 block">
              {event.currency}
              {summary.totalBudget.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">Allocated limit</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Planned Estimates
            </span>
            <span className="text-2xl font-black font-display text-brand-600 mt-1 block">
              {event.currency}
              {summary.totalEstimated.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">Sum of estimated lines</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Actual Expenses
            </span>
            <span
              className={`text-2xl font-black font-display mt-1 block ${
                summary.isOverBudget ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {event.currency}
              {summary.totalActual.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Utilization: {summary.utilizationRate}%
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Remaining Budget
            </span>
            <span
              className={`text-2xl font-black font-display mt-1 block ${
                summary.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {event.currency}
              {summary.remainingBudget.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">
              {summary.remainingBudget < 0 ? 'Over limit' : 'Available buffer'}
            </span>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-700">Budget Utilization</span>
            <span
              className={`text-xs font-extrabold ${
                summary.isOverBudget ? 'text-rose-600' : 'text-brand-600'
              }`}
            >
              {summary.utilizationRate}% used
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                summary.isOverBudget ? 'bg-rose-600' : 'gradient-brand'
              }`}
              style={{ width: `${Math.min(100, summary.utilizationRate)}%` }}
            />
          </div>
        </div>

        {/* Charts & Savings Row */}
        {summary.categoryBreakdown.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Comparison Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <h3 className="text-base font-bold font-display text-slate-900 mb-1">
                Estimated vs. Actual Cost by Category
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison per category in {event.currency}
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.categoryBreakdown}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`}
                    />
                    <Tooltip
                      formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, '']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <Bar
                      dataKey="estimated"
                      fill="#E0E7FF"
                      name="Estimated"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar dataKey="actual" fill="#6366F1" name="Actual" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Savings & Advice Panel */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-brand-600">
                  <Lightbulb className="w-5 h-5" />
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Smart Savings Insights
                  </h3>
                </div>
                <div className="space-y-3 mt-3">
                  {summary.savingsSuggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed"
                    >
                      {sug}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Calculated via Festiva Rules</span>
                <span className="font-semibold text-slate-600">Real-time</span>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Table Header with Actions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">
                Detailed Expense Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Manage, edit, and track payment receipts for each vendor or item
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={exportBudgetCSV}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl gradient-brand text-xs font-bold text-white shadow-md hover:shadow-glow hover:scale-[1.02] transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">No expense line items added yet.</p>
              <button
                onClick={handleOpenAddModal}
                className="mt-3 text-xs font-bold text-brand-600 hover:underline"
              >
                Add your first expense
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold">Description</th>
                    <th className="py-3 px-4 font-bold text-right">Est. Cost</th>
                    <th className="py-3 px-4 font-bold text-right">Actual Cost</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold">Notes</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                          style={{
                            backgroundColor: CATEGORY_COLORS[item.category] || '#6366F1',
                          }}
                        />
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        {event.currency}
                        {item.estimatedCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {event.currency}
                        {item.actualCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.paidStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.paidStatus === 'Partially Paid'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.paidStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 italic max-w-xs truncate">
                        {item.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-slide-up space-y-4">
            <h3 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-3">
              {editingItem ? 'Edit Expense Item' : 'Add New Expense Item'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as BudgetCategory })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Lawn Advance Deposit, Wedding Photographer, Cake"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedCost: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Actual Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.actualCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        actualCost: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paidStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, paidStatus: e.target.value as PaymentStatus })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Receipt number, payment mode, vendor contact..."
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
                  {isSaving ? 'Saving...' : editingItem ? 'Save Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
