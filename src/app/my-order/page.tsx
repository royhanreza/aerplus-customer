"use client";

import { InfiniteSuccessReponse, OutletSaleOrder } from "@/src/interface";
import { useCustomerStore } from "@/src/store/customer";
import { baseUrl } from "@/src/util/services";
import {
  RiCheckboxCircleLine,
  RiShoppingBag4Fill,
  RiContrastDrop2Fill,
  RiArrowLeftLine,
  RiDropboxLine,
  RiListCheck2,
  RiShoppingCart2Line,
  RiShoppingBag2Line,
  RiShoppingBagLine,
  RiShoppingBasketLine,
} from "@remixicon/react";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { pages } from "next/dist/build/templates/app-page";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Status from "./status";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

export default function MyOrder() {
  const router = useRouter();
  const { ref, inView } = useInView();
  const [orderStatus, setOrderStatus] = useState("order");

  const customer = useCustomerStore((state) => state.customer);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    isPending,
    refetch,
    isRefetching,
    isSuccess,
  } = useInfiniteQuery<
    AxiosResponse<InfiniteSuccessReponse<OutletSaleOrder[]>>,
    AxiosError,
    InfiniteData<AxiosResponse<InfiniteSuccessReponse<OutletSaleOrder[]>>>
  >({
    queryKey: ["outlet-orders", customer?.id, orderStatus],
    queryFn: ({ pageParam }) => {
      // console.log(pageParam);
      return axios.get(
        `${baseUrl}/api/v1/outlet-sale-orders?pagination=1&customer_id=${customer?.id}&status=${orderStatus}&page=${pageParam}`
      );
    },
    initialPageParam: 1,
    getNextPageParam: (data, pages) => {
      console.log(data);
      // return 1;
      // console.log("last_page", lastPage.data.data.last_page);
      const lastPage = data.data.data.last_page ?? 1;
      const nextPage = (data.data.data.current_page ?? 0) + 1;
      if (nextPage <= lastPage) {
        return nextPage;
      }
      // return lastPage;
    },
  });

  useEffect(() => {
    refetch();
  }, [orderStatus]);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const onChangeTab = (orderStatus: string) => {
    setOrderStatus(orderStatus);
  };

  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    // Cek window.history setelah komponen di-mount (client-side)
    console.log(typeof window.history);
    console.log(window.history);
    setHasHistory(window.history.length > 1);
  }, []);

  return (
    <html lang="id" data-theme="lofi">
      <body className="bg-slate-300">
        <div className="bg-slate-100 min-h-dvh max-w-screen-sm mx-auto flex flex-col">
          <div className="bg-white shadow-sm">
            <div className="px-4 py-3 text-xl font-semibold flex items-center justify-between">
              <div className="flex items-center">
                {/* <div className="me-2">
                  <button
                    className="btn btn-circle btn-ghost"
                    onClick={() => {
                      router.back();
                    }}
                  >
                    <RiArrowLeftLine />
                  </button>
                </div> */}
                <div>Pemesanan</div>
              </div>
              <div>
                <button
                  className="btn btn-circle btn-ghost"
                  onClick={() => {
                    // console.log("clicked");
                    router.push("/order");
                  }}
                >
                  <RiShoppingBasketLine />
                </button>
              </div>
            </div>
            <div
              role="tablist"
              className="tabs tabs-bordered overflow-x-scroll"
            >
              <a
                role="tab"
                className={`tab ${
                  orderStatus == "order"
                    ? "tab-active text-amber-500 font-semibold border-amber-500"
                    : ""
                } `}
                style={
                  orderStatus == "order" ? { borderBottomColor: "#f59e0b" } : {}
                }
                onClick={() => {
                  setOrderStatus("order");
                }}
              >
                Dipesan
              </a>
              <a
                role="tab"
                className={`tab ${
                  orderStatus == "deliver"
                    ? "tab-active text-amber-500 font-semibold border-amber-500"
                    : ""
                } `}
                style={
                  orderStatus == "deliver"
                    ? { borderBottomColor: "#f59e0b" }
                    : {}
                }
                onClick={() => {
                  setOrderStatus("deliver");
                }}
              >
                Dikirim
              </a>
              <a
                role="tab"
                className={`tab ${
                  orderStatus == "finish"
                    ? "tab-active text-amber-500 font-semibold border-amber-500"
                    : ""
                } `}
                style={
                  orderStatus == "finish"
                    ? { borderBottomColor: "#f59e0b" }
                    : {}
                }
                onClick={() => {
                  setOrderStatus("finish");
                }}
              >
                Selesai
              </a>
            </div>
          </div>
          {isPending ? (
            <div className="flex-1 flex justify-center items-center">
              <div>
                <span className="loading loading-dots loading-lg text-amber-500"></span>
              </div>
            </div>
          ) : (
            <div className="text-sm p-2 flex flex-col gap-2">
              {data?.pages.map((page, index) => (
                <div className="flex flex-col gap-2" key={index}>
                  {page.data.data.data.map((order) => (
                    <Link href={`/my-order/detail/${order.id}`} key={order.id}>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="flex justify-between items-center mb-4 border-b border-b-slate-100 pb-3">
                          <div className="flex items-center">
                            <div className="me-2">
                              <RiShoppingBag4Fill className="text-amber-500" />
                            </div>
                            <div>
                              <div className="text-xs font-bold">Belanja</div>
                              <div className="text-xs text-gray-500">
                                16 Okt 2024
                              </div>
                            </div>
                          </div>
                          <Status status={order.status} />
                          {/* <div className="badge bg-green-100 border-none rounded">
                        <RiCheckboxCircleLine
                          className="text-green-600 me-1"
                          size={12}
                        />
                        <span className="text-xs text-green-600">Selesai</span>
                      </div> */}
                        </div>
                        <div className="flex flex-col gap-3 mb-3">
                          {order.items.map((orderItem) => (
                            <div className="card shadow-sm" key={orderItem.id}>
                              <div className="card-body p-2">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div>
                                      <div className="p-2 bg-blue-100 rounded">
                                        <RiContrastDrop2Fill className="text-blue-500" />
                                      </div>
                                    </div>
                                    <div className="ps-2">
                                      <h4 className="font-semibold text-xs">
                                        {orderItem.product?.name}
                                      </h4>
                                      <p className="text-gray-500 text-xs">
                                        {orderItem.quantity} barang
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs text-amber-500">
                                      Rp{" "}
                                      {orderItem.amount?.toLocaleString(
                                        "De-de"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {order.items.length === 0 ? (
                            <div className="flex justify-center items-center w-full h-20 ">
                              <div className="flex flex-col items-center text-slate-400">
                                <RiDropboxLine className="mb-2" />
                                <p className="text-xs">Tidak ada produk</p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <h4 className="text-xs">Total Belanja</h4>
                            <p className="font-semibold text-xs">
                              Rp {order.total?.toLocaleString("De-de")}
                            </p>
                          </div>
                          <div>
                            <button className="btn bg-amber-500 text-white btn-sm text-xs rounded-md">
                              Beli Lagi
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}

              {isSuccess && hasNextPage ? (
                <div
                  ref={ref}
                  style={{ height: "50px" }}
                  className="flex justify-center items-center"
                >
                  {isFetchingNextPage ? (
                    <div>
                      <span className="loading loading-dots loading-lg text-amber-500"></span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* {data?.pages.map((order) => (
                
              ))} */}
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
