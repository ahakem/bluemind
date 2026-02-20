'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { Partner, GuestInstructor } from '@/types/admin';
import { partners as staticPartners, guestInstructors as staticInstructors } from '@/data';

interface CommunityData {
  partners: Partner[];
  instructors: GuestInstructor[];
  loading: boolean;
  error: string | null;
}

export function useCommunityData(): CommunityData {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [instructors, setInstructors] = useState<GuestInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if Firebase is configured
        if (!isFirebaseConfigured() || !db || typeof window === 'undefined') {
          // Use static data as fallback
          setPartners(staticPartners.map((p, i) => ({
            ...p,
            id: p.id?.toString() || i.toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })));
          setInstructors(staticInstructors.map((inst, i) => ({
            ...inst,
            id: inst.id?.toString() || i.toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })));
          setLoading(false);
          return;
        }

        // Fetch from Firestore
        const [partnersSnap, instructorsSnap] = await Promise.all([
          getDocs(query(collection(db, 'partners'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'guestInstructors'), orderBy('createdAt', 'desc'))),
        ]);

        const partnersData = partnersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Partner[];

        const instructorsData = instructorsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as GuestInstructor[];

        // If database is empty, use static data
        if (partnersData.length === 0 && instructorsData.length === 0) {
          setPartners(staticPartners.map((p, i) => ({
            ...p,
            id: p.id?.toString() || i.toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })));
          setInstructors(staticInstructors.map((inst, i) => ({
            ...inst,
            id: inst.id?.toString() || i.toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })));
        } else {
          setPartners(partnersData);
          setInstructors(instructorsData);
        }
      } catch (err) {
        console.error('Error fetching community data:', err);
        setError('Failed to load community data');
        
        // Fallback to static data on error
        setPartners(staticPartners.map((p, i) => ({
          ...p,
          id: p.id?.toString() || i.toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })));
        setInstructors(staticInstructors.map((inst, i) => ({
          ...inst,
          id: inst.id?.toString() || i.toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { partners, instructors, loading, error };
}
