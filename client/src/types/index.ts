export type UserRole = 'member' | 'admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface Member {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subscriptionType: 'monthly' | 'quarterly' | 'annual';
  subscriptionStatus: 'Active' | 'Inactive' | 'Pending';
  nextRenewalDate: Date;
  medicalCertExpiry: Date | null;
  freeDivingCertExpiry: Date | null;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  maxCapacity: number;
  currentAttendance: number;
  coachId: string;
  coachName: string;
  notes?: string;
  createdAt: Date;
}

export interface Attendance {
  id: string;
  sessionId: string;
  userId: string;
  memberName: string;
  status: 'Confirmed' | 'Cancelled' | 'Attended' | 'No-Show';
  rsvpDate: Date;
  attendedAt?: Date;
}

export type InvoiceStatus = 'Pending' | 'Transfer Initiated' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  paymentReference: string;
  status: InvoiceStatus;
  dueDate: Date;
  paidDate?: Date;
  subscriptionPeriod: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalBest {
  id: string;
  memberId: string;
  discipline: 'STA' | 'DYN' | 'DNF' | 'CWT' | 'FIM';
  value: number;
  unit: 'seconds' | 'meters';
  date: Date;
  location: string;
  notes?: string;
  verified: boolean;
  createdAt: Date;
}
