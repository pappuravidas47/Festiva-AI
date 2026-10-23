import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { eventService, aiService } from '../services/api';
import { EventType, IndoorOutdoorPreference } from '../types';
import toast from 'react-hot-toast';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Wallet,
  Users,
  CheckCircle2,
  Palette,
  HeartHandshake,
  Utensils,
  ListChecks,
} from 'lucide-react';

const EVENT_TYPES: EventType[] = [
  'Wedding',
  'Birthday',
  'Community Event',
  'Anniversary',
  'Graduation',
  'Baby Shower',
  'Festival',
  'Custom Event',
];

const PRESET_PALETTES = [
  { name: 'Royal Crimson & Gold', colors: ['#991B1B', '#D97706', '#FEF3C7', '#1E1B4B'] },
  { name: 'Pastel Dreamscape', colors: ['#F472B6', '#818CF8', '#FDE047', '#E0E7FF'] },
  { name: 'Emerald Forest Elegance', colors: ['#065F46', '#10B981', '#F59E0B', '#1E293B'] },
  { name: 'Boho Terracotta Sunset', colors: ['#C2410C', '#EA580C', '#F59E0B', '#FFF7ED'] },
  { name: 'Neon Twilight & Ultraviolet', colors: ['#EC4899', '#8B5CF6', '#06B6D4', '#0F172A'] },
];

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as EventType) || 'Wedding';

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateAIImmediate, setGenerateAIImmediate] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    eventType: initialType,
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '23:00',
    city: 'Mumbai',
    location: '',
    budget: 150000,
    currency: '₹',
    guestCount: 100,
    indoorOutdoor: 'Indoor' as IndoorOutdoorPreference,
    theme: '',
    preferredColors: PRESET_PALETTES[0].colors,
    culturalPreferences: '',
    dietaryRequirements: ['Vegetarian', 'Non-Vegetarian'],
    priorities: ['Venue', 'Catering', 'Photography'],
    additionalNotes: '',
  });

  const nextStep = () => {
    if (step === 1 && !formData.name.trim()) {
      toast.error('Please enter a name for your celebration');
      return;
    }
    if (step === 2 && (!formData.city.trim() || !formData.eventDate)) {
      toast.error('Please specify the date and city');
      return;
    }
    if (step === 3 && (formData.budget < 0 || formData.guestCount < 1)) {
      toast.error('Please provide valid budget and guest count');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDietaryToggle = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      dietaryRequirements: prev.dietaryRequirements.includes(item)
        ? prev.dietaryRequirements.filter((i) => i !== item)
        : [...prev.dietaryRequirements, item],
    }));
  };

  const handlePriorityToggle = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(item)
        ? prev.priorities.filter((i) => i !== item)
        : [...prev.priorities, item],
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await eventService.create(formData);
      if (res.success && res.event) {
        toast.success('Celebration created in Festiva AI!');

        // If auto AI generation toggle is on, trigger generatePlan
        if (generateAIImmediate) {
          toast.loading('Generating your AI celebration blueprint...', { id: 'ai-gen' });
          try {
            await aiService.generatePlan(res.event._id);
            toast.success('AI Plan ready!', { id: 'ai-gen' });
          } catch (err) {
            toast.dismiss('ai-gen');
            console.warn('AI plan generation error, can be retried on plan page');
          }
        }

        navigate(`/events/${res.event._id}/plan`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save event. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Wizard Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-3 border border-brand-200">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Celebration Wizard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900">
          Plan Your Event Blueprint
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
          Share your celebration vision. Festiva AI will organize timelines, itemized budgets, and curated vendor lists.
        </p>

        {/* 5-Step Progress Indicator */}
        <div className="mt-8 flex items-center justify-between max-w-2xl mx-auto relative px-2">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 -z-10" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-brand-600 -translate-y-1/2 -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />

          {[
            { num: 1, label: 'Basics' },
            { num: 2, label: 'Schedule' },
            { num: 3, label: 'Budget' },
            { num: 4, label: 'Theme' },
            { num: 5, label: 'Review' },
          ].map((item) => {
            const isCompleted = step > item.num;
            const isCurrent = step === item.num;
            return (
              <div key={item.num} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100 scale-110 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : item.num}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                    isCurrent ? 'text-brand-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-premium p-6 sm:p-10">
        {/* STEP 1: EVENT BASICS */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold font-display text-slate-900 border-b border-slate-100 pb-3">
              Step 1: Event Basics
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Celebration Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Diya & Arjun's Grand Sangeet or Rohan's 30th Birthday"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Event Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EVENT_TYPES.map((type) => {
                  const selected = formData.eventType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, eventType: type })}
                      className={`p-3 rounded-2xl text-left border text-xs font-bold transition-all ${
                        selected
                          ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-200 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Venue Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['Indoor', 'Outdoor', 'Hybrid', 'Flexible'] as IndoorOutdoorPreference[]).map(
                  (pref) => {
                    const selected = formData.indoorOutdoor === pref;
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => setFormData({ ...formData, indoorOutdoor: pref })}
                        className={`p-3 rounded-2xl text-center border text-xs font-bold transition-all ${
                          selected
                            ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {pref}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SCHEDULE & LOCATION */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold font-display text-slate-900 border-b border-slate-100 pb-3">
              Step 2: Date, Time & City
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Event Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  City / Destination *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mumbai, Jaipur, Bengaluru, Delhi NCR"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Specific Venue or Address (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Taj Lands End, Bandra or Private Lawn"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FINANCIALS & GUESTS */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold font-display text-slate-900 border-b border-slate-100 pb-3">
              Step 3: Budget & Expected Guests
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Total Budget Limit ({formData.currency})
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[50000, 150000, 500000, 1000000].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setFormData({ ...formData, budget: b })}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-600 hover:bg-brand-50 hover:text-brand-600"
                    >
                      ₹{(b / 1000).toLocaleString()}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Expected Headcount (Guests)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.guestCount}
                  onChange={(e) =>
                    setFormData({ ...formData, guestCount: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex gap-2 mt-2">
                  {[25, 50, 100, 250, 500].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, guestCount: g })}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-600 hover:bg-brand-50 hover:text-brand-600"
                    >
                      {g} Guests
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200 text-xs text-brand-900 leading-relaxed">
              <strong>Estimated per-guest budget:</strong> approx.{' '}
              <strong className="text-brand-700 text-sm font-bold">
                ₹{Math.round(formData.budget / Math.max(1, formData.guestCount)).toLocaleString('en-IN')}
              </strong>{' '}
              / guest. This will shape venue category, catering menu tiers, and stage decor complexity.
            </div>
          </div>
        )}

        {/* STEP 4: PREFERENCES & THEME */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold font-display text-slate-900 border-b border-slate-100 pb-3">
              Step 4: Aesthetics & Cultural Preferences
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Celebration Theme Idea (Optional)
              </label>
              <input
                type="text"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                placeholder="e.g. Royal Golden Hour, Minimalist Zen, Bohemian Sunset, Cyberpunk Neon"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Curated Color Palettes
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_PALETTES.map((p) => {
                  const isSelected =
                    JSON.stringify(formData.preferredColors) === JSON.stringify(p.colors);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredColors: p.colors })}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-800">{p.name}</span>
                      <div className="flex gap-1.5">
                        {p.colors.map((c) => (
                          <span
                            key={c}
                            className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Dietary Requirements
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Pure Vegetarian',
                  'Jain Friendly',
                  'Non-Vegetarian',
                  'Halal',
                  'Vegan Options',
                  'Gluten-Free',
                  'Nut-Free',
                ].map((item) => {
                  const selected = formData.dietaryRequirements.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleDietaryToggle(item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Top Priorities
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Venue',
                  'Catering',
                  'Decoration',
                  'Photography',
                  'Entertainment',
                  'Invitations',
                ].map((item) => {
                  const selected = formData.priorities.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handlePriorityToggle(item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Additional Notes / Cultural Specifics
              </label>
              <textarea
                rows={2}
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                placeholder="Mention any religious customs, special surprise moments, or sound curfew guidelines..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & CONFIRM */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold font-display text-slate-900 border-b border-slate-100 pb-3">
              Step 5: Review & Confirm Plan
            </h2>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase text-brand-600 bg-brand-100/70 px-2.5 py-0.5 rounded-full">
                    {formData.eventType}
                  </span>
                  <h3 className="text-xl font-bold font-display text-slate-900 mt-1">
                    {formData.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Date & Time</span>
                  <strong className="text-slate-800 text-sm">{formData.eventDate}</strong>
                  <span className="text-slate-500 block">
                    {formData.startTime} - {formData.endTime}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">City / Venue</span>
                  <strong className="text-slate-800 text-sm">{formData.city}</strong>
                  <span className="text-slate-500 block">{formData.indoorOutdoor}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Total Budget</span>
                  <strong className="text-slate-800 text-sm">
                    {formData.currency}
                    {formData.budget.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Expected Guests</span>
                  <strong className="text-slate-800 text-sm">{formData.guestCount} guests</strong>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Color Palette:</span>
                <div className="flex gap-1.5">
                  {formData.preferredColors.map((c) => (
                    <span
                      key={c}
                      className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Instant AI Generation Toggle */}
            <div className="p-4 rounded-2xl border border-brand-200 bg-brand-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-brand text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Auto-Generate GenAI Blueprint
                  </h4>
                  <p className="text-xs text-slate-500">
                    Immediately craft theme concepts, budget breakdowns, and checklists upon creation.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={generateAIImmediate}
                onChange={(e) => setGenerateAIImmediate(e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Wizard Navigation Action Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl gradient-brand text-sm font-bold text-white shadow-md hover:shadow-glow hover:scale-[1.01] transition-all flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl gradient-brand text-sm font-bold text-white shadow-glow hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Event...' : 'Create & Generate Blueprint'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
