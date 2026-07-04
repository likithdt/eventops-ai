/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  UserPlus, 
  Users, 
  Calendar, 
  ShieldAlert, 
  TrendingUp, 
  UserCheck2,
  BookmarkCheck,
  Check,
  Building,
  RotateCw
} from 'lucide-react';
import { EventState, Attendee } from '../types.js';

interface RegistrationTabProps {
  state: EventState;
  onRefresh: () => void;
  onToggleCheckIn: (id: string) => void;
}

export default function RegistrationTab({ state, onRefresh, onToggleCheckIn }: RegistrationTabProps) {
  const [registering, setRegistering] = useState(false);
  const [successResult, setSuccessResult] = useState<Attendee | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interestOptions = [
    'AI Research', 
    'Blockchain', 
    'UX Design', 
    'System Scaling', 
    'GPU Hardware', 
    'Venture Capital',
    'Logistics Operations',
    'Robotic Automation'
  ];

  const handleInterestChange = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleRegisterFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !jobTitle) {
      setFormError('Name, email, and professional job title are required.');
      return;
    }

    setRegistering(true);
    setFormError(null);
    setSuccessResult(null);

    try {
      const response = await fetch('/api/event/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          jobTitle,
          bio,
          interests: selectedInterests
        })
      });

      if (!response.ok) {
        throw new Error('Onboarding Agent rejected profile registration.');
      }

      const data = await response.json();
      setSuccessResult(data.attendee);
      
      // Reset form fields
      setName('');
      setEmail('');
      setCompany('');
      setJobTitle('');
      setBio('');
      setSelectedInterests([]);
      
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to complete registration.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="space-y-8" id="registration-tab-root">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="registration-grid-layout">
        
        {/* Left Side: Attendee Self-Registration Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6" id="registration-landing-form-column">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs" id="visitor-form-card">
            <h4 className="text-sm font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <UserPlus size={16} className="text-slate-500" />
              <span>Simulate Visitor Registration Gate</span>
            </h4>

            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4" id="registration-form-error">
                {formError}
              </div>
            )}

            <form onSubmit={handleRegisterFormSubmit} className="space-y-4" id="visitor-form">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  placeholder="e.g. Elena Rostova"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  placeholder="elena@avcorp.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Job Title</label>
                  <input 
                    type="text" 
                    required
                    value={jobTitle} 
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                    placeholder="e.g. Principal Lead"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Company</label>
                  <input 
                    type="text" 
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                    placeholder="e.g. Nvidia"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Bio / Background (Evaluated by AI Agent)</label>
                <textarea 
                  rows={2}
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  placeholder="Briefly state your current goals or field..."
                />
              </div>

              {/* Interests checklist */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 block">Select Professional Focus Areas</label>
                <div className="grid grid-cols-2 gap-2" id="interests-options-grid">
                  {interestOptions.map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => handleInterestChange(option)}
                      className={`text-[10px] p-2 rounded-xl text-left border transition-all cursor-pointer font-medium ${
                        selectedInterests.includes(option)
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md cursor-pointer"
                id="btn-register-submit"
              >
                {registering ? (
                  <>
                    <RotateCw className="animate-spin" size={14} />
                    <span>AI Evaluator onboarding profile...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Onboard & Register with AI Agent</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI Onboarding immediate feedback results banner */}
          {successResult && (
            <div className="bg-indigo-950 text-white p-6 rounded-3xl border border-indigo-900 shadow-md relative overflow-hidden animate-fade-in" id="registration-onboarding-results">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/25 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="p-1.5 bg-indigo-500/30 rounded text-indigo-300">
                  <UserCheck2 size={16} />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 font-bold">Onboarding Agent Result</span>
              </div>

              <div className="space-y-4 relative z-10 text-xs">
                <div className="border-b border-indigo-900/60 pb-3">
                  <p className="text-slate-400 font-medium">CONGRATULATIONS, REGISTRATION ACTIVE</p>
                  <p className="text-base font-bold mt-0.5 text-slate-100">{successResult.name}</p>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Assigned Networking Cohort:</span>
                  <span className="text-sm font-bold text-indigo-200 mt-1 block">{successResult.networkingCohort}</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase mb-1.5">Custom Itinerary Sessions recommended:</span>
                  <div className="space-y-1.5">
                    {successResult.customItinerary.map((sessionId) => {
                      const session = state.schedule.find(s => s.id === sessionId);
                      return session ? (
                        <div key={sessionId} className="flex gap-2 items-center bg-indigo-900/40 p-2 rounded-xl border border-indigo-800/40">
                          <BookmarkCheck size={14} className="text-indigo-400 shrink-0" />
                          <span className="truncate font-medium">{session.title}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {successResult.isVip && (
                  <div className="flex gap-2 items-center bg-red-950/40 border border-red-900/60 p-2.5 rounded-xl text-red-200">
                    <ShieldAlert size={14} className="text-red-400" />
                    <span className="font-bold">Sponsor / High-Value VIP Organizer Alert Triggered</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Registered Visitor Telemetry & Gate Check-In (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs" id="registered-visitors-column">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-slate-500" />
              <span>Registered Attendees Registry</span>
            </h4>
            <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">
              {state.attendees.length} Total
            </span>
          </div>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1" id="registered-visitors-list">
            {state.attendees.map((attendee) => (
              <div 
                key={attendee.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  attendee.checkedIn 
                    ? 'bg-slate-50 border-slate-100' 
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{attendee.name}</span>
                      {attendee.isVip && (
                        <span className="text-[9px] font-mono font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                          VIP SPONSOR
                        </span>
                      )}
                      <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                        {attendee.networkingCohort}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <Building size={12} />
                      <span className="font-semibold text-slate-500">{attendee.jobTitle}</span>
                      <span>•</span>
                      <span>{attendee.company}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 italic">{attendee.bio}</p>
                    
                    {/* Display interests tags */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {attendee.interests.map((interest) => (
                        <span key={interest} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                          #{interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleCheckIn(attendee.id)}
                    className={`text-[11px] font-semibold px-3 py-2 rounded-xl border shrink-0 cursor-pointer transition-all flex items-center gap-1.5 ${
                      attendee.checkedIn
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    id={`btn-toggle-checkin-${attendee.id}`}
                  >
                    <Check size={14} className={attendee.checkedIn ? 'opacity-100' : 'opacity-40'} />
                    <span>{attendee.checkedIn ? 'Checked In' : 'At Gate'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
