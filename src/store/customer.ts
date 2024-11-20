import { create } from "zustand";
import { Customer, Outlet } from "../interface";
import { produce } from "immer";
import { createJSONStorage, persist } from "zustand/middleware";

interface CustomerState {
  customer: Customer | null;
  setCustomer: (customer: Customer) => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customer: null,
      setCustomer: (customer: Customer) => {
        return set(
          produce((state) => {
            state.customer = customer;
          })
        );
      },
    }),
    {
      name: "customer-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customer: state.customer,
      }),
    }
  )
);
