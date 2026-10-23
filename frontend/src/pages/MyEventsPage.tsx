import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/api';
import { EventItem, EventType } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  Calendar,
  PlusCircle,
  Copy,
  Trash2,
  Edit,
  MapPin,
  Clock,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

export const MyEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalEvent, setDeleteModalEvent] = useState<EventItem | null>(null);

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
      console.error(err);
      toast.error('Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await eventService.duplicate(id);
      if (res.success) {
        toast.success(res.message || 'Event duplicated successfully!');
        fetchEvents();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to duplicate event.');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalEvent) return;
    try {
      const res = await eventService.delete(deleteModalEvent._id);
      if (res.success) {
        toast.success('Event deleted.');
        setEvents((prev) => prev.filter((e) => e._id !== deleteModalEvent._id));
        setDeleteModalEvent(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesType = selectedType === 'All' || ev.eventType === selectedType;
    const matchesSearch =
      ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading your celebration collection..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900">My Events</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your weddings, birthdays, anniversaries, and community celebrations.
          </p>
        </div>
        <Link
          to="/create-event"
          className="px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold shadow-md hover:shadow-glow hover:scale-[1.02] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Plan New Event
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {['All', 'Wedding', 'Birthday', 'Community Event', 'Anniversary'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedType === type
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Celebrations Found"
          description={
            searchQuery || selectedType !== 'All'
              ? 'Try modifying your search or filter criteria.'
              : 'You haven’t created any celebrations yet. Start with our AI event wizard!'
          }
          actionText="Create Celebration"
          onAction={() => (window.location.href = '/create-event')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const eventDateObj = new Date(ev.eventDate);
            const now = new Date();
            const daysDiff = Math.ceil(
              (eventDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={ev._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700">
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
                      {daysDiff < 0 ? 'Passed' : daysDiff === 0 ? 'Today!' : `${daysDiff} days left`}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-slate-900 line-clamp-1">
                    {ev.name}
                  </h3>

                  <div className="space-y-1.5 mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span>{eventDateObj.toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-festiva-purple" />
                      <span>
                        {ev.startTime || '18:00'} - {ev.endTime || '23:00'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{ev.city}</span>
                    </div>
                  </div>

                  {/* Summary Metrics Pill */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                        Budget Limit
                      </span>
                      <strong className="text-slate-900 text-sm">
                        {ev.currency}
                        {ev.budget.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                        Guests
                      </span>
                      <strong className="text-slate-900 text-sm">{ev.guestCount}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(ev._id)}
                      title="Duplicate Event"
                      className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/edit-event/${ev._id}`}
                      title="Edit Event Settings"
                      className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteModalEvent(ev)}
                      title="Delete Event"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/events/${ev._id}/plan`}
                    className="px-4 py-2 rounded-xl gradient-brand text-white text-xs font-bold shadow-sm hover:shadow-glow hover:scale-[1.02] transition-all flex items-center gap-1.5"
                  >
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-slide-up space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold font-display text-slate-900">Delete Celebration?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete "<strong>{deleteModalEvent.name}</strong>"? All associated AI plans, budget records, timeline tasks, vendors, and guests will be permanently removed.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalEvent(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
