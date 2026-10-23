import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventService, aiService } from '../services/api';
import { EventItem, EventPlan } from '../types';
import { EventNavTabs } from '../components/layout/EventNavTabs';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RefreshCw,
  Send,
  Copy,
  Check,
  Palette,
  MapPin,
  Utensils,
  Wallet,
  Clock,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Gift,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export const AIPlanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadEventAndPlan(id);
    }
  }, [id]);

  const loadEventAndPlan = async (eventId: string) => {
    try {
      setIsLoading(true);
      const res = await eventService.getById(eventId);
      if (res.success) {
        setEvent(res.event);
        setPlan(res.plan || null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load event plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!id) return;
    try {
      setIsGenerating(true);
      const res = await aiService.generatePlan(id);
      if (res.success && res.plan) {
        setPlan(res.plan);
        toast.success(res.message);
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefinePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !refineInstruction.trim()) return;

    try {
      setIsRefining(true);
      const res = await aiService.refinePlan(id, refineInstruction.trim());
      if (res.success && res.plan) {
        setPlan(res.plan);
        setRefineInstruction('');
        toast.success('Event blueprint successfully refined!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Refinement failed.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleRegenerateSection = async (section: string) => {
    if (!id) return;
    try {
      toast.loading(`Regenerating ${section}...`, { id: 'regen' });
      const res = await aiService.regenerateSection(id, section);
      if (res.success && res.plan) {
        setPlan(res.plan);
        toast.success(`Section updated!`, { id: 'regen' });
      }
    } catch (err: any) {
      toast.error('Failed to regenerate section.', { id: 'regen' });
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Retrieving AI event architecture..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-500">Event not found.</p>
        <Link to="/events" className="mt-4 inline-block text-brand-600 font-bold">
          Return to My Events
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16 animate-fade-in">
      <EventNavTabs event={event} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* If no plan generated yet, show Call to Action */}
        {!plan ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto shadow-sm my-6">
            <div className="w-16 h-16 rounded-2xl gradient-brand text-white flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-900">
              Generate Your Celebration Blueprint
            </h2>
            <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
              Synthesize themes, layout blueprints, banquet menus, estimated itemized budgets, and day-of schedules with Google Gemini AI.
            </p>
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="px-8 py-3.5 rounded-xl gradient-brand text-white text-sm font-bold shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing Blueprint...' : 'Generate Plan with AI'}</span>
            </button>
          </div>
        ) : (
          <>
            {/* Demo Mode Notice Banner if applicable */}
            {plan.isDemoContent && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Demo Template Mode:</strong> This blueprint was curated by the Festiva Engine.
                    To unlock live dynamic Google Gemini reasoning, configure <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">backend/.env</code>.
                  </span>
                </div>
                <button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap shadow-sm transition-all"
                >
                  Regenerate
                </button>
              </div>
            )}

            {/* AI Refinement Prompt Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Refine Plan with Natural Language</span>
              </div>
              <form onSubmit={handleRefinePlan} className="flex gap-2">
                <input
                  type="text"
                  value={refineInstruction}
                  onChange={(e) => setRefineInstruction(e.target.value)}
                  placeholder='e.g. "Reduce my budget to ₹35,000", "Suggest minimalist theme", "Add live pasta bar"'
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={isRefining || !refineInstruction.trim()}
                  className="px-5 py-2.5 rounded-xl gradient-brand text-white text-xs sm:text-sm font-bold shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isRefining ? 'Refining...' : 'Refine'}</span>
                </button>
              </form>
              <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-400 overflow-x-auto no-scrollbar">
                <span className="font-semibold text-slate-500">Quick ideas:</span>
                {[
                  'Suggest affordable decoration',
                  'Suggest 3 DIY photobooth ideas',
                  'Create kids entertainment schedule',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setRefineInstruction(sample)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 whitespace-nowrap transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview & Theme Concept Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Concept Overview */}
              <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-display text-slate-900">
                    Celebration Overview & Narrative
                  </h3>
                  <button
                    onClick={() => handleRegenerateSection('themeConcept')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                    title="Regenerate Theme"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{plan.overview}</p>

                {/* Vibe Keywords */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {plan.themeConcept?.vibeKeywords?.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold"
                    >
                      ✨ {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Theme & Color Palette Swatches */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Aesthetic Theme
                    </span>
                    <Palette className="w-4 h-4 text-brand-500" />
                  </div>
                  <h4 className="text-lg font-bold font-display text-slate-900">
                    {plan.themeConcept?.name || event.theme || 'Curated Aesthetic'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {plan.themeConcept?.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 block mb-2">
                    Harmonious Palette (Click hex to copy):
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {plan.themeConcept?.colorPalette?.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => copyToClipboard(color, `color-${idx}`)}
                        className="group relative flex flex-col items-center p-2 rounded-xl border border-slate-200 hover:border-brand-400 transition-all"
                      >
                        <span
                          className="w-8 h-8 rounded-lg shadow-inner border border-black/10 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-600 mt-1">
                          {copiedKey === `color-${idx}` ? 'Copied!' : color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Venue & Decor Layout Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Venue Guidance */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Venue Recommendations & Layout
                  </h3>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 text-xs space-y-1.5">
                  <p className="text-slate-700">
                    <strong>Recommended Type:</strong> {plan.venueRecommendations?.type}
                  </p>
                  <p className="text-slate-600">
                    <strong>Space Requirement:</strong>{' '}
                    {plan.venueRecommendations?.spaceRequirements}
                  </p>
                  <p className="text-slate-600">
                    <strong>Layout Strategy:</strong> {plan.venueRecommendations?.layoutTips}
                  </p>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 pl-2">
                  {plan.venueRecommendations?.keyFeaturesNeeded?.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Decor & DIY Suggestions */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-festiva-purple/10 text-festiva-purple flex items-center justify-center">
                    <Palette className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Decor Highlights & DIY Ideas
                  </h3>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 text-xs space-y-1.5">
                  <p className="text-slate-700">
                    <strong>Focal Point:</strong> {plan.decorations?.focalPoint}
                  </p>
                  <p className="text-slate-600">
                    <strong>Ambiance Lighting:</strong> {plan.decorations?.lighting}
                  </p>
                  <p className="text-slate-600">
                    <strong>Table Arrangements:</strong> {plan.decorations?.tableArrangements}
                  </p>
                </div>
                <div className="text-xs text-slate-600">
                  <strong className="block text-slate-800 mb-1">DIY Money Savers:</strong>
                  <ul className="space-y-1 pl-2">
                    {plan.decorations?.diyIdeas?.map((diy, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-festiva-purple" />
                        <span>{diy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Catering Menu Courses */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-slate-900">
                      Curated Catering & Dining Menu
                    </h3>
                    <p className="text-xs text-slate-400">
                      Customized for {event.guestCount} guests •{' '}
                      {event.dietaryRequirements.join(', ') || 'Mixed palate'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRegenerateSection('cateringMenu')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                  title="Regenerate Menu"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-brand-600 mb-2">
                    Welcome Drinks
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1.5">
                    {plan.cateringMenu?.welcomeDrinks?.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-amber-600 mb-2">Appetizers</h4>
                  <ul className="text-xs text-slate-700 space-y-1.5">
                    {plan.cateringMenu?.appetizers?.map((a, i) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-emerald-600 mb-2">
                    Main Course Feast
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1.5">
                    {plan.cateringMenu?.mainCourse?.map((m, i) => (
                      <li key={i}>• {m}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-rose-600 mb-2">
                    Artisan Desserts
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1.5">
                    {plan.cateringMenu?.desserts?.map((des, i) => (
                      <li key={i}>• {des}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Estimated Budget Allocation Breakdown */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">
                    Itemized Cost Estimates & Budget Breakdown
                  </h3>
                  <p className="text-xs text-slate-400">
                    Estimated allocations benchmarked for {event.city} (Disclaimer: Estimates, not
                    verified quotes)
                  </p>
                </div>
                <Link
                  to={`/events/${event._id}/budget`}
                  className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Open Interactive Budget Manager</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-bold">Category</th>
                      <th className="py-3 px-4 font-bold">Planned Line Item</th>
                      <th className="py-3 px-4 font-bold text-right">Est. Amount</th>
                      <th className="py-3 px-4 font-bold text-right">% of Total</th>
                      <th className="py-3 px-4 font-bold">Planning Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {plan.budgetBreakdown?.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-800">{item.category}</td>
                        <td className="py-3 px-4 text-slate-700">{item.item}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 text-right">
                          {event.currency}
                          {item.estimatedCost.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-right">
                          {item.percentageOfBudget}%
                        </td>
                        <td className="py-3 px-4 text-slate-400 italic">{item.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                      <td colSpan={2} className="py-3 px-4">
                        Total Estimated Allocation
                      </td>
                      <td className="py-3 px-4 text-right text-brand-600 font-extrabold text-sm">
                        {event.currency}
                        {plan.budgetBreakdown?.totalEstimatedCost.toLocaleString('en-IN')}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Day of Event Schedule & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Day Of Event Schedule */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-500" />
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Day-of-Event Master Schedule
                  </h3>
                </div>
                <div className="space-y-3">
                  {plan.dayOfSchedule?.map((sched, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs"
                    >
                      <span className="px-2.5 py-1 rounded-lg bg-brand-100 text-brand-700 font-bold whitespace-nowrap">
                        {sched.time}
                      </span>
                      <div className="flex-1">
                        <strong className="text-slate-800 block text-xs">{sched.activity}</strong>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Lead: {sched.personInCharge || 'Host / Coordinator'} • {sched.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendor Checklist & Questions */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-festiva-purple" />
                    <h3 className="text-base font-bold font-display text-slate-900">
                      Vendor Checklist & Vetting Questions
                    </h3>
                  </div>
                  <Link
                    to={`/events/${event._id}/vendors`}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    Manage Vendors
                  </Link>
                </div>
                <div className="space-y-3">
                  {plan.vendorChecklist?.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800 text-sm font-bold">{v.role}</strong>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {v.suggestedTimelineToHire}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs">{v.description}</p>
                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-brand-600 block">
                          Key Questions To Ask:
                        </span>
                        <ul className="text-[11px] text-slate-600 space-y-0.5 pl-2">
                          {v.keyQuestionsToAsk?.map((q, qidx) => (
                            <li key={qidx}>• "{q}"</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ready-to-Send Invitation Wording */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold font-display text-slate-900">
                  Ready-to-Broadcast Invitation Copy
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Formal */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Formal Invitation Card
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {plan.invitationWording?.formal}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(plan.invitationWording?.formal || '', 'formal')}
                    className="mt-4 pt-2 border-t border-slate-200/80 text-xs font-bold text-brand-600 flex items-center gap-1 hover:text-brand-700"
                  >
                    {copiedKey === 'formal' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'formal' ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

                {/* Casual */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Warm & Casual Email / Evite
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {plan.invitationWording?.casual}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(plan.invitationWording?.casual || '', 'casual')}
                    className="mt-4 pt-2 border-t border-slate-200/80 text-xs font-bold text-brand-600 flex items-center gap-1 hover:text-brand-700"
                  >
                    {copiedKey === 'casual' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'casual' ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

                {/* WhatsApp Short */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                      Quick WhatsApp / SMS
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {plan.invitationWording?.whatsappShort}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(plan.invitationWording?.whatsappShort || '', 'whatsapp')
                    }
                    className="mt-4 pt-2 border-t border-slate-200/80 text-xs font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-700"
                  >
                    {copiedKey === 'whatsapp' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'whatsapp' ? 'Copied' : 'Copy for WhatsApp'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Budget Saving Alternatives & Premium Upgrades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold font-display">
                    Budget-Saving Smart Alternatives
                  </h3>
                </div>
                <ul className="text-xs text-emerald-950 space-y-2">
                  {plan.budgetSavingAlternatives?.map((alt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{alt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-purple-50/70 border border-purple-200 space-y-3">
                <div className="flex items-center gap-2 text-purple-900">
                  <Gift className="w-5 h-5 text-festiva-purple" />
                  <h3 className="text-base font-bold font-display">Optional Luxury Upgrades</h3>
                </div>
                <ul className="text-xs text-purple-950 space-y-2">
                  {plan.premiumUpgrades?.map((upg, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-festiva-purple font-bold">•</span>
                      <span>{upg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
