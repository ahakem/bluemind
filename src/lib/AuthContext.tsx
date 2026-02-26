'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'author';
  createdAt: Date;
  lastLogin?: Date;
}

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createAdminUser: (email: string, password: string, displayName: string, role: 'admin' | 'editor' | 'author') => Promise<void>;
  getAdminUsers: () => Promise<AdminUser[]>;
  updateAdminUser: (uid: string, data: Partial<AdminUser>) => Promise<void>;
  updateProfile: (displayName: string, avatar?: string) => Promise<void>;
  deleteAdminUser: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured() || !auth) {
      console.warn('Firebase not configured. Please set up .env.local');
      setLoading(false);
      return;
    }
    
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        
        if (firebaseUser && db) {
          try {
            // Check if user is an admin
            const adminDoc = await getDoc(doc(db, 'adminUsers', firebaseUser.uid));
            if (adminDoc.exists()) {
              const adminData = adminDoc.data() as Omit<AdminUser, 'uid'>;
              setAdminUser({ uid: firebaseUser.uid, ...adminData });
              
              // Update last login
              await updateDoc(doc(db, 'adminUsers', firebaseUser.uid), {
                lastLogin: new Date(),
              }).catch(() => {}); // Ignore update errors
            } else {
              setAdminUser(null);
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
            setAdminUser(null);
          }
        } else {
          setAdminUser(null);
        }
        
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase auth error:', error);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth || !db) throw new Error('Firebase not configured');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Verify user is an admin
    const adminDoc = await getDoc(doc(db, 'adminUsers', userCredential.user.uid));
    if (!adminDoc.exists()) {
      await firebaseSignOut(auth);
      throw new Error('Access denied. You are not an administrator.');
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setAdminUser(null);
  };

  const createAdminUser = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: 'admin' | 'editor' | 'author'
  ) => {
    if (!auth || !db) throw new Error('Firebase not configured');
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create admin user document
    await setDoc(doc(db, 'adminUsers', userCredential.user.uid), {
      email,
      displayName,
      role,
      createdAt: new Date(),
    });
  };

  const getAdminUsers = async (): Promise<AdminUser[]> => {
    if (!db) return [];
    const querySnapshot = await getDocs(collection(db, 'adminUsers'));
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    })) as AdminUser[];
  };

  const updateAdminUser = async (uid: string, data: Partial<AdminUser>) => {
    if (!db) throw new Error('Firebase not configured');
    await updateDoc(doc(db, 'adminUsers', uid), data);
    
    // If updating current user, refresh adminUser state
    if (uid === user?.uid && adminUser) {
      setAdminUser({ ...adminUser, ...data });
    }
  };

  const updateProfile = async (displayName: string, avatar?: string) => {
    if (!user || !db) throw new Error('Not authenticated');
    const updates: Partial<AdminUser> = { displayName };
    if (avatar) updates.avatar = avatar;
    await updateAdminUser(user.uid, updates);
  };

  const deleteAdminUser = async (uid: string) => {
    if (!db) throw new Error('Firebase not configured');
    await deleteDoc(doc(db, 'adminUsers', uid));
    // Note: This only removes from Firestore. Firebase Auth user deletion 
    // requires Admin SDK (server-side) or the user to delete themselves.
  };

  const value = {
    user,
    adminUser,
    loading,
    isAdmin: !!adminUser,
    signIn,
    signOut,
    createAdminUser,
    getAdminUsers,
    updateAdminUser,
    updateProfile,
    deleteAdminUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
