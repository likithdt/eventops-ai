/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  TrendingUp,
  RotateCw,
  Zap,
  Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { EventState, ExecutiveReport } from '../types.js';

interface OverviewTabProps {
  state: EventState;
  onRefresh: () => void;
  onToggleTask: (id: string) => void;
}

export default function OverviewTab({ state, onRefresh, onToggleTask }: OverviewTabProps) {
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const totalAttendees = state.attendees.length;
  const checkedInCount = state.attendees.filter(a => a.checkedIn).length;
  const checkInRate = totalAttendees > 0 ? Math.round((checkedInCount / totalAttendees) * 100) : 0;
  
  const activeIncidents = state.incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidentsCount = state.incidents.filter(i => i.status === 'resolved').length;
  const pendingTasks = state.tasks.filter(t => t.status !== 'done');
  const completedTasksCount = state.tasks.filter(t => t.status === 'done').length;

  const triggerExecutiveReport = async () => {
    setGeneratingReport(true);
    setReportError(null);
    try {
      const response = await fetch('/api/event/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('AI Engine failed to compile report telemetry.');
      }
      onRefresh();
    } catch (err: any) {
      setReportError(err.message || 'Failed to trigger AI executive loop.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8" id="overview-tab-root">
      {/* Dynamic Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="overview-bento-grid">
        
        {/* Stat 1: Total Attendance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="stat-attendance">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">Live Attendance</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Users size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-slate-900">{checkedInCount}</span>
              <span className="text-sm text-slate-400">/ {totalAttendees} registered</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="font-semibold text-emerald-600">{checkInRate}% Conversion</span>
              <span>check-in rate</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Active Sessions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="stat-sessions">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">Session Allocations</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Activity size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-slate-900">{state.schedule.length}</span>
              <span className="text-sm text-slate-400">Total sessions</span>
            </div>
            <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Full-schedule active on-site</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Operations Incidents */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="stat-incidents">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">Ground Incidents</span>
            <div className={`p-2 rounded-lg ${activeIncidents.length > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-slate-900">{activeIncidents.length}</span>
              <span className="text-sm text-slate-400">outstanding / {resolvedIncidentsCount} resolved</span>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              {activeIncidents.length > 0 ? (
                <span className="text-amber-600 font-medium">AI dispatch active</span>
              ) : (
                <span className="text-emerald-600 font-medium">All systems normal</span>
              )}
            </div>
          </div>
        </div>

        {/* Stat 4: Planning Progress */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="stat-tasks">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">Event Logistics</span>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-slate-900">{pendingTasks.length}</span>
              <span className="text-sm text-slate-400">tasks left / {completedTasksCount} done</span>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-500" 
                  style={{ width: `${state.tasks.length ? (completedTasksCount / state.tasks.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Core Layout: AI Reports Panel vs Real-Time Capacity Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="overview-main-layout">
        
        {/* Left: Real-Time Hourly AI Executive Summarizer (7 Cols) */}
        <div className="lg:col-span-7 space-y-6" id="ai-reporting-hub">
          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-lg relative overflow-hidden">
            {/* Background abstract ambient glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1 bg-indigo-500/20 rounded text-indigo-400">
                    <Sparkles size={14} className="animate-spin-slow" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">Self-Optimizing Agent Brain</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-50">Executive Command center</h3>
              </div>

              <button
                onClick={triggerExecutiveReport}
                disabled={generatingReport}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                id="btn-generate-report"
              >
                {generatingReport ? (
                  <>
                    <RotateCw className="animate-spin" size={16} />
                    <span>Analyzing Streams...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>Compile Report</span>
                  </>
                )}
              </button>
            </div>

            {reportError && (
              <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200 text-xs flex gap-2 items-start" id="report-error-banner">
                <Info size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span>{reportError}</span>
              </div>
            )}

            {/* Active Report View */}
            {state.reports.length > 0 ? (
              <div className="space-y-6 relative z-10" id="executive-active-report">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs font-mono text-slate-400">
                    LAST LOGGED ANALYSIS: {new Date(state.reports[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Markdown text rendered cleanly */}
                <div className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none font-sans" id="markdown-report-container">
                  <ReactMarkdown>
                    {state.reports[0].reportText}
                  </ReactMarkdown>
                </div>

                {/* Critical Action Alerts list */}
                {state.reports[0].actionAlerts && state.reports[0].actionAlerts.length > 0 && (
                  <div className="mt-6 bg-indigo-950/40 border border-indigo-900/60 p-5 rounded-2xl" id="report-action-alerts">
                    <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold block mb-3">
                      ⚠️ Agent Dispatch Directives:
                    </span>
                    <ul className="space-y-3">
                      {state.reports[0].actionAlerts.map((alert, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-200">
                          <ArrowRight size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                          <span>{alert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-800 rounded-2xl relative z-10" id="no-report-state">
                <FileText size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-sm font-medium">No Executive Telemetry Compiled yet.</p>
                <p className="text-xs text-slate-500 mt-1">Click &quot;Compile Report&quot; to prompt the agent to aggregate live logs.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Real-Time Capacity Load & Micro Logs (5 Cols) */}
        <div className="lg:col-span-5 space-y-8" id="operations-real-time-monitors">
          
          {/* Active Capacity Monitor */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs" id="capacity-monitor-card">
            <h4 className="text-sm font-semibold text-slate-900 mb-5 flex items-center justify-between">
              <span>Live Venue Capacity Loads</span>
              <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Real-Time Streams</span>
            </h4>

            <div className="space-y-5" id="session-occupancies-list">
              {state.schedule.map((session) => {
                const percent = session.capacity > 0 ? Math.round((session.checkedInCount / session.capacity) * 100) : 0;
                let barColor = 'bg-indigo-600';
                let textColor = 'text-indigo-600';
                if (percent >= 80) {
                  barColor = 'bg-red-500';
                  textColor = 'text-red-600';
                } else if (percent >= 60) {
                  barColor = 'bg-amber-500';
                  textColor = 'text-amber-600';
                }

                return (
                  <div key={session.id} className="space-y-2 p-3.5 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-xs font-mono font-medium text-slate-400">{session.startTime} • {session.room}</span>
                        <h5 className="text-xs font-semibold text-slate-800 line-clamp-1">{session.title}</h5>
                      </div>
                      <span className={`text-xs font-bold font-mono ${textColor}`}>{percent}%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Occupancy: {session.checkedInCount} / {session.capacity}</span>
                      <span>Speaker: {session.speaker}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Micro Logs: Task checklists */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs" id="pre-event-checklists-card">
            <h4 className="text-sm font-semibold text-slate-900 mb-4">Pre-Event Checklists</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1" id="overview-tasks-list">
              {state.tasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => onToggleTask(task.id)}
                  className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 cursor-pointer transition-all"
                >
                  <button 
                    className={`mt-0.5 shrink-0 rounded-md border p-0.5 transition-all cursor-pointer ${
                      task.status === 'done' 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-600' 
                        : 'border-slate-300 text-transparent hover:border-indigo-400'
                    }`}
                  >
                    <CheckCircle2 size={12} className={task.status === 'done' ? 'opacity-100' : 'opacity-0'} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium text-slate-800 leading-normal ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        {task.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Assigned: {task.assignedTo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
