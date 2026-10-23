import React, { useEffect, useState } from 'react';
import { inspirationService, eventService, aiService } from '../services/api';
import { InspirationItem, EventItem } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Compass,
  Heart,
  Palette,
  Sparkles,
  Search,
  Filter,
  Check,
  Copy,
  Lightbulb,
  ArrowRight,
  Send,
  Calendar,
} from 'lucide-react';

export const InspirationStudioPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [inspirations, setInspirations] = useState<InspirationItem[]>([]);
  const [userEvents, setUserEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedEventType, setSelectedEventType] = useState<string>('All');
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<string>('All');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Apply to event modal
  const [applyModalInspiration, setApplyModalInspiration] = useState<InspirationItem | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // AI Idea Prompt Generator
  const [customPrompt, setCustomPrompt] = useState('');
  const [isPromptingAI, setIsPromptingAI] = useState(false);
  const [aiGeneratedIdeas, setAiGeneratedIdeas] = useState<any[]>([]);

  useEffect(() => {
    loadInspirations();
    if (isAuthenticated) {
      eventService
        .getAll()
        .then((res) => {
          if (res.success) setUserEvents(res.events);
        })
        .catch(() => {});
    }
  }, [selectedEventType, selectedBudgetTier, isAuthenticated]);

  const loadInspirations = async () => {
    try {
      setIsLoading(true);
      const res = await inspirationService.getAll({
        eventType: selectedEventType,
        budgetTier: selectedBudgetTier,
      });
      if (res.success) {
        setInspirations(res.inspirations);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inspirations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save your favorite inspirations!');
      return;
    }
    try {
      const res = await inspirationService.toggleFavorite(id);
      if (res.success) {
        toast.success(res.message);
        setInspirations((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, isFavorited: res.isFavorited } : item
          )
        );
      }
    } catch (err) {
      toast.error('Failed to update favorite.');
    }
  };

  const handleApplyToEvent = async () => {
    if (!applyModalInspiration || !selectedEventId) {
      toast.error('Please select an event');
      return;
    }
    try {
      const res = await inspirationService.applyToEvent(
        applyModalInspiration._id,
        selectedEventId
      );
      if (res.success) {
        toast.success(res.message);
        setApplyModalInspiration(null);
      }
    } catch (err: any) {
      toast.error('Failed to apply theme to event.');
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    try {
      setIsPromptingAI(true);
      const res = await aiService.suggestIdeas({
        eventType: selectedEventType === 'All' ? 'Wedding & Party' : selectedEventType,
        prompt: customPrompt.trim(),
      });
      if (res.success && res.ideas) {
        setAiGeneratedIdeas(res.ideas);
        toast.success('Curated AI concepts generated!');
      }
    } catch (err) {
      toast.error('Failed to generate suggestions.');
    } finally {
      setIsPromptingAI(false);
    }
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast.success(`Copied ${hex}!`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-festiva-purple via-brand-700 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white shadow-premium">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold mb-3 border border-white/20">
            <Compass className="w-3.5 h-3.5" />
            <span>Festiva Inspiration Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display">
            Explore Themes, Color Harmonies & Concepts
          </h1>
          <p className="text-sm sm:text-base text-slate-200 mt-2 leading-relaxed">
            Curated moodboards for weddings, birthdays, and community gatherings. Pick palettes, discover DIY hacks, and apply directly to your celebrations.
          </p>
        </div>
      </div>

      {/* AI Inspiration Generator Prompt Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-brand-600">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-base font-bold font-display text-slate-900">
            Generate Custom Concepts with Gemini AI
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Have a distinct idea? Ask our AI engine to devise custom themes, color hexes, and budget-conscious decor.
        </p>

        <form onSubmit={handleAskAI} className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder='e.g. "Suggest an elegant outdoor wedding theme for 100 guests in Jaipur with ₹2,00,000 budget"'
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
          <button
            type="submit"
            disabled={isPromptingAI || !customPrompt.trim()}
            className="px-6 py-2.5 rounded-xl gradient-brand text-white text-xs sm:text-sm font-bold shadow-md hover:scale-[1.01] transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPromptingAI ? 'Brainstorming...' : 'Ask AI'}</span>
          </button>
        </form>

        {/* AI Output Cards */}
        {aiGeneratedIdeas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 animate-slide-up">
            {aiGeneratedIdeas.map((idea, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-brand-50/50 border border-brand-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-2.5 py-0.5 rounded-full">
                    {idea.budgetTier || 'Custom Tier'}
                  </span>
                  <div className="flex gap-1.5">
                    {idea.colorPalette?.map((c: string, ci: number) => (
                      <span
                        key={ci}
                        className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="text-base font-bold font-display text-slate-900">{idea.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{idea.concept}</p>

                {idea.budgetTip && (
                  <p className="text-[11px] text-brand-800 font-medium pt-1">
                    💡 <strong>Smart Tip:</strong> {idea.budgetTip}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Event Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 mr-1">Occasion:</span>
          {['All', 'Wedding', 'Birthday', 'Community Event'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedEventType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedEventType === type
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Budget Tier Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 mr-1">Budget Tier:</span>
          {['All', 'Low-Budget', 'Standard', 'Luxury'].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedBudgetTier(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedBudgetTier === tier
                  ? 'bg-festiva-purple text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Inspirations Grid */}
      {isLoading ? (
        <LoadingSpinner text="Curating festive moodboards..." />
      ) : inspirations.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No Inspirations Found"
          description="Try relaxing your filters to see more celebration styles."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {inspirations.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-brand-700 shadow-sm">
                      {item.eventType}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-xs font-bold text-white shadow-sm">
                      {item.budgetTier}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleFavorite(item._id)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-600 shadow-sm transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.isFavorited ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.style}
                    </span>
                    <h3 className="text-xl font-bold font-display text-slate-900 mt-0.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Palette Swatches */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase">
                      Color Swatches (Click to copy)
                    </span>
                    <div className="flex gap-2">
                      {item.colorPalette.map((color, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => copyColor(color)}
                          className="w-7 h-7 rounded-lg border border-black/10 shadow-inner hover:scale-110 transition-transform relative"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                    <strong className="block text-slate-800 text-[11px]">Décor Highlights:</strong>
                    <ul className="space-y-0.5 pl-2">
                      {item.decorIdeas.slice(0, 2).map((d, i) => (
                        <li key={i} className="line-clamp-1">
                          • {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => setApplyModalInspiration(item)}
                  className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-600 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Apply Theme to My Event</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply to Event Modal */}
      {applyModalInspiration && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-slide-up space-y-4">
            <h3 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-3">
              Apply Theme: {applyModalInspiration.title}
            </h3>

            <p className="text-xs text-slate-500">
              Select which celebration will adopt this aesthetic theme and color palette:
            </p>

            {userEvents.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 text-xs text-amber-800">
                You haven't created an event yet.{' '}
                <a href="/create-event" className="font-bold underline">
                  Create one now
                </a>
                .
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Select Event
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Choose celebration --</option>
                  {userEvents.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.name} ({ev.eventType})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setApplyModalInspiration(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyToEvent}
                disabled={!selectedEventId}
                className="px-5 py-2 rounded-xl gradient-brand text-xs font-bold text-white shadow-md disabled:opacity-50"
              >
                Apply Palette
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
