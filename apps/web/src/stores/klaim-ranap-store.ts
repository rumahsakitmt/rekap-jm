import { create } from "zustand";

interface KlaimRanapState {
  diagnosaIdrg: string[];
  prosedurIdrg: string[];
  diagnosaInacbg: string[];
  prosedurInacbg: string[];
  diagnosaStatuses: string[];
  prosedurStatuses: string[];
  kirimDialogOpen: boolean;
  hapusDialogOpen: boolean;
}

interface KlaimRanapActions {
  initFromData: (data: {
    diagnosa?: string | null;
    prosedur?: string | null;
    diagnosaInacbg?: string | null;
    prosedurInacbg?: string | null;
    diagnosaStatus?: string | null;
    prosedurStatus?: string | null;
  }) => void;
  setDiagnosaIdrg: (value: string[]) => void;
  setProsedurIdrg: (value: string[]) => void;
  setDiagnosaInacbg: (value: string[]) => void;
  setProsedurInacbg: (value: string[]) => void;
  setDiagnosaStatus: (index: number, status: string) => void;
  setProsedurStatus: (index: number, status: string) => void;
  setKirimDialogOpen: (open: boolean) => void;
  setHapusDialogOpen: (open: boolean) => void;
  reset: () => void;
}

const defaultState: KlaimRanapState = {
  diagnosaIdrg: [],
  prosedurIdrg: [],
  diagnosaInacbg: [],
  prosedurInacbg: [],
  diagnosaStatuses: [],
  prosedurStatuses: [],
  kirimDialogOpen: false,
  hapusDialogOpen: false,
};

function splitHash(value?: string | null): string[] {
  return value ? value.split("#").filter(Boolean) : [];
}

function syncStatuses(
  newCodes: string[],
  oldCodes: string[],
  oldStatuses: string[],
): string[] {
  const map = new Map<string, string>();
  oldCodes.forEach((c, i) => map.set(c, oldStatuses[i] || "Ralan"));
  return newCodes.map((c) => map.get(c) || "Ralan");
}

export const useKlaimRanapStore = create<
  KlaimRanapState & KlaimRanapActions
>((set, get) => ({
  ...defaultState,

  initFromData: (data) => {
    const dIdrg = splitHash(data.diagnosa);
    const pIdrg = splitHash(data.prosedur);
    const dInacbg =
      splitHash(data.diagnosaInacbg).length > 0
        ? splitHash(data.diagnosaInacbg)
        : dIdrg;
    const pInacbg =
      splitHash(data.prosedurInacbg).length > 0
        ? splitHash(data.prosedurInacbg)
        : pIdrg;

    set({
      diagnosaIdrg: dIdrg,
      prosedurIdrg: pIdrg,
      diagnosaInacbg: dInacbg,
      prosedurInacbg: pInacbg,
      diagnosaStatuses:
        splitHash(data.diagnosaStatus).length > 0
          ? splitHash(data.diagnosaStatus)
          : dIdrg.map(() => "Ralan"),
      prosedurStatuses:
        splitHash(data.prosedurStatus).length > 0
          ? splitHash(data.prosedurStatus)
          : pIdrg.map(() => "Ralan"),
    });
  },

  setDiagnosaIdrg: (value) => {
    const { diagnosaIdrg, diagnosaStatuses } = get();
    set({
      diagnosaIdrg: value,
      diagnosaInacbg: value,
      diagnosaStatuses: syncStatuses(value, diagnosaIdrg, diagnosaStatuses),
    });
  },

  setProsedurIdrg: (value) => {
    const { prosedurIdrg, prosedurStatuses } = get();
    set({
      prosedurIdrg: value,
      prosedurInacbg: value,
      prosedurStatuses: syncStatuses(value, prosedurIdrg, prosedurStatuses),
    });
  },

  setDiagnosaInacbg: (value) => {
    const { diagnosaInacbg, diagnosaStatuses } = get();
    set({
      diagnosaInacbg: value,
      diagnosaIdrg: value,
      diagnosaStatuses: syncStatuses(value, diagnosaInacbg, diagnosaStatuses),
    });
  },

  setProsedurInacbg: (value) => {
    const { prosedurInacbg, prosedurStatuses } = get();
    set({
      prosedurInacbg: value,
      prosedurIdrg: value,
      prosedurStatuses: syncStatuses(value, prosedurInacbg, prosedurStatuses),
    });
  },

  setDiagnosaStatus: (index, status) =>
    set((state) => {
      const next = [...state.diagnosaStatuses];
      next[index] = status;
      return { diagnosaStatuses: next };
    }),

  setProsedurStatus: (index, status) =>
    set((state) => {
      const next = [...state.prosedurStatuses];
      next[index] = status;
      return { prosedurStatuses: next };
    }),

  setKirimDialogOpen: (open) => set({ kirimDialogOpen: open }),
  setHapusDialogOpen: (open) => set({ hapusDialogOpen: open }),
  reset: () => set(defaultState),
}));
