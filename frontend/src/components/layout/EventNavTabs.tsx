import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EventItem } from '../../types';
import {
  Sparkles,
  Wallet,
  CheckSquare,
  Users,
  Store,
  FileDown,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
} from 'lucide-react';

interface EventNavTabsProps {
  event: EventItem;
}

export const EventNavTabs: React.FC<EventNavTabsProps> = ({ event }) => {
  const location = useLocation();
  const id = event._id;

  const tabs = [
    { label: 'AI Plan', path: `/events/${id}/plan`, icon: Sparkles },
    { label: 'Budget Manager', path: `/events/${id}/budget`, icon: Wallet },
    { label: 'Timeline & Tasks', path: `/events/${id}/timeline`, icon: CheckSquare },
    { label: 'Vendors', path: `/events/${id}/vendors`, icon: Store },
    { label: 'Guest List', path: `/events/${id}/guests`, icon: Users },
    { label: 'Export & Print', path: `/events/${id}/export`, icon: FileDown },
  ];

  const eventDateObj = new Date(event.eventDate);
  const now = new Date();
  const daysDiff = Math.ceil((eventDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div className="flex items-start gap-4">
            <Link
              to="/events"
              className="mt-1 p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title="Back to My Events"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
                  {event.eventType}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  {event.indoorOutdoor}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Status: <strong className="text-slate-700">{event.status}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
                {event.name}
              </h1>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <span>
                    {eventDateObj.toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-festiva-purple" />
                  <span>
                    {event.startTime || '18:00'} - {event.endTime || '23:00'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{event.city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Countdown
              </span>
              <span
                className={`text-lg font-bold font-display ${
                  daysDiff < 0
                    ? 'text-slate-400'
                    : daysDiff <= 7
                    ? 'text-rose-600'
                    : 'text-brand-600'
                }`}
              >
                {daysDiff < 0 ? 'Passed' : daysDiff === 0 ? 'Today!' : `${daysDiff} days`}
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Target Budget
              </span>
              <span className="text-lg font-bold font-display text-slate-800">
                {event.currency}
                {event.budget.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Target Guests
              </span>
              <span className="text-lg font-bold font-display text-slate-800">
                {event.guestCount}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar border-t border-slate-100 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  active
                    ? 'border-brand-600 text-brand-600 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
