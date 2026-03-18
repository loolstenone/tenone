export type EventType = 'Release' | 'Content' | 'Event' | 'Meeting' | 'Deadline';
export type EventStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface UniverseEvent {
    id: string;
    title: string;
    description?: string;
    date: string; // ISO date string YYYY-MM-DD
    time?: string; // HH:mm
    type: EventType;
    brandId: string; // Links to Brand
    status: EventStatus;
}
