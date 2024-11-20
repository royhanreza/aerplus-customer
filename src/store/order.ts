import { produce } from "immer";
import { create } from "zustand";
import { Product } from "../interface";

export const useOrderStore = create((set, get: any) => ({
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
  setProducts: (products: Product) => {
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
