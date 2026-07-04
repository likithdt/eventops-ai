/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Users, 
  ListTodo, 
  Store, 
  UserSquare2, 
  Compass, 
  Play, 
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { EventState } from '../types.js';

interface PlanningTabProps {
  state: EventState;
  onRefresh: () => void;
  onUpdateState: (newState: EventState) => void;
}

export default function PlanningTab({ state, onRefresh, onUpdateState }: PlanningTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states initialized with current active event state
  const [title, setTitle] = useState(state.details.title);
  const [targetAttendees, setTargetAttendees] = useState(state.details.targetAttendees);
  const [venueName, setVenueName] = useState(state.details.venueName);
  const [floorPlanNotes, setFloorPlanNotes] = useState(state.details.floorPlanNotes);
  const [speakersInput, setSpeakersInput] = useState(state.details.speakers.join('\n'));
  const [constraintsInput, setConstraintsInput] = useState(state.details.vendorConstraints.join('\n'));

  // Pre-configured industry templates to quickly demonstrate the AI's power
  const loadPresetTemplate = (type: 'sustainability' | 'healthcare' | 'design') => {
    switch (type) {
      case 'sustainability':
        setTitle('EcoLogic 2026: Green Supply Expo');
        setTargetAttendees(1200);
        setVenueName('Pacific Botanical Convention Center');
        setFloorPlanNotes('Grand Pavilion (Cap: 1000), Greenhouse Room (Cap: 300), Outdoor Exhibitor Walkway (holds up to 40 vendor kiosks). Registration at South Gate.');
        setSpeakersInput([
          'Dr. Maya Lin (Sustainability Director, EarthLogix)',
          'Arnaud Dubois (Founder, ZeroCarbon Rail)',
          'Elena Rostova (Facility Ops Lead)'
        ].join('\n'));
        setConstraintsInput([
          'Greenhouses require continuous ventilation',
          'Heavy transport exhibitors must load-in through the double bay doors only',
          'Outdoor solar kiosks require direct overhead sunlight exposure'
        ].join('\n'));
        break;
      case 'healthcare':
        setTitle('BioHealth AI & Telemedicine Summit');
        setTargetAttendees(450);
        setVenueName('Symphony Medical Complex');
        setFloorPlanNotes('Auditorium Alpha (Cap: 400), Lab Hub C (Cap: 100), Main Atrium (20 Sponsor booths). Entry points restricted for sanitization checks.');
        setSpeakersInput([
          'Dr. Charles Vance (Neuroscience Chair, Stanford Health)',
          'Aria Chen (Surgical Automation lead, RobotDoc)',
          'Marcus Kane (Logistics Director)'
        ].join('\n'));
        setConstraintsInput([
          'Interactive robotic display booths require high-throughput local fiber connections',
          'Catering must be separated from diagnostic demo stations',
          'Sponsor signage must not obstruct emergency fire exits'
        ].join('\n'));
        break;
      case 'design':
        setTitle('FrameCon: Future of Digital Media & UX');
        setTargetAttendees(700);
        setVenueName('Prism Cinema & Arts Pavilion');
        setFloorPlanNotes('Theater 1 (Cap: 500), Interactive Sandbox (Cap: 200), Gallery Lobby (15 Creator booths). Dim ambient lighting required for projections.');
        setSpeakersInput([
          'Siri Vance (Principal UX Designer, Framelabs)',
          'Leo Thorne (Creative Director, VoxelWorks)',
          'Sarah Jenkins (Operations Producer)'
        ].join('\n'));
        setConstraintsInput([
          'Generative rendering booths require shielded high-amperage cooling systems',
          'Gallery displays need precise wall-mounted projection spaces',
          'Audio kiosks must be separated by sound-proof screens in the main Lobby'
        ].join('\n'));
        break;
    }
  };

  const handleSetupEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const speakers = speakersInput.split('\n').filter(s => s.trim() !== '');
    const vendorConstraints = constraintsInput.split('\n').filter(c => c.trim() !== '');

    try {
      const response = await fetch('/api/event/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          targetAttendees,
          venueName,
          floorPlanNotes,
          speakers,
          vendorConstraints
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'AI setup failed');
      }

      const data = await response.json();
      onUpdateState(data.state);
    } catch (err: any) {
      setError(err.message || 'An error occurred during event optimization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="planning-tab-root">
      
      {/* Informative Header card */}
      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex gap-3.5 items-start" id="planning-tutorial">
        <Sparkles className="text-indigo-600 shrink-0 mt-0.5 animate-pulse" size={20} />
        <div className="text-sm">
          <p className="font-semibold text-indigo-950 mb-0.5">Core Event Parameters & Optimization</p>
          <p className="text-indigo-700 leading-normal">
            Customize the raw parameters below. The AI Agent will parse your unstructured notes to map out a conflict-free master schedule, place vendor booths respecting floor layouts, and generate actionable checklists.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-mono font-bold text-indigo-950 mr-1.5">Load Industry Preset Demo:</span>
            <button 
              onClick={() => loadPresetTemplate('sustainability')}
              className="text-xs bg-white text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-100/50 cursor-pointer transition-all"
            >
              🌱 Green Supply Expo
            </button>
            <button 
              onClick={() => loadPresetTemplate('healthcare')}
              className="text-xs bg-white text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-100/50 cursor-pointer transition-all"
            >
              🩺 BioHealth AI
            </button>
            <button 
              onClick={() => loadPresetTemplate('design')}
              className="text-xs bg-white text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-100/50 cursor-pointer transition-all"
            >
              🎨 Future UX Cinema
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="planning-workspace">
        
        {/* Left Side: Setup Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs" id="setup-workspace-inputs">
          <h4 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Compass size={18} className="text-slate-600" />
            <span>Customize Event Parameters</span>
          </h4>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-2 items-start" id="setup-error-alert">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSetupEvent} className="space-y-5" id="event-setup-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Event Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 font-medium"
                  placeholder="e.g. Next-Gen Tech Expo"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Attendee Count</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={targetAttendees} 
                    onChange={(e) => setTargetAttendees(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 font-medium"
                    placeholder="e.g. 500"
                  />
                  <Users size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Venue Name / Location</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={venueName} 
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 font-medium"
                  placeholder="e.g. Seattle Innovation Pavilion"
                />
                <MapPin size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Venue Layout & Floor Plan Notes (PDF Raw Notes)</label>
              <textarea 
                rows={3}
                value={floorPlanNotes} 
                onChange={(e) => setFloorPlanNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 font-medium font-sans leading-relaxed"
                placeholder="Detail capacity sizes, exits, specific halls (e.g. Hall A capacity 200, Lobby booth capacity 15...)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <UserSquare2 size={13} className="text-slate-500" />
                  <span>Speakers (one per line)</span>
                </label>
                <textarea 
                  rows={4}
                  value={speakersInput} 
                  onChange={(e) => setSpeakersInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 font-medium font-sans leading-relaxed"
                  placeholder="Speaker Name (Role / Company)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Store size={13} className="text-slate-500" />
                  <span>Vendor Constraints (one per line)</span>
                </label>
                <textarea 
                  rows={4}
                  value={constraintsInput} 
                  onChange={(e) => setConstraintsInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 font-medium font-sans leading-relaxed"
                  placeholder="Constraint description..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer"
              id="btn-optimize-event"
            >
              {loading ? (
                <>
                  <Sparkles className="animate-spin" size={16} />
                  <span>AI Agent Orchestrating Space & Schedules...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Optimize & Setup Event Ecosystem</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Active Structure Output (5 cols) */}
        <div className="lg:col-span-5 space-y-6" id="planning-current-output">
          
          {/* Active Schedule Overview */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs" id="active-schedule-panel">
            <h5 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-4 flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              <span>Current Master Schedule</span>
            </h5>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1" id="active-sessions-list">
              {state.schedule.map((session) => (
                <div key={session.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-semibold text-slate-900 leading-tight">{session.title}</span>
                    <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded shrink-0">{session.room}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{session.startTime} - {session.endTime}</span>
                    <span className="font-semibold text-indigo-950">Speaker: {session.speaker}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal mt-2 line-clamp-2">{session.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Map Vendor Layout template */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs" id="active-vendors-panel">
            <h5 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-4 flex items-center gap-1.5">
              <Store size={14} className="text-slate-400" />
              <span>Vendor Placement Layout</span>
            </h5>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1" id="active-vendors-list">
              {state.vendors.map((vendor) => (
                <div key={vendor.id} className="p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-xl text-xs flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                    {vendor.booth.match(/Booth\s*([A-Za-z0-9]+)/)?.[1] || 'B'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate">{vendor.name}</span>
                      <span className="text-[9px] font-mono bg-indigo-200/50 text-indigo-800 px-1 py-0.5 rounded">{vendor.booth}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{vendor.category}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">{vendor.description}</p>
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
