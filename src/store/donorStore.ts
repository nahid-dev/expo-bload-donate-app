import { create } from 'zustand';
import { Donor } from '../types';

interface DonorState {
  currentDonor: Donor | null;
  setCurrentDonor: (donor: Donor | null) => void;
  isRegistered: boolean;
  setIsRegistered: (registered: boolean) => void;
}

export const useDonorStore = create<DonorState>((set) => ({
  currentDonor: null,
  setCurrentDonor: (donor) => set({ currentDonor: donor }),
  isRegistered: false,
  setIsRegistered: (registered) => set({ isRegistered: registered }),
}));

