/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Share2, 
  Mail, 
  Linkedin, 
  Twitter, 
  TrendingUp, 
  Megaphone,
  UserCheck,
  CheckCircle,
  Clock,
  RotateCw
} from 'lucide-react';
import { EventState } from '../types.js';

interface MarketingTabProps {
  state: EventState;
  onRefresh: () => void;
  onToggleCampaign: (id: string) => void;
}

export default function MarketingTab({ state, onRefresh, onToggleCampaign }: MarketingTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerCampaignGeneration = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/event/generate-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('AI Marketing Engine failed to parse schedule parameters.');
      }
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to auto-generate campaigns.');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Twitter/X': return <Twitter size={16} className="text-sky-500" />;
      case 'LinkedIn': return <Linkedin size={16} className="text-blue-600" />;
      default: return <Mail size={16} className="text-amber-500" />;
    }
  };

  const getPlatformStyle = (platform: string) => {
    switch (platform) {
      case 'Twitter/X': return 'border-sky-100 bg-sky-50/25';
      case 'LinkedIn': return 'border-blue-100 bg-blue-50/25';
      default: return 'border-amber-100 bg-amber-50/25';
    }
  };

  const draftCampaigns = state.marketing.filter(c => c.status === 'Draft');
  const sentCampaigns = state.marketing.filter(c => c.status === 'Sent');

  return (
    <div className="space-y-8" id="marketing-tab-root">
      
      {/* Interactive Control & Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4" id="marketing-header-panel">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone size={18} className="text-slate-600" />
            <h4 className="text-base font-bold text-slate-900">Autonomous Promotion Hub</h4>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-normal">
            The AI analyzes locked session descriptions to compile highly structured, target-segmented copy, bypassing generic layout blanks.
          </p>
        </div>

        <button
          onClick={triggerCampaignGeneration}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
          id="btn-generate-marketing"
        >
          {loading ? (
            <>
              <RotateCw className="animate-spin" size={14} />
              <span>Analyzing Themes & Agendas...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Generate Marketing Campaigns</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs" id="marketing-error-banner">
          {error}
        </div>
      )}

      {/* Campaign Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="marketing-body">
        
        {/* Left Side: Campaign Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6" id="marketing-campaign-list-column">
          <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <span>Dynamic Outreach Campaigns</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono text-[9px]">
              {state.marketing.length} Active Posts
            </span>
          </h5>

          {state.marketing.length > 0 ? (
            <div className="space-y-5" id="campaigns-grid">
              {state.marketing.map((campaign) => (
                <div 
                  key={campaign.id} 
                  className={`p-6 rounded-2xl border transition-all ${getPlatformStyle(campaign.platform)}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                        {getPlatformIcon(campaign.platform)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{campaign.platform} Integration</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                          <Clock size={12} />
                          <span>Dispatch: {campaign.scheduledTime}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => onToggleCampaign(campaign.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                        campaign.status === 'Sent'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-500'
                      }`}
                      id={`btn-campaign-dispatch-${campaign.id}`}
                    >
                      {campaign.status === 'Sent' ? 'Dispatched' : 'Launch Post'}
                    </button>
                  </div>

                  {/* Copywriting Block */}
                  <div className="bg-white/70 border border-slate-100 p-4 rounded-xl mb-4 text-xs text-slate-700 leading-relaxed font-sans font-medium whitespace-pre-wrap">
                    {campaign.copy}
                  </div>

                  {/* Segment Tag */}
                  <div className="flex items-start gap-2 text-[10px] bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                    <UserCheck size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-700">Target Cohort Segment:</span>
                      <p className="text-slate-500 mt-0.5">{campaign.targetSegment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center border border-dashed border-slate-200 rounded-3xl" id="no-campaigns-placeholder">
              <Megaphone className="mx-auto mb-4 text-slate-300" size={40} />
              <p className="text-sm font-semibold text-slate-800">No promotion campaigns generated yet.</p>
              <p className="text-xs text-slate-400 mt-1 mb-5">Click &quot;Generate Marketing Campaigns&quot; to compile agenda-matched outreach.</p>
              <button 
                onClick={triggerCampaignGeneration}
                className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Trigger AI Content Compiler
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Marketing Analytics / Reach Simulations (4 cols) */}
        <div className="lg:col-span-4 space-y-6" id="marketing-analytics-column">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs" id="outreach-dashboard-card">
            <h5 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-4">Outreach Conversion</h5>
            
            <div className="space-y-4" id="marketing-kpi-meters">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Draft Templates</span>
                  <span>{draftCampaigns.length} posts</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-400 h-full transition-all" 
                    style={{ width: `${state.marketing.length ? (draftCampaigns.length / state.marketing.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Dispatched Channels</span>
                  <span>{sentCampaigns.length} posts</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all" 
                    style={{ width: `${state.marketing.length ? (sentCampaigns.length / state.marketing.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5 space-y-3 text-xs" id="marketing-bullet-highlights">
              <div className="flex items-center gap-2.5 text-slate-600">
                <CheckCircle size={16} className="text-emerald-500" />
                <span>Custom Speaker Segment Mapping</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <CheckCircle size={16} className="text-emerald-500" />
                <span>Interactive Agenda Auto-Parsing</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <CheckCircle size={16} className="text-emerald-500" />
                <span>Zero template fill-ins required</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
