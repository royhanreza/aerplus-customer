import { produce } from "immer";
import { create } from "zustand";
import { Product } from "../interface";

export interface OrderState {
  selectedProducts: { [key: string]: number };
  note: string;
  paymentMethod: string;
  products: Product[];
  setNote: (note: string) => void;
  setPaymentMethod: (paymentMethod: string) => void;
  setProducts: (products: Product[]) => void;
  increaseProductQuantity: (productId: number) => void;
  decreaseProductQuantity: (productId: number) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  selectedProducts: {},
  note: "",
  paymentMethod: "cash",
  products: [],
  setNote: (note: string) => {
    return set(
      produce((state) => {
        state.note = note;
      })
    );
  },
  setPaymentMethod: (paymentMethod: string) => {
    return set(
      produce((state) => {
        state.paymentMethod = paymentMethod;
      })
    );
  },
  setProducts: (products: Product[]) => {
    return set(
      produce((state) => {
        state.products = products;
      })
    );
  },
  increaseProductQuantity: (productId: number) => {
    return set(
      produce((state) => {
        const newSelectedProduct = {
          [productId]: (state.selectedProducts[productId] ?? 0) + 1,
        };
        state.selectedProducts = {
          ...state.selectedProducts,
          ...newSelectedProduct,
        };
      })
    );
  },
  decreaseProductQuantity: (productId: number) => {
    return set(
      produce((state) => {
        if (state.selectedProducts[productId] > 0) {
          const newSelectedProduct = {
            [productId]: (state.selectedProducts[productId] ?? 0) - 1,
          };

          state.selectedProducts = {
            ...state.selectedProducts,
            ...newSelectedProduct,
          };
        }
      })
    );
  },
}));
