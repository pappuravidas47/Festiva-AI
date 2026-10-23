import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white shadow-glow">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-xl text-white tracking-tight">
                Festiva<span className="text-brand-400">.AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your Celebration, Powered by AI. Transforming weddings, birthdays, and community gatherings into stress-free, unforgettable memories.
            </p>
            <div className="text-xs text-slate-500">
              Default currency: INR (₹) • Fully customizable
            </div>
          </div>

          {/* Celebrations */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Celebrations
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/inspiration?eventType=Wedding" className="hover:text-brand-400 transition-colors">
                  Weddings & Sangeet
                </Link>
              </li>
              <li>
                <Link to="/inspiration?eventType=Birthday" className="hover:text-brand-400 transition-colors">
                  Birthdays & Milestones
                </Link>
              </li>
              <li>
                <Link to="/inspiration?eventType=Community+Event" className="hover:text-brand-400 transition-colors">
                  Community & Cultural Feasts
                </Link>
              </li>
              <li>
                <Link to="/create-event" className="hover:text-brand-400 transition-colors">
                  Anniversaries & Baby Showers
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Tools */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              AI Tools
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400">GenAI Concept Architect</span>
              </li>
              <li>
                <span className="text-slate-400">Smart Budget & Over-Budget Alerts</span>
              </li>
              <li>
                <span className="text-slate-400">Milestone Auto-Scheduler</span>
              </li>
              <li>
                <span className="text-slate-400">AI Vendor Vetting Questions</span>
              </li>
              <li>
                <span className="text-slate-400">Instant PDF & CSV Exporter</span>
              </li>
            </ul>
          </div>

          {/* Inspiration & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Festiva Studio
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/inspiration" className="hover:text-brand-400 transition-colors">
                  Color Palettes & Themes
                </Link>
              </li>
              <li>
                <Link to="/inspiration" className="hover:text-brand-400 transition-colors">
                  DIY Budget Tips
                </Link>
              </li>
              <li>
                <Link to="/signin" className="hover:text-brand-400 transition-colors">
                  Member Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-brand-400 transition-colors">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Festiva AI. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted for joyous celebrations</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>powered by Google Gemini</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
