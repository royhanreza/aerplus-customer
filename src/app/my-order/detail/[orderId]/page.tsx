"use client";

import {
  ErrorResponse,
  OutletSaleOrder,
  SuccessResponse,
} from "@/src/interface";
import { baseUrl } from "@/src/util/services";
import {
  RiArrowLeftLine,
  RiCheckboxCircleLine,
  RiContrastDropLine,
  RiFileDamageLine,
  RiHourglassLine,
  RiMapPinLine,
  RiSecurePaymentLine,
  RiShoppingBag4Fill,
  RiTimeLine,
  RiTruckLine,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import Payment from "./payment";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import { formatFileSize } from "@/src/util/util";
import ImageViewer from "react-simple-image-viewer";

function StatusBadge({ status }: { status: string | null | undefined }) {
  if (status == "pending") {
    return (
      <div className="badge bg-yellow-100 border-none rounded">
        <RiHourglassLine className="text-yellow-600 me-1" size={12} />
        <span className="text-xs text-yellow-600">Diproses</span>
      </div>
    );
  } else if (status == "waiting_payment") {
    return (
      <div className="badge bg-yellow-100 border-none rounded">
        <RiHourglassLine className="text-yellow-600 me-1" size={12} />
        <span className="text-xs text-yellow-600">Menunggu Pembayaran</span>
      </div>
    );
  } else if (status == "deliver") {
    return (
      <div className="badge bg-blue-100 border-none rounded">
        <RiTruckLine className="text-blue-600 me-1" size={12} />
        <span className="text-xs text-blue-600">Dikirim</span>
      </div>
    );
  } else if (status == "finish") {
    return (
      <div className="badge bg-green-100 border-none rounded">
        <RiCheckboxCircleLine className="text-green-600 me-1" size={12} />
        <span className="text-xs text-green-600">Selesai</span>
      </div>
    );
  }

  return (
    <div className="badge bg-yellow-100 border-none rounded">
      <RiTimeLine className="text-yellow-600 me-1" size={12} />
      <span className="text-xs text-yellow-600">Menunggu</span>
    </div>
  );
}

function Status({ status }: { status: string | null | undefined }) {
  if (status == "pending") {
    return (
      <div className="px-4 py-3 bg-yellow-500 font-semibold text-sm text-white">
        Menunggu Dikirim
      </div>
    );
  } else if (status == "waiting_payment") {
    return (
      <div className="px-4 py-3 bg-yellow-500 font-semibold text-sm text-white">
        Menunggu Pembayaran
      </div>
    );
  } else if (status == "deliver") {
    return (
      <div className="px-4 py-3 bg-blue-500 font-semibold text-sm text-white">
        Sedang Dikirim
      </div>
    );
  } else if (status == "finish") {
    return (
      <div className="px-4 py-3 bg-teal-600 font-semibold text-sm text-white">
        Pesanan Selesai
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-white font-semibold text-sm text-black">
      Menunggu Konfirmasi
    </div>
  );
}

function StatusDescription({ status }: { status: string | null | undefined }) {
  if (status == "pending") {
    return (
      <div className="text-yellow-600">
        Pesanan sedang menunggu untuk dikirim
      </div>
    );
  } else if (status == "waiting_payment") {
    return <div className="text-yellow-600">Pesanan perlu dibayar</div>;
  } else if (status == "deliver") {
    return <div className="text-blue-400">Pesanan sedang dikirim</div>;
  } else if (status == "finish") {
    return <div className="text-teal-600">Pesanan tiba di alamat tujuan</div>;
  }

  return <div>Pesanan sedang diproses</div>;
}

export default function OrderDetail() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();

  const [currentImage, setCurrentImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const openImageViewer = useCallback((index: number) => {
    setCurrentImage(index);
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  const { isPending, data, refetch, isRefetching } = useQuery<
    AxiosResponse<SuccessResponse<OutletSaleOrder>>,
    AxiosError<ErrorResponse>
  >({
    queryKey: ["order_detail"],
    queryFn: () => {
      return axios.get(
        `${baseUrl}/api/v1/outlet-sale-orders/${params.orderId}`
      );
    },
    // enabled: false,
  });

  const formattedStatusDescriptionDate = useMemo<string>(
    () =>
      dayjs(data?.data.data?.ordered_at).format("DD-MM-YYYY H:mm").toString(),
    [data]
  );

  const formattedProductDate = useMemo<string>(
    () => dayjs(data?.data.data?.ordered_at).format("DD MMM YYYY").toString(),
    [data]
  );

  const translatedPaymentMethod = useMemo<string>(() => {
    const paymentMethod = data?.data.data?.payment_method;
    if (paymentMethod == "cash") {
      return "Tunai";
    } else if (paymentMethod == "transfer") {
      return "Transfer";
    }

    return "-";
  }, [data]);

  const formattedOrderedAt = useMemo<string>(() => {
    const date = data?.data.data?.ordered_at;

    if (!date || !dayjs(date).isValid) {
      return "-";
    }

    return dayjs(date).format("DD MMM YYYY H:mm").toString();
  }, [data]);

  const formattedDeliveredAt = useMemo<string>(() => {
    const date = data?.data.data?.delivered_at;

    if (!date || !dayjs(date).isValid) {
      return "-";
    }

    return dayjs(date).format("DD MMM YYYY H:mm").toString();
  }, [data]);

  const formattedPaidAt = useMemo<string>(() => {
    const date = data?.data.data?.paid_at;

    if (!date || !dayjs(date).isValid) {
      return "-";
    }

    return dayjs(date).format("DD MMM YYYY H:mm").toString();
  }, [data]);

  const formattedFinishedAt = useMemo<string>(() => {
    const date = data?.data.data?.finished_at;

    if (!date || !dayjs(date).isValid) {
      return "-";
    }

    return dayjs(date).format("DD MMM YYYY H:mm").toString();
  }, [data]);

  return (
    <html lang="en" data-theme="lofi">
      <body className="bg-slate-300">
        <div className="bg-slate-100 min-h-dvh max-w-screen-sm mx-auto">
          <div className="bg-white shadow-sm">
            <div className="px-4 py-3 text-xl font-semibold flex items-center">
              <div className="me-2">
                <button
                  className="btn btn-circle btn-ghost"
                  onClick={() => {
                    router.back();
                  }}
                >
                  <RiArrowLeftLine />
                </button>
              </div>
              <div>Rincian Pesanan</div>
            </div>
          </div>
          {isPending || isRefetching ? (
            <div className="min-h-dvh min-w-full flex justify-center items-center">
              <div>
                <span className="loading loading-dots loading-lg text-amber-500"></span>
              </div>
            </div>
          ) : (
            <div className="p-2">
              <div className="card bg-base-100 shadow-sm rounded-xl overflow-hidden mb-2">
                <Status status={data?.data.data?.status} />
                <div className="card-body p-0">
                  <div className="px-4 py-3">
                    <div className="text-sm font-semibold mb-1">
                      Info Pengiriman
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      No. {data?.data.data?.number}
                    </div>
                    <div className="flex">
                      <div>
                        <RiTruckLine className="text-stone-900" size={20} />
                      </div>
                      <div className="text-sm ps-3">
                        <StatusDescription status={data?.data.data?.status} />
                        <div className="text-gray-500 text-xs">
                          {formattedStatusDescriptionDate}
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="px-4 pb-6 pt-3">
                    <div className="text-sm font-semibold mb-3">
                      Alamat Pengiriman
                    </div>
                    <div className="flex">
                      <div>
                        <RiMapPinLine className="text-stone-900" size={20} />
                      </div>
                      <div className="text-sm ps-3">
                        <div className="mb-1">
                          <span>{data?.data.data?.recipient_name}</span>
                          <span>&nbsp;</span>
                          <span className="text-gray-500 text-xs">
                            (+62) {data?.data.data?.recipient_phone}
                          </span>
                        </div>
                        <div className=" text-xs">
                          {data?.data.data?.recipient_address}
                        </div>
                      </div>
                    </div>
                  </div>
                  {data?.data.data?.paid_at != null ? (
                    <>
                      <hr />
                      <div className="px-4 pb-6 pt-3">
                        <div className="text-sm font-semibold mb-3">
                          Pembayaran
                        </div>
                        <div className="flex">
                          <div>
                            <RiSecurePaymentLine
                              className="text-stone-900"
                              size={20}
                            />
                          </div>
                          <div className="text-sm ps-3 flex-1">
                            <div className="mb-3">
                              <span>Transfer Manual</span>
                              <span>&nbsp;</span>
                              <span className="text-gray-500 text-xs">
                                (BCA) 4910-5150-26 - TJHIN YIE FANG
                              </span>
                            </div>
                            <div
                              className="flex border border-slate-200 rounded overflow-hidden mb-3 cursor-pointer"
                              onClick={() => openImageViewer(0)}
                            >
                              <div
                                className="bg-slate-50"
                                style={{ width: "80px", height: "80px" }}
                              >
                                {data.data.data.proof_of_payment_file_url !=
                                null ? (
                                  <Image
                                    src={
                                      data.data.data.proof_of_payment_file_url
                                    }
                                    alt="Bukti Pembayaran"
                                    width={100}
                                    height={100}
                                    objectFit="cover"
                                    className="w-full h-full object-cover"
                                    // className="object-cover"
                                  />
                                ) : (
                                  <div className="flex w-full h-full justify-center items-center">
                                    <RiFileDamageLine className="text-slate-400" />
                                  </div>
                                )}
                              </div>
                              <div className="px-3 py-2 flex justify-between items-center flex-1 bg-slate-50 box-border">
                                <div>
                                  <p className="text-xs text-slate-500 mb-2">
                                    Bukti Pembayaran
                                  </p>
                                  <p className="text-xs font-semibold">
                                    {data.data.data.proof_of_payment_file_name}
                                  </p>
                                  <p className="text-xs font-semibold text-slate-500">
                                    {formatFileSize(
                                      Number(
                                        data.data.data
                                          .proof_of_payment_file_size
                                      )
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                  {/* <div className="text-xs font-semibold">Alamat Pengiriman</div> */}
                </div>
              </div>
              {data?.data.data?.payment_method == "transfer" &&
              data.data.data.status == "waiting_payment" ? (
                <div className="card bg-white shadow-sm rounded-xl overflow-hidden mb-2">
                  <div className="card-body p-4">
                    <Payment
                      orderId={data.data.data.id}
                      onSuccessPayment={() => {
                        refetch();
                      }}
                    />
                  </div>
                </div>
              ) : null}
              <div className="card bg-base-100 shadow-sm rounded-xl overflow-hidden mb-2">
                <div className="px-4 py-3 font-semibold text-sm">Produk</div>
                <div className="card-body px-4 py-3">
                  {data?.data.data?.items.map((product) => (
                    <div
                      className="bg-white p-3 rounded shadow-sm"
                      key={product.id}
                    >
                      <div className="flex justify-between items-center mb-4 border-b border-b-slate-100 pb-3">
                        <div className="flex items-center">
                          <div className="me-2">
                            <RiShoppingBag4Fill className="text-amber-500" />
                          </div>
                          <div>
                            <div className="text-xs font-bold">Belanja</div>
                            <div className="text-xs text-gray-500">
                              {formattedProductDate}
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={data?.data.data?.status} />
                      </div>
                      <div className="mb-3 flex">
                        <div>
                          <div className="p-2 bg-blue-100 rounded">
                            <RiContrastDropLine className="text-blue-500" />
                          </div>
                        </div>
                        <div className="ps-2">
                          <h4 className="font-semibold text-sm">
                            Air Isi Ulang + Antar
                          </h4>
                          <p className="text-gray-500 text-xs">
                            {product.quantity} barang
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end items-end">
                        <div className="text-end">
                          <h4 className="text-xs">Total Belanja</h4>
                          <p className="font-semibold text-xs">
                            Rp {product.amount?.toLocaleString("De-de")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card bg-base-100 shadow-sm rounded-xl overflow-hidden mb-2">
                <div className="px-4 py-3 flex justify-between items-center text-sm">
                  <div className="font-semibold">No. Pesanan</div>
                  <div className="text-xs">{data?.data.data?.number}</div>
                </div>
                <div className="card-body text-gray-600 p-0 pb-4">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-b-slate-100">
                    <div className="text-xs">Metode Pembayaran</div>
                    <div className="text-xs">{translatedPaymentMethod}</div>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <div className="text-xs">Waktu Pemesanan</div>
                    <div className="text-xs">{formattedOrderedAt}</div>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <div className="text-xs">Waktu Pembayaran</div>
                    <div className="text-xs">{formattedPaidAt}</div>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <div className="text-xs">Waktu Pengiriman</div>
                    <div className="text-xs">{formattedDeliveredAt}</div>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <div className="text-xs">Waktu Pesanan Selesai</div>
                    <div className="text-xs">{formattedFinishedAt}</div>
                  </div>
                </div>
              </div>
              <div>
                {data?.data.data?.status == "pending" ||
                data?.data.data?.status == "waiting_payment" ? (
                  <button className="btn bg-red-600 hover:bg-red-800 text-white rounded-md w-full">
                    Batalkan Pesanan
                  </button>
                ) : null}
              </div>
              <div>
                {data?.data.data?.status == "arrived" ? (
                  <button className="btn bg-green-500 hover:bg-green-700 text-white rounded-md w-full">
                    Selesai
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
        <Toaster position="bottom-center" />
        {isViewerOpen && data?.data.data?.proof_of_payment_file_url != null ? (
          <ImageViewer
            src={[data?.data.data?.proof_of_payment_file_url]}
            currentIndex={currentImage}
            onClose={closeImageViewer}
            disableScroll={false}
            backgroundStyle={{
              backgroundColor: "rgba(0,0,0,0.9)",
            }}
            closeOnClickOutside={true}
          />
        ) : null}
      </body>
    </html>
  );
}
