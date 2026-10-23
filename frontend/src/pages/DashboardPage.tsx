import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/api';
import { EventItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  Calendar,
  Wallet,
  CheckCircle2,
  Clock,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await eventService.getAll();
      if (res.success) {
        setEvents(res.events);
      }
    } catch (err) {
      console.error('Failed to load dashboard events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Compiling your celebration dashboard..." />
      </div>
    );
  }

  // Aggregate metrics across all events
  const totalEvents = events.length;
  const totalPlannedBudget = events.reduce((sum, e) => sum + (e.budget || 0), 0);
  const totalActualSpent = events.reduce((sum, e) => sum + (e.stats?.actualSpent || 0), 0);
  const remainingBudget = totalPlannedBudget - totalActualSpent;
  const totalPendingTasks = events.reduce(
    (sum, e) => sum + ((e.stats?.taskTotal || 0) - (e.stats?.taskCompleted || 0)),
    0
  );

  // Chart data: Budget vs Spent per event
  const chartData = events.slice(0, 5).map((e) => ({
    name: e.name.length > 14 ? e.name.substring(0, 14) + '...' : e.name,
    budget: e.budget,
    spent: e.stats?.actualSpent || 0,
  }));

  const COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Banner & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-indigo-950 to-festiva-dark p-6 sm:p-8 rounded-3xl text-white shadow-premium">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-brand-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Celebration Command Center
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Track budgets, milestones, and AI blueprints across all your upcoming celebrations in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/inspiration"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold text-white backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            Inspirations
          </Link>
          <Link
            to="/create-event"
            className="px-5 py-2.5 rounded-xl gradient-brand text-sm font-bold text-white shadow-glow hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Plan New Event
          </Link>
        </div>
      </div>

      {/* Aggregate KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Total Celebrations
            </span>
            <span className="text-2xl font-black font-display text-slate-900 mt-1 block">
              {totalEvents}
            </span>
            <span className="text-xs text-brand-600 font-medium mt-0.5 block">
              Active in workspace
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Planned Budget
            </span>
            <span className="text-2xl font-black font-display text-slate-900 mt-1 block">
              ₹{totalPlannedBudget.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
              Target across all events
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Actual Expenses
            </span>
            <span className="text-2xl font-black font-display text-slate-900 mt-1 block">
              ₹{totalActualSpent.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
              Remaining: ₹{remainingBudget.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-festiva-purple flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Pending Tasks
            </span>
            <span className="text-2xl font-black font-display text-slate-900 mt-1 block">
              {totalPendingTasks}
            </span>
            <span className="text-xs text-amber-600 font-medium mt-0.5 block">
              Across timeline milestones
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart & Quick Actions Row */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spending Comparison Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Budget vs. Actual Spent by Event
                </h3>
                <p className="text-xs text-slate-500">Comparing your planned limit against real spend</p>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Amounts in INR (₹)
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`}
                  />
                  <Tooltip
                    formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="budget" fill="#E0E7FF" name="Planned Budget" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="spent" fill="#6366F1" name="Actual Spent" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions & Tips Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 mb-1">
                Quick Planner Actions
              </h3>
              <p className="text-xs text-slate-500 mb-4">Fast shortcuts for ongoing arrangements</p>

              <div className="space-y-2.5">
                <Link
                  to="/create-event"
                  className="w-full p-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Create New Celebration
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/inspiration"
                  className="w-full p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-festiva-purple text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Browse Theme Inspirations
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {events[0] && (
                  <Link
                    to={`/events/${events[0]._id}/export`}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Export Latest PDF Dossier
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong className="font-semibold block mb-1">Festiva Planning Tip:</strong>
              Lock in your venue at least 6-8 weeks prior to peak dates. Food and decor quotations fluctuate closer to auspicious festival dates!
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-slate-900">Your Upcoming Events</h2>
          <Link
            to="/events"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Celebrations Planned Yet"
            description="Start by creating your first wedding, birthday, or community gathering. Our AI planner will generate an instant roadmap!"
            actionText="Plan My First Event"
            onAction={() => (window.location.href = '/create-event')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const eventDateObj = new Date(ev.eventDate);
              const now = new Date();
              const daysDiff = Math.ceil(
                (eventDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={ev._id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                        {ev.eventType}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          daysDiff < 0
                            ? 'text-slate-400'
                            : daysDiff <= 7
                            ? 'text-rose-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {daysDiff < 0 ? 'Passed' : daysDiff === 0 ? 'Today!' : `in ${daysDiff} days`}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-display text-slate-900 group-hover:text-brand-600 transition-colors">
                      {ev.name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{eventDateObj.toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ev.city}</span>
                    </div>

                    {/* Progress Bar for Tasks */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span>Checklist Tasks</span>
                        <span className="font-semibold text-slate-700">
                          {ev.stats?.taskCompleted || 0} / {ev.stats?.taskTotal || 0} completed
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-brand-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              ev.stats?.taskTotal
                                ? Math.round(
                                    ((ev.stats?.taskCompleted || 0) / ev.stats?.taskTotal) * 100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Budget
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {ev.currency}
                        {ev.budget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Link
                      to={`/events/${ev._id}/plan`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-600 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Manage Event</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
