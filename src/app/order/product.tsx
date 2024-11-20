"use client";

import {
  ErrorResponse,
  Product as IProduct,
  SuccessResponse,
} from "@/src/interface";
import { useOutletStore } from "@/src/store/outlet";
import { OrderState, useOrderStore } from "@/src/store/order";
import { baseUrl } from "@/src/util/services";
import { RiAddLine, RiStore2Line, RiSubtractLine } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useEffect } from "react";

export default function Product() {
  const selectedProducts = useOrderStore(
    (state: OrderState) => state.selectedProducts
  );

  const outlet = useOutletStore((state) => state.outlet);

  const increaseProductQuantity = useOrderStore(
    (state: OrderState) => state.increaseProductQuantity
  );

  const decreaseProductQuantity = useOrderStore(
    (state: OrderState) => state.decreaseProductQuantity
  );
  // const selectedProductsLength = useOrderStore((state: any) =>
  //   state.selectedProductsLength()
  // );
  const setProducts = useOrderStore((state: OrderState) => state.setProducts);

  const { isPending, isError, data, error } = useQuery<
    AxiosResponse<SuccessResponse<IProduct[]>>,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["products"],
    queryFn: () => {
      return axios.get(`${baseUrl}/api/v1/products`);
    },
  });

  useEffect(() => {
    setProducts(data?.data.data ?? []);
  }, [data]);

  return (
    <div className="bg-white p-4 mt-2">
      <div className="flex justify-between">
        <div className="text-sm font-bold mb-4">Produk</div>
        <div className="badge bg-green-100 me-2 border-none">
          <RiStore2Line className="text-green-600 me-1" size={12} />
          <span className="text-xs text-green-600">{outlet?.name}</span>
        </div>
      </div>
      {isPending ? (
        <div className="flex items-center gap-4">
          <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
          <div className="flex flex-col gap-4 w-full">
            <div className="skeleton h-4 w-44"></div>
            <div className="skeleton h-4 w-80"></div>
          </div>
        </div>
      ) : isError ? (
        <div role="alert" className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error.response?.data?.message || "Terjadi kesalahan"}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.data.data?.map((product) => (
            <div
              className="flex justify-between py-5 px-3 border rounded"
              key={product.id}
            >
              <div>
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-gray-500">
                  Rp {product.sale_price?.toLocaleString("De-de")}
                </p>
              </div>
              <div className="flex items-center">
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => {
                    decreaseProductQuantity(product.id);
                  }}
                >
                  <RiSubtractLine />
                </button>
                <div className="mx-3 text-base w-6 text-center">
                  <span>{selectedProducts[product.id] ?? 0}</span>
                </div>
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => {
                    increaseProductQuantity(product.id);
                  }}
                >
                  <RiAddLine />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
