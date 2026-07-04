/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  UserCircle2,
  Info,
  Flame,
  CheckCircle,
  RotateCw
} from 'lucide-react';
import { EventState, Incident } from '../types.js';

interface VenueOpsTabProps {
  state: EventState;
  onRefresh: () => void;
  onResolveIncident: (id: string, notes: string) => void;
}

export default function VenueOpsTab({ state, onRefresh, onResolveIncident }: VenueOpsTabProps) {
  const [logging, setLogging] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [logError, setLogError] = useState<string | null>(null);

  // Resolution states for resolving incident modal / inline action
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const activeIncidents = state.incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidents = state.incidents.filter(i => i.status === 'resolved');

  // Quick preset logger suggestions
  const presetPrompts = [
    'The lapel mic for Siri Vance in Hall B is crackling intermittently',
    'High arrival rates causing queue congestion near Gates 1 and 2 in Main Entrance Lobby',
    'Vendor at Booth B3 SolanaDevs complaining about weak Wi-Fi signal',
    'Catering staff reporting coffee refills are delayed in Lobby area'
  ];

  const handleLogIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    setLogging(true);
    setLogError(null);

    try {
      const response = await fetch('/api/event/log-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput })
      });

      if (!response.ok) {
        throw new Error('Ops Triage Agent rejected raw dispatch request.');
      }

      setRawInput('');
      onRefresh();
    } catch (err: any) {
      setLogError(err.message || 'Failed to triage operations log.');
    } finally {
      setLogging(false);
    }
  };

  const submitResolve = (id: string) => {
    onResolveIncident(id, resolutionNotes || 'Resolved by on-ground responder.');
    setResolvingId(null);
    setResolutionNotes('');
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8" id="venue-ops-tab-root">
      
      {/* Incident Input Console */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs" id="ops-dispatch-console">
        <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <Activity size={16} className="text-indigo-600 animate-pulse" />
          <span>Context-Aware Dispatch Input</span>
        </h4>
        <p className="text-xs text-slate-500 mb-5 leading-normal">
          Type or paste raw ground operations notices below (e.g. equipment failure, crowd congestions). The dispatch agent automatically processes priority, maps location, and assigns shift responders.
        </p>

        {logError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4" id="ops-log-error">
            {logError}
          </div>
        )}

        <form onSubmit={handleLogIncident} className="space-y-4" id="ops-log-form">
          <div className="relative">
            <textarea
              rows={3}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 leading-relaxed"
              placeholder="e.g. Mic failure in Hall A near Stage, or crowd backup at Main Gates..."
            />
            <button
              type="submit"
              disabled={logging || !rawInput.trim()}
              className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white rounded-xl cursor-pointer transition-all shadow-xs"
              id="btn-ops-submit"
            >
              {logging ? (
                <RotateCw className="animate-spin" size={14} />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>

          {/* Quick preset suggestions */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
              On-Ground Sandbox Triggers:
            </span>
            <div className="flex flex-wrap gap-2" id="preset-sandbox-buttons">
              {presetPrompts.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setRawInput(preset)}
                  className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Main Boards layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="incidents-board-layout">
        
        {/* Left: Outstanding incidents (7 cols) */}
        <div className="lg:col-span-7 space-y-5" id="active-incidents-column">
          <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <span>Outstanding Dispatch Queues</span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-mono text-[9px] font-bold">
              {activeIncidents.length} Active
            </span>
          </h5>

          {activeIncidents.length > 0 ? (
            <div className="space-y-4" id="active-incidents-list">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 leading-tight">{incident.title}</span>
                        <span className={`text-[9px] font-mono font-bold uppercase border px-1.5 py-0.5 rounded ${getPriorityBadgeStyle(incident.priority)}`}>
                          {incident.priority}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{incident.location}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>Reported: {new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-3.5 rounded-xl font-medium">
                    {incident.description}
                  </p>

                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="p-1.5 bg-slate-100 rounded-md text-slate-600">
                        <UserCircle2 size={14} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">Responder assigned</span>
                        <span className="font-semibold text-slate-700">{incident.assignedStaff}</span>
                      </div>
                    </div>

                    {resolvingId === incident.id ? (
                      <div className="flex items-center gap-2 flex-1 max-w-xs" id="resolving-form">
                        <input
                          type="text"
                          placeholder="Resolution notes..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800"
                        />
                        <button
                          onClick={() => submitResolve(incident.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg cursor-pointer transition-all"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => setResolvingId(null)}
                          className="text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setResolvingId(incident.id);
                          setResolutionNotes('');
                        }}
                        className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        id={`btn-resolve-trigger-${incident.id}`}
                      >
                        Resolve Incident
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center border border-dashed border-slate-200 rounded-3xl" id="no-active-incidents">
              <CheckCircle2 className="mx-auto mb-3 text-slate-300" size={36} />
              <p className="text-xs font-semibold text-slate-800">Clear operations queue.</p>
              <p className="text-[10px] text-slate-400 mt-1">No active incidents logged on site.</p>
            </div>
          )}
        </div>

        {/* Right: Resolved incidents history log (5 cols) */}
        <div className="lg:col-span-5 space-y-5" id="resolved-incidents-column">
          <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <span>Operational Resolution History</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-mono text-[9px]">
              {resolvedIncidents.length} Resolved
            </span>
          </h5>

          {resolvedIncidents.length > 0 ? (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1" id="resolved-incidents-list">
              {resolvedIncidents.map((incident) => (
                <div key={incident.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl text-xs space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{incident.title}</span>
                      <span className="text-[9px] font-mono bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                        RESOLVED
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{incident.description}</p>
                  
                  <div className="bg-emerald-50/50 border border-emerald-100/50 p-2.5 rounded-lg flex items-start gap-2 text-[10px] text-emerald-800 font-medium">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Mitigated by {incident.assignedStaff}:</span>
                      <p className="text-emerald-700 mt-0.5">{incident.resolutionNotes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center border border-dashed border-slate-200 rounded-3xl" id="no-resolved-history">
              <p className="text-xs font-semibold text-slate-400">No resolved history.</p>
              <p className="text-[10px] text-slate-400 mt-1">Resolution metrics populate once on-ground issues are mitigated.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
