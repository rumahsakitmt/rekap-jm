import { create } from "zustand";
import { endOfDay, startOfDay } from "date-fns";

export interface IgdRegistrationFilterState {
  keyword: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

export interface IgdRegistrationFilterActions {
  setKeyword: (keyword: string) => void;
  setDateFrom: (date: Date | undefined) => void;
  setDateTo: (date: Date | undefined) => void;
  setDateRange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void;
  reset: () => void;
}

export type IgdRegistrationFilterStore = IgdRegistrationFilterState &
  IgdRegistrationFilterActions;

const defaultDates = () => {
  const now = new Date();
  return {
    dateFrom: startOfDay(now),
    dateTo: endOfDay(now),
  };
};

export const useIgdRegistrationFilterStore = create<IgdRegistrationFilterStore>(
  (set) => ({
    keyword: "",
    ...defaultDates(),
    setKeyword: (keyword) => set({ keyword }),
    setDateFrom: (dateFrom) => set({ dateFrom }),
    setDateTo: (dateTo) => set({ dateTo }),
    setDateRange: (dateFrom, dateTo) => set({ dateFrom, dateTo }),
    reset: () =>
      set({
        keyword: "",
        ...defaultDates(),
      }),
  })
);
