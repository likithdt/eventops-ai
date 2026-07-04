/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { 
  EventState, 
  EventDetails, 
  Session, 
  Vendor, 
  Task, 
  MarketingCampaign, 
  Attendee, 
  Incident, 
  ExecutiveReport 
} from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required to run the AI engine.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// In-Memory Database State (Preloaded with seed data)
let eventState: EventState = {
  details: {
    title: 'Web3 & AI Innovations Summit 2026',
    targetAttendees: 500,
    venueName: 'Metropolitan Tech Pavilion',
    floorPlanNotes: 'Main Hall A (Cap: 300), Hall B (Cap: 150), Lobby (10 Vendor Booth spaces), Registration Desk near main doors.',
    speakers: [
      'Dr. Aris Thorne (Chief AI Scientist, NeuralFlow)',
      'Siri Vance (Principal UX Designer, AgentLabs)',
      'Marcus Kane (Lead Infrastructure Engineer, ScaleNodes)',
      'Elena Rostova (AV & Event Operations Specialist)'
    ],
    vendorConstraints: [
      'Hardware vendors require high-amperage power outlets',
      'Food and beverage booths must stay near the extraction fans',
      'No sound leakage between booths in the Lobby'
    ],
    status: 'Active'
  },
  schedule: [
    {
      id: 's1',
      title: 'The Convergence of AI & Decentralized Compute',
      speaker: 'Dr. Aris Thorne',
      room: 'Main Hall A',
      capacity: 300,
      startTime: '09:00 AM',
      endTime: '10:15 AM',
      description: 'An analytical exploration of the symbiotic relationship between generative AI models and edge blockchain storage.',
      checkedInCount: 185
    },
    {
      id: 's2',
      title: 'Designing UX for Autonomous Agent Communities',
      speaker: 'Siri Vance',
      room: 'Hall B',
      capacity: 150,
      startTime: '10:30 AM',
      endTime: '11:45 AM',
      description: 'How interface design paradigms evolve when core users are autonomous software agents rather than human operators.',
      checkedInCount: 115
    },
    {
      id: 's3',
      title: 'Production GPU Orchestration & Clustering',
      speaker: 'Marcus Kane',
      room: 'Main Hall A',
      capacity: 300,
      startTime: '01:00 PM',
      endTime: '02:15 PM',
      description: 'Real-world deployment strategies for multi-node inference clusters without breaking operational budgets.',
      checkedInCount: 142
    },
    {
      id: 's4',
      title: 'Interactive Q&A: The Future of Autonomous Event Systems',
      speaker: 'All Panelists',
      room: 'Main Hall A',
      capacity: 300,
      startTime: '03:00 PM',
      endTime: '04:15 PM',
      description: 'A round-table discussion exploring automation, sensor networks, and localized AI in production environments.',
      checkedInCount: 95
    }
  ],
  vendors: [
    {
      id: 'v1',
      name: 'NeuronMesh',
      category: 'Hardware & Silicon',
      booth: 'Booth A1 (Power outlets enabled)',
      description: 'Showcasing custom Edge TPU processors tailored for local offline model inference.'
    },
    {
      id: 'v2',
      name: 'SolanaDevs Studio',
      category: 'Protocol Infrastructure',
      booth: 'Booth B3',
      description: 'Smart contract development kits designed for fast real-time transactions.'
    },
    {
      id: 'v3',
      name: 'VoxelLabs AI',
      category: 'Gaming & VFX',
      booth: 'Booth C2',
      description: 'Instant generative game asset texturing tools.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Finalize custom RFID badges for VIP attendees',
      category: 'logistics',
      status: 'done',
      assignedTo: 'Sarah',
      dueDate: '2026-07-01'
    },
    {
      id: 't2',
      title: 'Install backup microphones on Main Hall A stage',
      category: 'tech',
      status: 'in_progress',
      assignedTo: 'Elena',
      dueDate: '2026-07-03'
    },
    {
      id: 't3',
      title: 'Verify Wi-Fi network load capacity in the Lobby area',
      category: 'tech',
      status: 'todo',
      assignedTo: 'Elena',
      dueDate: '2026-07-04'
    },
    {
      id: 't4',
      title: 'Distribute speaker lunch boxes & catering schedules',
      category: 'logistics',
      status: 'todo',
      assignedTo: 'Marcus',
      dueDate: '2026-07-04'
    }
  ],
  marketing: [
    {
      id: 'm1',
      platform: 'LinkedIn',
      copy: '📢 We are thrilled to host Dr. Aris Thorne at the Web3 & AI Innovations Summit! He will lead a masterclass on decentralizing compute pipelines for modern generative AI models. Register now to customize your itinerary with our built-in Onboarding Agent! #Web3AI #TechSummit',
      targetSegment: 'AI Engineers, GPU Infrastructure Architects, and Research Leads',
      scheduledTime: 'July 4, 09:00 AM',
      status: 'Sent'
    },
    {
      id: 'm2',
      platform: 'Twitter/X',
      copy: 'Can software agents design their own user interfaces? 🤖 principal designer Siri Vance breaks down UX for agentic cohorts in Hall B. Ticket slots are filling fast! Secure your personalized itinerary at the EventOps AI gate. #EventOps #AgentUX',
      targetSegment: 'UX/UI Designers, Frontend developers, and Tech Entrepreneurs',
      scheduledTime: 'July 4, 11:15 AM',
      status: 'Sent'
    }
  ],
  attendees: [
    {
      id: 'a1',
      name: 'Alice Chen',
      email: 'alice@neuralflow.io',
      company: 'NeuralFlow',
      jobTitle: 'Lead Research Scientist',
      bio: 'Pioneering multimodal training algorithms. Passionate about blockchain infrastructure integrations.',
      interests: ['AI Research', 'Edge Computing', 'Protocol Scaling'],
      networkingCohort: 'Generative AI Pioneers Circle',
      customItinerary: ['s1', 's2', 's4'],
      isVip: true,
      checkedIn: true,
      registeredAt: '2026-07-04T08:02:00.000Z'
    },
    {
      id: 'a2',
      name: 'Bob Smith',
      email: 'bob@solanadevs.org',
      company: 'SolanaDevs',
      jobTitle: 'Core Protocol Developer',
      bio: 'Working on fast gas-less payment pipelines. Fascinated by decentralized GPU node clusterings.',
      interests: ['Smart Contracts', 'Hardware', 'Compute Offloading'],
      networkingCohort: 'DeFi & Node Architecture Club',
      customItinerary: ['s1', 's3', 's4'],
      isVip: false,
      checkedIn: true,
      registeredAt: '2026-07-04T08:11:00.000Z'
    },
    {
      id: 'a3',
      name: 'Clara Jenkins',
      email: 'clara@voxel.xyz',
      company: 'VoxelLabs AI',
      jobTitle: 'Founder & CEO',
      bio: 'Serial entrepreneur. Sponsoring the gaming asset tracks. Looking to network with venture capitalists and compute scaling providers.',
      interests: ['Venture Capital', 'Gaming Pipelines', 'AI Inference'],
      networkingCohort: 'AI Tech Founders & Investors',
      customItinerary: ['s2', 's3', 's4'],
      isVip: true,
      checkedIn: false,
      registeredAt: '2026-07-04T08:35:00.000Z'
    },
    {
      id: 'a4',
      name: 'David Ortiz',
      email: 'david@skalenodes.net',
      company: 'ScaleNodes',
      jobTitle: 'Cloud Architect',
      bio: 'Enabling massive Kubernetes scale-ups. Looking to optimize real-time media streams.',
      interests: ['Kubernetes', 'Media Networks', 'GPU Inference'],
      networkingCohort: 'Cloud Infrastructure Guild',
      customItinerary: ['s3', 's4'],
      isVip: false,
      checkedIn: false,
      registeredAt: '2026-07-04T08:42:00.000Z'
    }
  ],
  incidents: [
    {
      id: 'i1',
      title: 'Stage Microphone Intermittent Crackling',
      description: 'Wireless presenter mic in Hall B is producing static. Need replacement transmitter or backup capsule immediately.',
      priority: 'medium',
      status: 'dispatched',
      reportedAt: '2026-07-04T09:12:00.000Z',
      location: 'Hall B Stage',
      assignedStaff: 'Elena (AV Tech)'
    },
    {
      id: 'i2',
      title: 'Registration Gate 2 Access Scanner Outage',
      description: 'Local router lockup interrupted Wi-Fi pairing on the badge scanner. Power cycled and re-joined to secure SSID.',
      priority: 'high',
      status: 'resolved',
      reportedAt: '2026-07-04T08:05:00.000Z',
      location: 'Main Entry Lobby',
      assignedStaff: 'Sarah (Logistics Liaison)',
      resolutionNotes: 'Router reconfigured with static IP. Fully functional.'
    }
  ],
  reports: [
    {
      id: 'r1',
      timestamp: '2026-07-04T10:00:00.000Z',
      reportText: '### Mid-Morning Event Operational Audit\n\n* **Attendee Conversion:** Total of 4 attendees registered. 2 checked-in (50% conversion). Peak flow registered at 08:15 AM near Gates 1 and 2.\n* **Room Loading:** Hall A capacity reached 61.6% during Dr. Thorne\'s morning keynote session. Crowd flow has migrated towards Hall B.\n* **Infrastructure Status:** One high-priority scanner bottleneck occurred at 08:05 AM and was mitigated within 8 minutes. AV team dispatched a runner to address minor static in Siri Vance\'s lapel microphone in Hall B.',
      actionAlerts: [
        'Deploy 1 standby usher to Hall B entry to organize the overflow line.',
        'Request Elena check Hall A speaker battery levels before the afternoon cluster workshop.'
      ]
    }
  ]
};

