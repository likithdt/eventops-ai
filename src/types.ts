/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EventDetails {
  title: string;
  targetAttendees: number;
  venueName: string;
  floorPlanNotes: string;
  speakers: string[];
  vendorConstraints: string[];
  status: 'Planning' | 'Active' | 'Completed';
}

export interface Session {
  id: string;
  title: string;
  speaker: string;
  room: string;
  capacity: number;
  startTime: string;
  endTime: string;
  description: string;
  checkedInCount: number;
}

export interface Task {
  id: string;
  title: string;
  category: 'logistics' | 'marketing' | 'tech' | 'operations';
  status: 'todo' | 'in_progress' | 'done';
  assignedTo: string;
  dueDate: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  booth: string;
  description: string;
}

export interface MarketingCampaign {
  id: string;
  platform: 'Twitter/X' | 'LinkedIn' | 'Email';
  copy: string;
  targetSegment: string;
  scheduledTime: string;
  status: 'Draft' | 'Sent';
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  bio: string;
  interests: string[];
  networkingCohort: string;
  customItinerary: string[]; // List of Session IDs recommended
  isVip: boolean;
  checkedIn: boolean;
  registeredAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'reported' | 'dispatched' | 'resolved';
  reportedAt: string;
  location: string;
  assignedStaff: string;
  resolutionNotes?: string;
}

export interface ExecutiveReport {
  id: string;
  timestamp: string;
  reportText: string;
  actionAlerts: string[];
}

export interface EventState {
  details: EventDetails;
  schedule: Session[];
  tasks: Task[];
  vendors: Vendor[];
  marketing: MarketingCampaign[];
  attendees: Attendee[];
  incidents: Incident[];
  reports: ExecutiveReport[];
}
