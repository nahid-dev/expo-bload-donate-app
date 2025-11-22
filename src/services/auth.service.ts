// src/services/auth.service.ts
import { auth, db } from "./firebase";
import { 
  signInWithPhoneNumber, 
  PhoneAuthProvider, 
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "../types";

export const verifyOTP = async (verificationId: string, code: string) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    const result = await signInWithCredential(auth, credential);
    return result.user;
  } catch (error) {
    console.error("OTP verification error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Get user profile error:", error);
    return null;
  }
};

export const createUserProfile = async (user: FirebaseUser, phoneNumber: string): Promise<User> => {
  try {
    const userData: Omit<User, 'createdAt' | 'updatedAt'> & { createdAt: any; updatedAt: any } = {
      uid: user.uid,
      phoneNumber: phoneNumber || user.phoneNumber || "",
      displayName: user.displayName || null,
      email: user.email || null,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), userData);
    
    return {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  } catch (error) {
    console.error("Create user profile error:", error);
    throw error;
  }
};

export const setupAuthListener = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
