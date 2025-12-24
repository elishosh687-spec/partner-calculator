import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserData } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'partner' | 'boss') => Promise<void>;
  signInWithGoogle: (role: 'partner' | 'boss') => Promise<void>;
  updateUserName: (newName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // טעינת נתוני המשתמש מ-Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              id: user.uid,
              name: data.name,
              email: data.email,
              role: data.role,
              createdAt: data.createdAt?.toDate() || new Date(),
            });
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error('❌ שגיאה בטעינת נתוני משתמש:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signup = async (email: string, password: string, name: string, role: 'partner' | 'boss') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // יצירת מסמך משתמש ב-Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      role,
      createdAt: new Date(),
    });
  };

  const signInWithGoogle = async (role: 'partner' | 'boss') => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // בדוק אם המשתמש כבר קיים
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    // אם המשתמש לא קיים - צור אותו
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        name: user.displayName || user.email?.split('@')[0] || 'משתמש',
        email: user.email,
        role,
        createdAt: new Date(),
      });
    }
  };

  const updateUserName = async (newName: string) => {
    if (!currentUser) {
      throw new Error('משתמש לא מחובר');
    }
    
    if (!newName || newName.trim().length === 0) {
      throw new Error('שם לא יכול להיות ריק');
    }
    
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, {
      name: newName.trim()
    });
    
    // עדכון userData מקומי
    if (userData) {
      setUserData({
        ...userData,
        name: newName.trim()
      });
    }
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    login,
    logout,
    signup,
    signInWithGoogle,
    updateUserName,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

