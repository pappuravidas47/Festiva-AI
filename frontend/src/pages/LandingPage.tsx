import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Wallet,
  CheckCircle2,
  Users,
  Store,
  Compass,
  Heart,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 lg:pt-20 pb-16">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-300/30 via-festiva-purple/20 to-festiva-rose/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm animate-fade-in">
            <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
            <span>Your Celebration, Powered by AI</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1] animate-slide-up">
            Plan Every Celebration.{' '}
            <span className="bg-gradient-to-r from-brand-600 via-festiva-violet to-festiva-rose bg-clip-text text-transparent">
              Perfectely.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From fairytale weddings and unforgettable birthdays to vibrant community galas.
            Festiva AI crafts personalized concepts, dynamic budgets, day-of schedules, and vendor checklists in seconds.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/create-event"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white gradient-brand shadow-glow hover:shadow-glow-violet hover:scale-[1.03] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>Plan My Event</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Features</span>
            </a>
          </div>

          {/* Social Proof Metric Highlights */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-slate-200/60">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">100%</p>
              <p className="text-xs text-slate-500 font-medium">Bespoke AI Plans</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">INR (₹)</p>
              <p className="text-xs text-slate-500 font-medium">Precision Budgeting</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">7+ Roles</p>
              <p className="text-xs text-slate-500 font-medium">Vendor Checklists</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">1-Click</p>
              <p className="text-xs text-slate-500 font-medium">PDF & CSV Exports</p>
            </div>
          </div>
        </div>
      </section>

      {/* Celebration Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold font-display text-slate-900">
            Tailored for Every Milestone
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Choose your occasion and let our intelligent engine orchestrate every detail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Wedding */}
          <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="relative h-56 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                alt="Wedding Celebration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-rose-600 flex items-center gap-1.5 shadow-sm">
                <Heart className="w-3.5 h-3.5 fill-rose-600" />
                Weddings & Sangeet
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900">
                  Dream Wedding Ceremonies
                </h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Grand mandap décor, sangeet playlists, multi-course banquet menus, and vendor contracts synchronized to perfection.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600">Explore Wedding Themes</span>
                <Link
                  to="/create-event?type=Wedding"
                  className="p-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Birthday */}
          <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="relative h-56 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"
                alt="Birthday Party Celebration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-festiva-purple flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-festiva-purple" />
                Birthdays & Milestones
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900">
                  Vibrant Birthday Bashes
                </h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  From toddler carousel themes to neon rooftop milestones. Interactive games, cake designs, and high-energy timelines.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600">Explore Birthday Themes</span>
                <Link
                  to="/create-event?type=Birthday"
                  className="p-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Community Event */}
          <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="relative h-56 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80"
                alt="Community Festival Gathering"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-amber-600 flex items-center gap-1.5 shadow-sm">
                <Users className="w-3.5 h-3.5 fill-amber-600" />
                Community & Festivals
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900">
                  Cultural & Community Galas
                </h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Society gatherings, Diwali/Holi festivals, fundraisers, and charity galas with multi-tiered attendee logistics and budgets.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600">Explore Community Ideas</span>
                <Link
                  to="/create-event?type=Community+Event"
                  className="p-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Overview Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1 rounded-full border border-brand-200">
            Intelligent Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 mt-3">
            Everything You Need For a Flawless Event
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Engineered with modern full-stack reliability, genuine MongoDB persistence, and official Google Gemini AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900">GenAI Concept Architect</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Input your city, guest count, and preferences. Gemini synthesizes a tailored theme narrative, color swatches, venue layouts, and dining courses.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900">Smart Budget Engine</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Track planned vs actual expenses with zero guesswork. Instant over-budget warnings, category utilization charts, and intelligent cost-saving suggestions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-festiva-purple flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900">Chronological Milestones</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Auto-generates milestones aligned to your event date. Track venue booking, catering tastings, invitation drops, and final run-throughs.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900">Vendor Management & AI Q&A</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Compare quotes across caterers, decorators, and photographers. Arm yourself with pointed AI-generated vetting questions for each vendor category.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900">Guest List & AI Invitations</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Monitor RSVPs, plus-ones, and dietary restrictions. Generate polished WhatsApp, SMS, and formal invitation copy ready for one-click broadcast.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-brand-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-900">PDF & CSV Document Export</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Download professionally styled PDF dossiers of your entire celebration schedule, budget breakdown, and guest list with a single click.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900 text-white py-20 rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 my-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950/60 px-3 py-1 rounded-full border border-brand-800">
            Effortless Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mt-3">
            How Festiva AI Works
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Three simple steps between your celebration idea and a pristine event blueprint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="relative">
            <div className="text-5xl font-black font-display text-brand-500/30 mb-2">01</div>
            <h3 className="text-xl font-bold text-white mb-2">Tell Us Your Vision</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Provide event type, city, date, expected guests, and target budget in our guided multi-step wizard.
            </p>
          </div>

          <div className="relative">
            <div className="text-5xl font-black font-display text-festiva-purple/30 mb-2">02</div>
            <h3 className="text-xl font-bold text-white mb-2">Gemini Synthesizes Plan</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our backend engine generates color palettes, venue layouts, itemized budgets, and day-of schedules tailored to your location.
            </p>
          </div>

          <div className="relative">
            <div className="text-5xl font-black font-display text-festiva-rose/30 mb-2">03</div>
            <h3 className="text-xl font-bold text-white mb-2">Execute with Ease</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track tasks, log real expenses, vet vendors, invite guests, and export branded PDF plans for your family and partners.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive AI Preview & Budget Calculator Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-brand-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-premium relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-festiva-amber bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Live Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mt-4">
              Real Intelligence. Zero Gimmicks.
            </h2>
            <p className="text-slate-300 mt-3 text-sm sm:text-base leading-relaxed">
              Whether you need to slice ₹15,000 off your decor, find the ideal Jain dinner menu, or coordinate 250 guests across 3 venues, Festiva AI handles the heavy lifting.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/create-event"
                className="px-6 py-3 rounded-xl gradient-brand font-semibold text-white text-sm shadow-glow hover:scale-[1.02] transition-all"
              >
                Start Event Wizard
              </Link>
              <Link
                to="/inspiration"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold text-white text-sm backdrop-blur-md transition-all flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                Browse Inspirations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Illustrative Sample Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Illustrative Sample Stories
          </span>
          <h2 className="text-3xl font-bold font-display text-slate-900 mt-2">
            Celebrations Brought to Life
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-slate-600 text-sm leading-relaxed italic">
              "The budget tracker saved us from overspending on wedding florals. When our caterer quoted high, the AI suggested 3 smart menu adjustments that saved ₹40,000 instantly!"
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                AK
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Ananya & Kabir</p>
                <p className="text-xs text-slate-500">Wedding in Udaipur • 180 Guests</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-slate-600 text-sm leading-relaxed italic">
              "Planning my daughter's 5th birthday took 15 minutes instead of 3 weekends. The schedule had exact times for cake cutting, magic show, and return favors."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-festiva-purple font-bold flex items-center justify-center text-sm">
                RS
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Rohit Sharma</p>
                <p className="text-xs text-slate-500">Birthday in Bengaluru • 45 Guests</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-slate-600 text-sm leading-relaxed italic">
              "Our neighborhood Diwali gala had over 300 residents. The guest RSVP export and volunteer milestone tasks kept our committee completely synchronized."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm">
                MN
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Meera Nair</p>
                <p className="text-xs text-slate-500">Community Gala in Pune • 300 Guests</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Common questions regarding Festiva AI planning and data privacy.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <h4 className="text-base font-bold text-slate-900">
              Does Festiva AI require a Gemini API key to work?
            </h4>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              No! Festiva AI comes with a built-in curated planner intelligence fallback. If you provide a Google Gemini API key in <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">backend/.env</code>, the app unlocks live dynamic generative AI reasoning.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <h4 className="text-base font-bold text-slate-900">
              Can I refine my event plan after it is generated?
            </h4>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Yes! You can refine your entire plan using natural language instructions such as "Reduce my budget to ₹35,000" or "Change to a minimalist outdoor dinner theme", or regenerate individual sections anytime.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <h4 className="text-base font-bold text-slate-900">
              Can I export my plan for vendors or family members?
            </h4>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Absolutely. Festiva AI generates complete branded PDF documents and CSV spreadsheets for expenses, timeline tasks, vendor quotes, and guest RSVP lists.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center p-10 sm:p-14 rounded-3xl gradient-brand text-white shadow-glow">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
            Ready to Plan Your Next Celebration?
          </h2>
          <p className="text-brand-100 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Create your account today and experience stress-free, intelligent celebration management.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/signup"
              className="px-8 py-3.5 rounded-xl bg-white text-brand-700 font-bold text-base hover:bg-slate-100 shadow-lg hover:scale-105 transition-all"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
