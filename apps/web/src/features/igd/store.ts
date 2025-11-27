import { create } from "zustand"

export type Skala = "skala1" | "skala2" | "skala3" | "skala4" | "skala5";
export type TriaseType = "primer" | "sekunder";

interface TriaseStore {
  type: TriaseType;
  skala: Skala;
  setType: (type: TriaseType) => void;
  setSkala: (skala: Skala) => void;
}

export const useTriaseStore = create<TriaseStore>((set) => ({
  type: "primer",
  skala: "skala1",
  setType: (type) => set({ type }),
  setSkala: (skala) => set({ skala }),
}));