// ==========================================
// API Endpoints
// ==========================================

// 1. Get current state
app.get('/api/event/state', (req, res) => {
  res.json(eventState);
});

// 2. Reset / Initialize Event parameters (The Setup: Event Planning & Resource Allocation)
app.post('/api/event/setup', async (req, res) => {
  try {
    const { title, targetAttendees, venueName, floorPlanNotes, speakers, vendorConstraints } = req.body;
    
    if (!title || !venueName) {
      return res.status(400).json({ error: 'Event Title and Venue Name are required.' });
    }

    const ai = getAiClient();

    const prompt = `You are "EventOps AI" - the executive brain for event operations.
We are planning a new event:
- Title: ${title}
- Target Attendee Count: ${targetAttendees}
- Venue Name: ${venueName}
- Floor Plan Notes: ${floorPlanNotes}
- Confirmed Speakers / Bio: ${JSON.stringify(speakers)}
- Vendor Constraints & Requirements: ${JSON.stringify(vendorConstraints)}

Based on these unstructured inputs, automatically design:
1. A conflict-free master schedule of 3-4 key sessions (each must have an ID, elegant title, speaker, room name, realistic capacity, start/end times in "HH:MM AM/PM" format, and description). Ensure rooms are allocated logically based on venue limits.
2. A vendor booth template containing 2-3 suitable vendors that fit constraints (ID, name, category, booth allocation e.g., 'Booth 1A', and description).
3. A pre-event checklists / task list of 4-5 items needed to execute this event successfully (ID, title, category: one of [logistics, marketing, tech, operations], assignedTo, dueDate).

Generate this data strictly in JSON format matching the schema requested. Make all names, titles, and details feel highly realistic, immersive, and professional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  speaker: { type: Type.STRING },
                  room: { type: Type.STRING },
                  capacity: { type: Type.NUMBER },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['id', 'title', 'speaker', 'room', 'capacity', 'startTime', 'endTime', 'description']
              }
            },
            vendors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  booth: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['id', 'name', 'category', 'booth', 'description']
              }
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  category: { type: Type.STRING, description: 'Must be logistics, marketing, tech, or operations' },
                  assignedTo: { type: Type.STRING },
                  dueDate: { type: Type.STRING }
                },
                required: ['id', 'title', 'category', 'assignedTo', 'dueDate']
              }
            }
          },
          required: ['schedule', 'vendors', 'tasks']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Update state
    eventState.details = {
      title,
      targetAttendees: Number(targetAttendees) || 100,
      venueName,
      floorPlanNotes,
      speakers: Array.isArray(speakers) ? speakers : [speakers],
      vendorConstraints: Array.isArray(vendorConstraints) ? vendorConstraints : [vendorConstraints],
      status: 'Planning'
    };

    // Safely parse arrays and assign checkedInCount to schedule items
    eventState.schedule = (parsedData.schedule || []).map((s: any) => ({
      ...s,
      checkedInCount: 0
    }));

    eventState.vendors = parsedData.vendors || [];
    
    eventState.tasks = (parsedData.tasks || []).map((t: any) => ({
      ...t,
      status: 'todo'
    }));

    // Clear previous dynamic data to start fresh, but preserve a blank list or generate fresh placeholders
    eventState.marketing = [];
    eventState.attendees = [];
    eventState.incidents = [];
    eventState.reports = [];

    res.json({ success: true, state: eventState });
  } catch (error: any) {
    console.error('Setup Event error:', error);
    res.status(500).json({ error: error.message || 'Failed to design the event using AI' });
  }
});

// 3. Drive Interest (Autonomous Marketing & Promotion Campaign Generator)
app.post('/api/event/generate-marketing', async (req, res) => {
  try {
    const { agendaSummary } = req.body;
    const ai = getAiClient();

    const scheduleListStr = eventState.schedule.map(s => `"${s.title}" by ${s.speaker} in ${s.room}`).join('\n');
    const speakerListStr = eventState.details.speakers.join(', ');

    const prompt = `You are the Autonomous Marketing Agent for "${eventState.details.title}".
We have finalized the event parameters:
- Venue: ${eventState.details.venueName}
- Speakers: ${speakerListStr}
- Schedule:
${scheduleListStr}

Your goal is to create high-conversion, highly personalized marketing campaigns for LinkedIn, Twitter/X, and direct email newsletters.
- Do not write generic fillers. Segment the target audiences specifically matching our speaker topics (e.g. AI Research, UX Practitioners, System Admins).
- Compose 3 distinct campaigns: one for LinkedIn (professional, structural insights), one for Twitter/X (high-energy, hashtag friendly, brief), and one Email Newsletter template (personalized, detailing custom itinerary recommendations).

Generate this as a JSON list matching the requested output schema. Ensure each item has a unique ID, platform, customized copywriting text, target segment description, and mock scheduled dispatch slot.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              platform: { type: Type.STRING, description: 'Must be Twitter/X, LinkedIn, or Email' },
              copy: { type: Type.STRING, description: 'Copy text of the outreach campaign' },
              targetSegment: { type: Type.STRING, description: 'Detailed focus audience cohort' },
              scheduledTime: { type: Type.STRING, description: 'Recommended day/time to dispatch' }
            },
            required: ['id', 'platform', 'copy', 'targetSegment', 'scheduledTime']
          }
        }
      }
    });

    const campaigns = JSON.parse(response.text || '[]').map((camp: any) => ({
      ...camp,
      status: 'Draft'
    }));

    eventState.marketing = campaigns;
    res.json({ success: true, marketing: eventState.marketing });
  } catch (error: any) {
    console.error('Marketing Generator error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate promotional materials' });
  }
});

