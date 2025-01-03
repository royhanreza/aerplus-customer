import { create } from "zustand";
import { Customer } from "../interface";
import { produce } from "immer";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CustomerState {
  customer: Customer | null;
  setCustomer: (customer: Customer | undefined) => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customer: null,
      setCustomer: (customer: Customer | undefined) => {
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
