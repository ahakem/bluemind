import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { bookingDb } from './bookingFirebase';

export interface BookingSession {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: string;
  locationName: string;
  capacity: number;
  currentAttendance: number;
  description?: string;
}

const toDate = (val: unknown): Date => {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date();
};

export const getUpcomingSessions = async (): Promise<BookingSession[]> => {
  if (!bookingDb) return [];
  try {
    const now = Timestamp.now();
    const q = query(
      collection(bookingDb, 'sessions'),
      where('date', '>=', now),
      orderBy('date', 'asc'),
      limit(12)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        date: toDate(data.date),
        startTime: (data.startTime as string) || '',
        endTime: (data.endTime as string) || '',
        type: (data.type as string) || 'pool',
        locationName: (data.locationName as string) || '',
        capacity: (data.capacity as number) || 0,
        currentAttendance: (data.currentAttendance as number) || 0,
        description: (data.description as string) || undefined,
      };
    });
  } catch (err) {
    console.error('[bookingService] Failed to fetch sessions:', err);
    return [];
  }
};