// 4. Register Attendee (Gatekeeping: Intelligent Visitor Registration)
app.post('/api/event/register', async (req, res) => {
  try {
    const { name, email, company, jobTitle, bio, interests } = req.body;

    if (!name || !email || !jobTitle) {
      return res.status(400).json({ error: 'Name, Email, and Job Title are required.' });
    }

    const ai = getAiClient();
    const availableSessions = eventState.schedule.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      speaker: s.speaker
    }));

    const prompt = `You are the Gatekeeper Onboarding AI for the event "${eventState.details.title}".
A new attendee has filled out the registration form:
- Name: ${name}
- Job Title: ${jobTitle}
- Company: ${company}
- Bio: ${bio}
- Expressed Interests: ${JSON.stringify(interests)}

We have the following schedule sessions available for matching:
${JSON.stringify(availableSessions)}

Please analyze their professional profile:
1. Assign them to a creative, highly relevant networking cohort (e.g. 'DeFi Innovators', 'Agentic Design Pioneers', 'Generative Architects', 'SaaS scaling masterminds').
2. Select 1 to 3 Session IDs that directly match their interests, background, or job role.
3. Assess if this registrant qualifies as a VIP or Sponsor representative (e.g., has "Founder", "CEO", "Director", "VP", "Sponsor", "Investor" in their job title/bio, or belongs to a main partner company). Return true/false.

Return the result as JSON strictly matching the output schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            networkingCohort: { type: Type.STRING },
            recommendedSessionIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            isVip: { type: Type.BOOLEAN }
          },
          required: ['networkingCohort', 'recommendedSessionIds', 'isVip']
        }
      }
    });

    const registrationAnalysis = JSON.parse(response.text || '{}');

    const newAttendee: Attendee = {
      id: `a-${Date.now()}`,
      name,
      email,
      company: company || 'Independent',
      jobTitle,
      bio: bio || '',
      interests: Array.isArray(interests) ? interests : [interests],
      networkingCohort: registrationAnalysis.networkingCohort || 'General Attendee Pool',
      customItinerary: registrationAnalysis.recommendedSessionIds || [],
      isVip: !!registrationAnalysis.isVip,
      checkedIn: false,
      registeredAt: new Date().toISOString()
    };

    eventState.attendees.push(newAttendee);
    res.json({ success: true, attendee: newAttendee, state: eventState });
  } catch (error: any) {
    console.error('Attendee Registration error:', error);
    res.status(500).json({ error: error.message || 'Failed to onboard attendee using AI' });
  }
});

// 5. Toggle Check-In status (Day of Event Live Feed Simulator)
app.post('/api/event/toggle-check-in', (req, res) => {
  const { id } = req.body;
  const attendee = eventState.attendees.find(a => a.id === id);

  if (!attendee) {
    return res.status(404).json({ error: 'Attendee not found' });
  }

  attendee.checkedIn = !attendee.checkedIn;

  // Dynamically update session attendance counts as attendees check-in
  eventState.schedule.forEach(s => {
    if (attendee.customItinerary.includes(s.id)) {
      if (attendee.checkedIn) {
        s.checkedInCount = Math.min(s.capacity, s.checkedInCount + 1);
      } else {
        s.checkedInCount = Math.max(0, s.checkedInCount - 1);
      }
    }
  });

  res.json({ success: true, state: eventState });
});

// 6. Log Ground Ops Incident (The Live Event: Context-Aware Venue Operations)
app.post('/api/event/log-incident', async (req, res) => {
  try {
    const { rawInput } = req.body; // text or voice transcription block, e.g. "Mic failure in Hall A"

    if (!rawInput) {
      return res.status(400).json({ error: 'Raw report input is required.' });
    }

    const ai = getAiClient();

    const staffList = [
      'David Ortiz (Tech Operations Coordinator)',
      'Sarah Jenkins (Logistics & Registration Lead)',
      'Elena Rostova (Lead AV Engineer)',
      'Marcus Kane (Facility Safety & Crowd Marshall)'
    ];

    const prompt = `You are the Live Operations Dispatch Center. An on-ground staff member logged an incident:
