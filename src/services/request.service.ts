import { db } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { BloodRequest, BloodGroup } from "../types";

export const createBloodRequest = async (requestData: Omit<BloodRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<BloodRequest> => {
  try {
    const requestRef = await addDoc(collection(db, "bloodRequests"), {
      ...requestData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: requestRef.id,
      ...requestData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Create blood request error:", error);
    throw error;
  }
};

export const getBloodRequests = async (userId?: string, status?: string): Promise<BloodRequest[]> => {
  try {
    let q = query(collection(db, "bloodRequests"), orderBy("createdAt", "desc"));

    if (userId) {
      q = query(q, where("userId", "==", userId));
    }
    if (status) {
      q = query(q, where("status", "==", status));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as BloodRequest;
    });
  } catch (error) {
    console.error("Get blood requests error:", error);
    throw error;
  }
};

export const updateBloodRequest = async (requestId: string, updates: Partial<BloodRequest>): Promise<void> => {
  try {
    const requestRef = doc(db, "bloodRequests", requestId);
    await updateDoc(requestRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Update blood request error:", error);
    throw error;
  }
};

export const searchBloodRequests = async (
  bloodGroup?: BloodGroup,
  city?: string,
  state?: string,
  status?: string
): Promise<BloodRequest[]> => {
  try {
    let q = query(collection(db, "bloodRequests"), orderBy("createdAt", "desc"));

    if (bloodGroup) {
      q = query(q, where("bloodGroup", "==", bloodGroup));
    }
    if (city) {
      q = query(q, where("city", "==", city));
    }
    if (state) {
      q = query(q, where("state", "==", state));
    }
    if (status) {
      q = query(q, where("status", "==", status));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as BloodRequest;
    });
  } catch (error) {
    console.error("Search blood requests error:", error);
    throw error;
  }
};

