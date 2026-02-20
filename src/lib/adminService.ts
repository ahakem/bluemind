import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Partner, GuestInstructor } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';

// Helper to ensure db is available
const ensureDb = () => {
  if (!db) throw new Error('Firebase Firestore not configured');
  return db;
};

const ensureStorage = () => {
  if (!storage) throw new Error('Firebase Storage not configured');
  return storage;
};

// Partners CRUD operations
export const partnersService = {
  async getAll(): Promise<Partner[]> {
    const firestore = ensureDb();
    const q = query(collection(firestore, 'partners'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Partner[];
  },

  async getById(id: string): Promise<Partner | null> {
    const firestore = ensureDb();
    const docRef = doc(firestore, 'partners', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate(),
      updatedAt: snapshot.data().updatedAt?.toDate(),
    } as Partner;
  },

  async create(data: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const firestore = ensureDb();
    const docRef = await addDoc(collection(firestore, 'partners'), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Omit<Partner, 'id' | 'createdAt'>>): Promise<void> {
    const firestore = ensureDb();
    await updateDoc(doc(firestore, 'partners', id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const firestore = ensureDb();
    await deleteDoc(doc(firestore, 'partners', id));
  },
};

// Guest Instructors CRUD operations
export const instructorsService = {
  async getAll(): Promise<GuestInstructor[]> {
    const firestore = ensureDb();
    const q = query(collection(firestore, 'guestInstructors'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as GuestInstructor[];
  },

  async getById(id: string): Promise<GuestInstructor | null> {
    const firestore = ensureDb();
    const docRef = doc(firestore, 'guestInstructors', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate(),
      updatedAt: snapshot.data().updatedAt?.toDate(),
    } as GuestInstructor;
  },

  async create(data: Omit<GuestInstructor, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const firestore = ensureDb();
    const docRef = await addDoc(collection(firestore, 'guestInstructors'), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Omit<GuestInstructor, 'id' | 'createdAt'>>): Promise<void> {
    const firestore = ensureDb();
    await updateDoc(doc(firestore, 'guestInstructors', id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    const firestore = ensureDb();
    await deleteDoc(doc(firestore, 'guestInstructors', id));
  },
};

// Image upload service
export const imageService = {
  async uploadImage(file: Blob, folder: 'partners' | 'instructors'): Promise<string> {
    const storageInstance = ensureStorage();
    const fileName = `${folder}/${uuidv4()}.webp`;
    const storageRef = ref(storageInstance, fileName);
    await uploadBytes(storageRef, file, { contentType: 'image/webp' });
    return getDownloadURL(storageRef);
  },

  async deleteImage(url: string): Promise<void> {
    try {
      const storageInstance = ensureStorage();
      const storageRef = ref(storageInstance, url);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  },
};
