import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { eventService, vendorService } from '../services/api';
import { EventItem, VendorItem, VendorCategory, BookingStatus } from '../types';
import { EventNavTabs } from '../components/layout/EventNavTabs';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import {
  Store,
  PlusCircle,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Edit,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  DollarSign,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const CATEGORIES: VendorCategory[] = [
  'Venue',
  'Caterer',
  'Decorator',
  'Photographer',
  'Entertainment',
  'Transport',
  'Other',
];

const BOOKING_STATUSES: BookingStatus[] = [
  'To Contact',
  'Contacted',
  'Quotation Received',
  'Shortlisted',
  'Booked',
  'Cancelled',
];

export const VendorManagerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // AI Questions Drawer
  const [questionsDrawerVendor, setQuestionsDrawerVendor] = useState<VendorItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Venue' as VendorCategory,
    contactName: '',
    phone: '',
    email: '',
    address: '',
    quotedPrice: 0,
    finalPrice: 0,
    bookingStatus: 'To Contact' as BookingStatus,
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id, selectedCategory, selectedStatus, search]);

  const loadData = async (eventId: string) => {
    try {
      setIsLoading(true);
      const [evRes, venRes] = await Promise.all([
        eventService.getById(eventId),
        vendorService.getVendors(eventId, {
          category: selectedCategory,
          status: selectedStatus,
          search,
        }),
      ]);

      if (evRes.success) setEvent(evRes.event);
      if (venRes.success) {
        setVendors(venRes.vendors);
        setMetrics(venRes.metrics);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load vendors.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      category: 'Venue',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      quotedPrice: 0,
      finalPrice: 0,
      bookingStatus: 'To Contact',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (vendor: VendorItem) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contactName: vendor.contactName || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      quotedPrice: vendor.quotedPrice || 0,
      finalPrice: vendor.finalPrice || 0,
      bookingStatus: vendor.bookingStatus,
      notes: vendor.notes || '',
    });
    setModalOpen(true);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData.name.trim()) return;

    try {
      setIsSaving(true);
      if (editingVendor) {
        await vendorService.updateVendor(editingVendor._id, formData);
        toast.success('Vendor record updated.');
      } else {
        await vendorService.createVendor({
          ...formData,
          eventId: id,
        });
        toast.success('Vendor added to event.');
      }
      setModalOpen(false);
      loadData(id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save vendor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Remove this vendor from your event?')) return;
    try {
      const res = await vendorService.deleteVendor(vendorId);
      if (res.success) {
        toast.success('Vendor removed.');
        if (id) loadData(id);
      }
    } catch (err) {
      toast.error('Failed to remove vendor.');
    }
  };

  if (isLoading && !event) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Organizing vendor records and quotations..." />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="pb-16 animate-fade-in">
      <EventNavTabs event={event} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Metric Overview Row */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Vendors
              </span>
              <span className="text-2xl font-black font-display text-slate-900 mt-1 block">
                {metrics.totalVendors}
              </span>
              <span className="text-xs text-brand-600 font-medium mt-0.5 block">
                In negotiation pipeline
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Confirmed Booked
              </span>
              <span className="text-2xl font-black font-display text-emerald-600 mt-1 block">
                {metrics.bookedVendors}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">Contracts locked</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Quoted Spend
              </span>
              <span className="text-2xl font-black font-display text-slate-900 mt-1 block">
                {event.currency}
                {metrics.totalQuotedSpend.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">Sum of active quotes</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Committed Spend
              </span>
              <span className="text-2xl font-black font-display text-brand-600 mt-1 block">
                {event.currency}
                {metrics.totalCommittedSpend.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 mt-0.5 block">Locked in contracts</span>
            </div>
          </div>
        )}

        {/* Vendor Controls */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor name..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

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

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Statuses</option>
              {BOOKING_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:shadow-glow hover:scale-[1.02] transition-all flex items-center gap-1.5 self-end sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Vendor</span>
          </button>
        </div>

        {/* Vendors List Cards */}
        {vendors.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No Vendors Added Yet"
            description="Track venue managers, caterers, decorators, and photographers. Compare quotation prices and view AI questions to ask before booking!"
            actionText="Add First Vendor"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <div
                key={vendor._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700">
                      {vendor.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        vendor.bookingStatus === 'Booked'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : vendor.bookingStatus === 'Shortlisted'
                          ? 'bg-purple-50 text-festiva-purple border border-purple-200'
                          : vendor.bookingStatus === 'Cancelled'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {vendor.bookingStatus}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold font-display text-slate-900">{vendor.name}</h4>

                  {vendor.contactName && (
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Contact: {vendor.contactName}
                    </p>
                  )}

                  <div className="space-y-1.5 mt-3 text-xs text-slate-500">
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                    {vendor.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{vendor.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Quotation Summary */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Quoted Fee
                      </span>
                      <strong className="text-slate-800 text-sm">
                        {event.currency}
                        {vendor.quotedPrice.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    {vendor.finalPrice > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-emerald-600 block">
                          Final Price
                        </span>
                        <strong className="text-emerald-700 text-sm font-bold">
                          {event.currency}
                          {vendor.finalPrice.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setQuestionsDrawerVendor(vendor)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-festiva-purple hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Vetting Questions</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(vendor)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-50"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Questions Drawer Modal */}
      {questionsDrawerVendor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-slide-up space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Questions to ask: {questionsDrawerVendor.name} ({questionsDrawerVendor.category})
                </h3>
              </div>
              <button
                onClick={() => setQuestionsDrawerVendor(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Curated by Festiva AI for {event.eventType} celebration negotiations. Never sign a contract without clarifying these:
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {questionsDrawerVendor.aiQuestions?.map((q, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{q}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setQuestionsDrawerVendor(null)}
                className="px-5 py-2 rounded-xl gradient-brand text-xs font-bold text-white shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-slide-up space-y-4">
            <h3 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-3">
              {editingVendor ? 'Edit Vendor Record' : 'Add New Vendor Record'}
            </h3>

            <form onSubmit={handleSaveVendor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Vendor / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Banquet & Lawns, Shagun Caterers"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as VendorCategory })
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
                    Booking Status
                  </label>
                  <select
                    value={formData.bookingStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, bookingStatus: e.target.value as BookingStatus })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {BOOKING_STATUSES.map((st) => (
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
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. Vikram Singh"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Quoted Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quotedPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quotedPrice: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Final Agreed (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.finalPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        finalPrice: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                  placeholder="Included items, timing slots, payment terms..."
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
                  {isSaving ? 'Saving...' : editingVendor ? 'Save Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
