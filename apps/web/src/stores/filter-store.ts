import { create } from "zustand";
import { startOfMonth, endOfMonth } from "date-fns";

export interface KonsulFilter {
  field: string;
  operator: string;
  value: string;
}

export interface FilterState {
  // Search and pagination
  search: string;
  limit: number | undefined;
  offset: number;
  page: number;

  // Date range
  dateFrom: Date | undefined;
  dateTo: Date | undefined;

  // CSV file selection
  selectedCsvFile: string;

  // Doctor and Poliklinik selection
  selectedDoctor: string;
  selectedPoliklinik: string | undefined;
  selectedSupport: string | undefined;
  // Konsul filters
  konsulFilters: KonsulFilter[];

  // UI state
  showCsvAnalysis: boolean;
  copiedItems: Set<string>;
  showScrollButtons: boolean;
}

export interface FilterActions {
  // Search and pagination actions
  setSearch: (search: string) => void;
  setLimit: (limit: number | undefined) => void;
  setOffset: (offset: number) => void;
  setPage: (page: number) => void;

  // Date range actions
  setDateFrom: (date: Date | undefined) => void;
  setDateTo: (date: Date | undefined) => void;
  setDateRange: (from: Date | undefined, to: Date | undefined) => void;

  // CSV file actions
  setSelectedCsvFile: (filename: string) => void;

  // Doctor and Poliklinik actions
  setSelectedDoctor: (doctorId: string) => void;
  setSelectedPoliklinik: (poliklinikId: string) => void;
  setSelectedSupport: (support: string) => void;
  // Konsul filter actions
  addKonsulFilter: (filter: KonsulFilter) => void;
  updateKonsulFilter: (index: number, filter: KonsulFilter) => void;
  removeKonsulFilter: (index: number) => void;
  clearKonsulFilters: () => void;

  // UI state actions
  setShowCsvAnalysis: (show: boolean) => void;
  addCopiedItem: (id: string) => void;
  removeCopiedItem: (id: string) => void;
  setShowScrollButtons: (show: boolean) => void;

  // Utility actions
  clearFilters: () => void;
  resetToDefaults: () => void;
}

export type FilterStore = FilterState & FilterActions;

const defaultState: FilterState = {
  search: "",
  limit: 50,
  offset: 0,
  page: 1,
  dateFrom: startOfMonth(new Date()),
  dateTo: endOfMonth(new Date()),
  selectedCsvFile: "",
  selectedDoctor: "",
  selectedPoliklinik: "",
  selectedSupport: "",
  konsulFilters: [],
  showCsvAnalysis: false,
  copiedItems: new Set(),
  showScrollButtons: false,
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...defaultState,

  // Search and pagination actions
  setSearch: (search: string) => set({ search, offset: 0, page: 1 }),
  setLimit: (limit: number | undefined) => set({ limit, offset: 0, page: 1 }),
  setOffset: (offset: number) => {
    const state = get();
    const page = Math.floor(offset / (state.limit || 50)) + 1;
    set({ offset, page });
  },
  setPage: (page: number) => {
    const state = get();
    const offset = (page - 1) * (state.limit || 50);
    set({ page, offset });
  },

  // Date range actions
  setDateFrom: (dateFrom: Date | undefined) => set({ dateFrom }),
  setDateTo: (dateTo: Date | undefined) => set({ dateTo }),
  setDateRange: (dateFrom: Date | undefined, dateTo: Date | undefined) =>
    set({ dateFrom, dateTo }),

  // CSV file actions
  setSelectedCsvFile: (selectedCsvFile: string) =>
    set({ selectedCsvFile, showCsvAnalysis: false, offset: 0, page: 1 }),

  // Doctor and Poliklinik actions
  setSelectedDoctor: (selectedDoctor: string) =>
    set({ selectedDoctor, offset: 0, page: 1 }),
  setSelectedPoliklinik: (selectedPoliklinik: string) =>
    set({ selectedPoliklinik, offset: 0, page: 1 }),

  // Support filter actions
  setSelectedSupport: (selectedSupport: string) =>
    set({ selectedSupport, offset: 0, page: 1 }),

  // Konsul filter actions
  addKonsulFilter: (filter: KonsulFilter) =>
    set((state) => ({
      konsulFilters: [...state.konsulFilters, filter],
      offset: 0,
      page: 1,
    })),
  updateKonsulFilter: (index: number, filter: KonsulFilter) =>
    set((state) => ({
      konsulFilters: state.konsulFilters.map((f, i) =>
        i === index ? filter : f
      ),
      offset: 0,
      page: 1,
    })),
  removeKonsulFilter: (index: number) =>
    set((state) => ({
      konsulFilters: state.konsulFilters.filter((_, i) => i !== index),
      offset: 0,
      page: 1,
    })),
  clearKonsulFilters: () => set({ konsulFilters: [], offset: 0, page: 1 }),

  // UI state actions
  setShowCsvAnalysis: (showCsvAnalysis: boolean) => set({ showCsvAnalysis }),
  addCopiedItem: (id: string) =>
    set((state) => ({
      copiedItems: new Set([...state.copiedItems, id]),
    })),
  removeCopiedItem: (id: string) =>
    set((state) => {
      const newSet = new Set(state.copiedItems);
      newSet.delete(id);
      return { copiedItems: newSet };
    }),
  setShowScrollButtons: (showScrollButtons: boolean) =>
    set({ showScrollButtons }),

  // Utility actions
  clearFilters: () =>
    set({
      search: "",
      limit: 50,
      offset: 0,
      page: 1,
      selectedCsvFile: "",
      selectedDoctor: "",
      selectedPoliklinik: "",
      selectedSupport: "",
      konsulFilters: [],
      showCsvAnalysis: false,
      dateFrom: startOfMonth(new Date()),
      dateTo: endOfMonth(new Date()),
    }),

  resetToDefaults: () => set(defaultState),
}));

