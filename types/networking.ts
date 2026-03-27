// Networking 모듈 타입 정의

export type NetworkingEventStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type NetworkingEventType = 'meetup' | 'seminar' | 'workshop' | 'conference' | 'social' | 'online';
export type RsvpStatus = 'registered' | 'waitlist' | 'cancelled' | 'attended';

export interface NetworkingEvent {
  id: string;
  brandId: string;
  title: string;
  description: string | null;
  type: NetworkingEventType;
  status: NetworkingEventStatus;
  location: string | null;
  onlineUrl: string | null;
  startAt: string;
  endAt: string | null;
  maxAttendees: number | null;
  organizerId: string | null;
  tags: string[];
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined
  rsvpCount?: number;
}

export interface NetworkingRsvp {
  id: string;
  eventId: string;
  userId: string | null;
  name: string;
  email: string;
  company: string | null;
  status: RsvpStatus;
  note: string | null;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNetworkingEventInput {
  brandId: string;
  title: string;
  description?: string;
  type: NetworkingEventType;
  status?: NetworkingEventStatus;
  location?: string;
  onlineUrl?: string;
  startAt: string;
  endAt?: string;
  maxAttendees?: number;
  organizerId?: string;
  tags?: string[];
  coverImage?: string;
}

export interface UpdateNetworkingEventInput {
  title?: string;
  description?: string;
  type?: NetworkingEventType;
  status?: NetworkingEventStatus;
  location?: string;
  onlineUrl?: string;
  startAt?: string;
  endAt?: string;
  maxAttendees?: number;
  organizerId?: string;
  tags?: string[];
  coverImage?: string;
}

export interface CreateRsvpInput {
  eventId: string;
  userId?: string;
  name: string;
  email: string;
  company?: string;
  status?: RsvpStatus;
  note?: string;
}

export interface UpdateRsvpInput {
  status?: RsvpStatus;
  note?: string;
  checkedInAt?: string;
}