"${rawInput}"

Analyze this incident details:
1. Triage the priority to one of: low, medium, or high. High means safety risks, session blocking outages, or main gateway lockouts. Medium means minor equipment failures or localized congestion. Low is informational.
2. Synthesize an elegant, concise title.
3. Identify the location of the issue (e.g. Hall A, Hall B, Main Entry Lobby, Catering Core, unknown).
4. Assign the most qualified responder from our active ground staff shift:
${JSON.stringify(staffList)}
5. Summarize the issue and write dispatch instructions.

Generate a JSON object matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            priority: { type: Type.STRING, description: 'Must be low, medium, or high' },
            location: { type: Type.STRING },
            assignedStaff: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['title', 'priority', 'location', 'assignedStaff', 'description']
        }
      }
    });

    const parsedIncident = JSON.parse(response.text || '{}');

    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      title: parsedIncident.title || 'Logged Operational Notice',
      description: parsedIncident.description || rawInput,
      priority: (parsedIncident.priority === 'high' || parsedIncident.priority === 'medium' || parsedIncident.priority === 'low') ? parsedIncident.priority : 'medium',
      status: 'dispatched',
      reportedAt: new Date().toISOString(),
      location: parsedIncident.location || 'Venue Hub',
      assignedStaff: parsedIncident.assignedStaff || 'Elena Rostova (Lead AV Engineer)'
    };

    eventState.incidents.unshift(newIncident);
    res.json({ success: true, incident: newIncident, state: eventState });
  } catch (error: any) {
    console.error('Incident Logging error:', error);
    res.status(500).json({ error: error.message || 'Failed to dispatch ground operations responder' });
  }
});

