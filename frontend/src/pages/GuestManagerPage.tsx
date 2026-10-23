import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { eventService, guestService } from '../services/api';
import { EventItem, GuestItem, RsvpStatus, GuestGroup } from '../types';
import { EventNavTabs } from '../components/layout/EventNavTabs';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  Users,
  PlusCircle,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Copy,
  Check,
  Sparkles,
  Trash2,
  Edit,
  Mail,
  Phone,
  Utensils,
} from 'lucide-react';

const GROUPS: GuestGroup[] = ['Family', 'Friends', 'Colleagues', 'VIP', 'Neighbors', 'Other'];
const RSVP_STATUSES: RsvpStatus[] = ['Pending', 'Attending', 'Not Attending'];

export const GuestManagerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedRsvp, setSelectedRsvp] = useState<string>('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // AI Invitation Drafts Drawer
  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [invitationDrafts, setInvitationDrafts] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    group: 'Friends' as GuestGroup,
    rsvpStatus: 'Pending' as RsvpStatus,
    plusOnes: 0,
    dietaryRequirements: [] as string[],
    tableNumber: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id, selectedGroup, selectedRsvp, search]);

  const loadData = async (eventId: string) => {
    try {
      setIsLoading(true);
      const [evRes, guestRes] = await Promise.all([
        eventService.getById(eventId),
        guestService.getGuests(eventId, {
          group: selectedGroup,
          rsvpStatus: selectedRsvp,
          search,
        }),
      ]);

      if (evRes.success) setEvent(evRes.event);
      if (guestRes.success) {
        setGuests(guestRes.guests);
        setMetrics(guestRes.metrics);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load guest list.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingGuest(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      group: 'Friends',
      rsvpStatus: 'Pending',
      plusOnes: 0,
      dietaryRequirements: [],
      tableNumber: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (guest: GuestItem) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      group: guest.group,
      rsvpStatus: guest.rsvpStatus,
      plusOnes: guest.plusOnes || 0,
      dietaryRequirements: guest.dietaryRequirements || [],
      tableNumber: guest.tableNumber || '',
      notes: guest.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData.name.trim()) return;

    try {
      setIsSaving(true);
      if (editingGuest) {
        await guestService.updateGuest(editingGuest._id, formData);
        toast.success('Guest updated.');
      } else {
        await guestService.createGuest({
          ...formData,
          eventId: id,
        });
        toast.success('Guest added.');
      }
      setModalOpen(false);
      loadData(id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save guest.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('Remove this guest from list?')) return;
    try {
      const res = await guestService.deleteGuest(guestId);
      if (res.success) {
        toast.success('Guest removed.');
        if (id) loadData(id);
      }
    } catch (err) {
      toast.error('Failed to delete guest.');
    }
  };

  const handleExportCSV = async () => {
    if (!id || !event) return;
    try {
      const blob = await guestService.exportCSV(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_Guests.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Guest CSV exported successfully!');
    } catch (err) {
      toast.error('Failed to export CSV.');
    }
  };

  const handleOpenInvitationModal = async () => {
    if (!id) return;
    try {
      setInvitationModalOpen(true);
      const res = await guestService.getInvitationDrafts(id);
      if (res.success) {
        setInvitationDrafts(res.drafts);
      }
    } catch (err) {
      toast.error('Failed to generate drafts.');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Invitation text copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading && !event) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading RSVP attendee records..." />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="pb-16 animate-fade-in">
      <EventNavTabs event={event} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Metric Badges */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total In Roster
              </span>
              <span className="text-2xl font-black font-display text-slate-900 mt-1 block">
                {metrics.totalGuests}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">
                Target Capacity: {metrics.expectedCapacity}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Confirmed Attending
              </span>
              <span className="text-2xl font-black font-display text-emerald-600 mt-1 block">
                {metrics.attendingGuests}
              </span>
              <span className="text-xs text-emerald-700 font-semibold mt-0.5 block">
                Total Headcount: {metrics.totalHeadcountWithPlusOnes} (incl. +1s)
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Pending Responses
              </span>
              <span className="text-2xl font-black font-display text-amber-600 mt-1 block">
                {metrics.pendingGuests}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">Awaiting RSVP</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Not Attending
              </span>
              <span className="text-2xl font-black font-display text-slate-400 mt-1 block">
                {metrics.notAttendingGuests}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">Declined invites</span>
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guest name or email..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Groups</option>
              {GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={selectedRsvp}
              onChange={(e) => setSelectedRsvp(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All RSVPs</option>
              {RSVP_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleOpenInvitationModal}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-festiva-purple text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Invitations</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:shadow-glow hover:scale-[1.02] transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>
          </div>
        </div>

        {/* Guests Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {guests.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">No guests match your filters.</p>
              <button
                onClick={handleOpenAddModal}
                className="mt-3 text-xs font-bold text-brand-600 hover:underline"
              >
                Add a guest to the list
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">Guest Name</th>
                    <th className="py-3 px-4 font-bold">Group</th>
                    <th className="py-3 px-4 font-bold text-center">RSVP</th>
                    <th className="py-3 px-4 font-bold text-center">+1s</th>
                    <th className="py-3 px-4 font-bold">Dietary / Notes</th>
                    <th className="py-3 px-4 font-bold">Contact</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {guests.map((g) => (
                    <tr key={g._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {g.name}
                        {g.tableNumber && (
                          <span className="block text-[10px] font-normal text-slate-400">
                            Table: {g.tableNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {g.group}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            g.rsvpStatus === 'Attending'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : g.rsvpStatus === 'Not Attending'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {g.rsvpStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        +{g.plusOnes}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {g.dietaryRequirements?.length
                          ? g.dietaryRequirements.join(', ')
                          : g.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {g.phone || g.email ? (
                          <div className="space-y-0.5 text-[11px]">
                            {g.phone && <div>{g.phone}</div>}
                            {g.email && <div className="text-slate-400 truncate">{g.email}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(g)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(g._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
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

      {/* AI Invitation Drafts Modal */}
      {invitationModalOpen && invitationDrafts && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-slide-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Ready-to-Broadcast Invitation Text
                </h3>
              </div>
              <button
                onClick={() => setInvitationModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Personalized for "{event.name}" in {event.city}. Copy with 1 click to send via WhatsApp, SMS, or email:
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    WhatsApp Message Draft
                  </span>
                  <button
                    onClick={() => copyToClipboard(invitationDrafts.shortWhatsApp, 'wa')}
                    className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"
                  >
                    {copiedKey === 'wa' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'wa' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-emerald-950 whitespace-pre-line leading-relaxed">
                  {invitationDrafts.shortWhatsApp}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Warm & Casual Text
                  </span>
                  <button
                    onClick={() => copyToClipboard(invitationDrafts.warmCasual, 'wc')}
                    className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
                  >
                    {copiedKey === 'wc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'wc' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {invitationDrafts.warmCasual}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInvitationModalOpen(false)}
                className="px-5 py-2 rounded-xl gradient-brand text-xs font-bold text-white shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Guest Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-slide-up space-y-4">
            <h3 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-3">
              {editingGuest ? 'Edit Attendee' : 'Add New Guest'}
            </h3>

            <form onSubmit={handleSaveGuest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Group / Affiliation
                  </label>
                  <select
                    value={formData.group}
                    onChange={(e) =>
                      setFormData({ ...formData, group: e.target.value as GuestGroup })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    RSVP Status
                  </label>
                  <select
                    value={formData.rsvpStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, rsvpStatus: e.target.value as RsvpStatus })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {RSVP_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Plus Ones (+1s)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.plusOnes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plusOnes: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Table / Zone Number
                  </label>
                  <input
                    type="text"
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    placeholder="e.g. Table 4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Phone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Dietary / Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Pure Jain, nut allergy, VIP seating request..."
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
                  {isSaving ? 'Saving...' : editingGuest ? 'Save Guest' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