// Selectors for specific parts of the state
export const useSearchFilters = () => {
  const search = useFilterStore((state) => state.search);
  const limit = useFilterStore((state) => state.limit);
  const offset = useFilterStore((state) => state.offset);
  const page = useFilterStore((state) => state.page);
  const dateFrom = useFilterStore((state) => state.dateFrom);
  const dateTo = useFilterStore((state) => state.dateTo);
  const selectedCsvFile = useFilterStore((state) => state.selectedCsvFile);
  const selectedDoctor = useFilterStore((state) => state.selectedDoctor);
  const selectedPoliklinik = useFilterStore(
    (state) => state.selectedPoliklinik
  );
  const selectedSupport = useFilterStore((state) => state.selectedSupport);
  const konsulFilters = useFilterStore((state) => state.konsulFilters);
  return {
    search,
    limit,
    offset,
    page,
    dateFrom,
    dateTo,
    selectedCsvFile,
    selectedDoctor,
    selectedPoliklinik,
    selectedSupport,
    konsulFilters,
  };
};

export const useDateFilters = () => {
  const dateFrom = useFilterStore((state) => state.dateFrom);
  const dateTo = useFilterStore((state) => state.dateTo);
  const setDateFrom = useFilterStore((state) => state.setDateFrom);
  const setDateTo = useFilterStore((state) => state.setDateTo);
  const setDateRange = useFilterStore((state) => state.setDateRange);

  return {
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
    setDateRange,
  };
};

export const useCsvFilters = () => {
  const selectedCsvFile = useFilterStore((state) => state.selectedCsvFile);
  const showCsvAnalysis = useFilterStore((state) => state.showCsvAnalysis);
  const setSelectedCsvFile = useFilterStore(
    (state) => state.setSelectedCsvFile
  );
  const setShowCsvAnalysis = useFilterStore(
    (state) => state.setShowCsvAnalysis
  );

  return {
    selectedCsvFile,
    showCsvAnalysis,
    setSelectedCsvFile,
    setShowCsvAnalysis,
  };
};

export const useUIState = () => {
  const copiedItems = useFilterStore((state) => state.copiedItems);
  const showScrollButtons = useFilterStore((state) => state.showScrollButtons);
  const addCopiedItem = useFilterStore((state) => state.addCopiedItem);
  const removeCopiedItem = useFilterStore((state) => state.removeCopiedItem);
  const setShowScrollButtons = useFilterStore(
    (state) => state.setShowScrollButtons
  );

  return {
    copiedItems,
    showScrollButtons,
    addCopiedItem,
    removeCopiedItem,
    setShowScrollButtons,
  };
};