// 7. Resolve Incident
app.post('/api/event/resolve-incident', (req, res) => {
  const { id, notes } = req.body;
  const incident = eventState.incidents.find(i => i.id === id);

  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  incident.status = 'resolved';
  incident.resolutionNotes = notes || 'Resolved by on-ground responder.';

  res.json({ success: true, state: eventState });
});

// 8. Generate Operational hourly / executive summary (Closing the Loop: Real-Time Analytics)
app.post('/api/event/generate-report', async (req, res) => {
  try {
    const ai = getAiClient();

    // Compile dynamic summary metrics to feed into Gemini context
    const totalAttendees = eventState.attendees.length;
    const checkedInCount = eventState.attendees.filter(a => a.checkedIn).length;
    const checkInRate = totalAttendees > 0 ? ((checkedInCount / totalAttendees) * 100).toFixed(1) : '0';
    
    const activeIncidents = eventState.incidents.filter(i => i.status !== 'resolved');
    const resolvedIncidents = eventState.incidents.filter(i => i.status === 'resolved');

    const sessionLoading = eventState.schedule.map(s => ({
      title: s.title,
      capacity: s.capacity,
      occupancy: s.checkedInCount,
      percent: ((s.checkedInCount / s.capacity) * 100).toFixed(1)
    }));

    const statusContext = {
      eventTitle: eventState.details.title,
      venue: eventState.details.venueName,
      totalAttendees,
      checkedInCount,
      checkInRate: `${checkInRate}%`,
      sessionLoading,
      activeIncidentsCount: activeIncidents.length,
      activeIncidents: activeIncidents.map(i => `[${i.priority.toUpperCase()}] ${i.title} at ${i.location} assigned to ${i.assignedStaff}`),
      resolvedIncidentsCount: resolvedIncidents.length,
      tasksOutstanding: eventState.tasks.filter(t => t.status !== 'done').length
    };

    const prompt = `You are the Executive Analysis Brain for "${eventState.details.title}".
We are running a live data stream of check-ins, capacity limits, outstanding task lists, and ground ops incidents.
Current Live Stats context:
${JSON.stringify(statusContext)}

Perform a comprehensive analytical review of the current event ecosystem status.
Instead of just displaying static lists, formulate a narrative operational summary in markdown format:
1. Highlight bottlenecks (e.g. check-in conversion rates, high-priority issues, or rooms exceeding 80% capacity).
2. Detail exactly how recent ground operations actions (e.g., resolving previous entry scanner failures) mitigated issues.
3. Formulate 2-3 forward-looking, highly actionable committee alerts (e.g. 'Redirect 2 unassigned staff to Lobby to assist the surge', 'Push notification to Hall B overflow attendees recommending next Main Hall keynote').

Ensure the report is highly executive, professional, and contains detailed analytical value.
Return the output in JSON matching the requested response schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reportText: { type: Type.STRING },
            actionAlerts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['reportText', 'actionAlerts']
        }
      }
    });

    const parsedReport = JSON.parse(response.text || '{}');

    const newReport: ExecutiveReport = {
      id: `rep-${Date.now()}`,
      timestamp: new Date().toISOString(),
      reportText: parsedReport.reportText || '### Hourly Live Report\nNo critical anomalies found.',
      actionAlerts: parsedReport.actionAlerts || []
    };

    eventState.reports.unshift(newReport);
    res.json({ success: true, report: newReport, state: eventState });
  } catch (error: any) {
    console.error('Report Generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze event telemetry and generate report' });
  }
});

// Update task status
app.post('/api/event/toggle-task', (req, res) => {
  const { id } = req.body;
  const task = eventState.tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.status = task.status === 'done' ? 'todo' : 'done';
  res.json({ success: true, state: eventState });
});

// Create draft campaign post / dispatch
app.post('/api/event/toggle-campaign', (req, res) => {
  const { id } = req.body;
  const campaign = eventState.marketing.find(c => c.id === id);

  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  campaign.status = campaign.status === 'Sent' ? 'Draft' : 'Sent';
  res.json({ success: true, state: eventState });
});

// ==========================================
// Serve Vite frontend client assets
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EventOps AI] Full-stack server active at http://localhost:${PORT}`);
  });
}

startServer();
