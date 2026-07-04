/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Megaphone, 
  Users, 
  Activity, 
  LayoutDashboard,
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { EventState } from './types.js';
import OverviewTab from './components/OverviewTab.jsx';
import PlanningTab from './components/PlanningTab.jsx';
import MarketingTab from './components/MarketingTab.jsx';
import RegistrationTab from './components/RegistrationTab.jsx';
import VenueOpsTab from './components/VenueOpsTab.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'planning' | 'marketing' | 'registration' | 'ops'>('overview');
  const [state, setState] = useState<EventState | null>(null);
  const [loadingState, setLoadingState] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fetch full event state from server-side database
  const fetchEventState = async () => {
    try {
      const response = await fetch('/api/event/state');
      if (!response.ok) {
        throw new Error('Could not synchronize event telemetry from backend.');
      }
      const data = await response.json();
      setState(data);
      setApiError(null);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Error connecting to the EventOps AI server.');
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    fetchEventState();
  }, []);

  // Sync / Action Handlers passed to modular views
  const handleToggleTask = async (id: string) => {
    try {
      const response = await fetch('/api/event/toggle-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!response.ok) throw new Error('Task update failed');
      const data = await response.json();
      setState(data.state);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleCampaign = async (id: string) => {
    try {
      const response = await fetch('/api/event/toggle-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!response.ok) throw new Error('Campaign update failed');
      const data = await response.json();
      setState(data.state);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleCheckIn = async (id: string) => {
    try {
      const response = await fetch('/api/event/toggle-check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!response.ok) throw new Error('Gate check-in failed');
      const data = await response.json();
      setState(data.state);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResolveIncident = async (id: string, notes: string) => {
    try {
      const response = await fetch('/api/event/resolve-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes })
      });
      if (!response.ok) throw new Error('Failed to resolve incident');
      const data = await response.json();
      setState(data.state);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loadingState) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6" id="app-loading-screen">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-indigo-600 mx-auto" size={40} />
          <h2 className="text-lg font-bold text-slate-800">Synchronizing EventOps AI Core...</h2>
          <p className="text-xs text-slate-500">Retrieving operational parameters, schedule maps, and live incident grids.</p>
        </div>
      </div>
    );
  }

  if (apiError || !state) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6" id="app-error-screen">
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-md max-w-md text-center space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <span>⚠️</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">Connection Interrupted</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {apiError || 'The database stream failed to load. Make sure the backend dev server is active.'}
          </p>
          <button 
            onClick={() => {
              setLoadingState(true);
              fetchEventState();
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer"
          >
            Retry Connection Stream
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col" id="app-root-container">
      {/* Upper Navigation & Brand Banner */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40" id="app-global-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Brand Logo & active event text */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold tracking-tight text-slate-950 font-sans">EventOps AI</h1>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded uppercase">
                  Self-Optimizing Ecosystem
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-sm sm:max-w-md">
                Active: <span className="font-semibold text-slate-600">{state.details.title}</span> ({state.details.venueName})
              </p>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl" id="app-tabs-navbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all ${
                activeTab === 'overview' 
                  ? 'bg-white text-slate-950 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('planning')}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all ${
                activeTab === 'planning' 
                  ? 'bg-white text-slate-950 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Compass size={14} />
              <span className="hidden sm:inline">Planning & Setup</span>
            </button>

            <button
              onClick={() => setActiveTab('marketing')}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all ${
                activeTab === 'marketing' 
                  ? 'bg-white text-slate-950 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Megaphone size={14} />
              <span className="hidden sm:inline">Marketing</span>
            </button>

            <button
              onClick={() => setActiveTab('registration')}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all ${
                activeTab === 'registration' 
                  ? 'bg-white text-slate-950 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users size={14} />
              <span className="hidden sm:inline">Registration</span>
            </button>

            <button
              onClick={() => setActiveTab('ops')}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all ${
                activeTab === 'ops' 
                  ? 'bg-white text-slate-950 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity size={14} />
              <span className="hidden sm:inline">Ops Dispatch</span>
            </button>
          </nav>

        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8" id="app-main-workspace">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            id="workspace-animate-frame"
          >
            {activeTab === 'overview' && (
              <OverviewTab 
                state={state} 
                onRefresh={fetchEventState} 
                onToggleTask={handleToggleTask}
              />
            )}

            {activeTab === 'planning' && (
              <PlanningTab 
                state={state} 
                onRefresh={fetchEventState} 
                onUpdateState={(newState) => setState(newState)}
              />
            )}

            {activeTab === 'marketing' && (
              <MarketingTab 
                state={state} 
                onRefresh={fetchEventState} 
                onToggleCampaign={handleToggleCampaign}
              />
            )}

            {activeTab === 'registration' && (
              <RegistrationTab 
                state={state} 
                onRefresh={fetchEventState} 
                onToggleCheckIn={handleToggleCheckIn}
              />
            )}

            {activeTab === 'ops' && (
              <VenueOpsTab 
                state={state} 
                onRefresh={fetchEventState} 
                onResolveIncident={handleResolveIncident}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global minimal footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12" id="app-global-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <span>EventOps AI • Centralized Self-Optimizing Event Dashboard</span>
          <span className="font-mono">Metropolitan Command System v1.2</span>
        </div>
      </footer>
    </div>
  );
}
