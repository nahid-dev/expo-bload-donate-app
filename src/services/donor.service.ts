import { db } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { Donor, BloodGroup } from "../types";

export const createDonorProfile = async (donorData: Omit<Donor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Donor> => {
  try {
    const donorRef = doc(collection(db, "donors"));
    const data = {
      ...donorData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(donorRef, data);

    return {
      id: donorRef.id,
      ...donorData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Create donor profile error:", error);
    throw error;
  }
};

export const getDonorByUserId = async (userId: string): Promise<Donor | null> => {
  try {
    const q = query(collection(db, "donors"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dateOfBirth: data.dateOfBirth?.toDate(),
        lastDonationDate: data.lastDonationDate?.toDate(),
        nextAvailableDate: data.nextAvailableDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Donor;
    }
    return null;
  } catch (error) {
    console.error("Get donor by user ID error:", error);
    return null;
  }
};

export const updateDonorProfile = async (donorId: string, updates: Partial<Donor>): Promise<void> => {
  try {
    const donorRef = doc(db, "donors", donorId);
    await updateDoc(donorRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Update donor profile error:", error);
    throw error;
  }
};

export const searchDonors = async (
  bloodGroup?: BloodGroup,
  city?: string,
  state?: string,
  isAvailable?: boolean
): Promise<Donor[]> => {
  try {
    let q = query(collection(db, "donors"), orderBy("createdAt", "desc"));

    if (bloodGroup) {
      q = query(q, where("bloodGroup", "==", bloodGroup));
    }
    if (city) {
      q = query(q, where("city", "==", city));
    }
    if (state) {
      q = query(q, where("state", "==", state));
    }
    if (isAvailable !== undefined) {
      q = query(q, where("isAvailable", "==", isAvailable));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dateOfBirth: data.dateOfBirth?.toDate(),
        lastDonationDate: data.lastDonationDate?.toDate(),
        nextAvailableDate: data.nextAvailableDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Donor;
    });
  } catch (error) {
    console.error("Search donors error:", error);
    throw error;
  }
};

export const getAllDonors = async (): Promise<Donor[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "donors"));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dateOfBirth: data.dateOfBirth?.toDate(),
        lastDonationDate: data.lastDonationDate?.toDate(),
        nextAvailableDate: data.nextAvailableDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Donor;
    });
  } catch (error) {
    console.error("Get all donors error:", error);
    throw error;
  }
};

