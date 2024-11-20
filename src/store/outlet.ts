import { create } from "zustand";
import { Outlet } from "../interface";
import { produce } from "immer";
import { createJSONStorage, persist } from "zustand/middleware";

export interface OutletState {
  outlet: Outlet | null;
  setOutlet: (customer: Outlet) => void;
}

export const useOutletStore = create<OutletState>()(
  persist(
    (set) => ({
      outlet: null,
      setOutlet: (outlet: Outlet | null) => {
        return set(
          produce((state) => {
            state.outlet = outlet;
          })
        );
      },
    }),
    {
      name: "outlet-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        outlet: state.outlet,
      }),
    }
  )
);
