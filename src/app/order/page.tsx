"use client";

import {
  RiDiscountPercentLine,
  RiErrorWarningLine,
  RiFileListLine,
  RiCheckboxMultipleLine,
  RiArrowLeftLine,
} from "@remixicon/react";

import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Product from "./product";
import { OrderState, useOrderStore } from "@/src/store/order";
import { useMemo } from "react";
import {
  Customer,
  Product as IProduct,
  Outlet,
  OutletSaleOrder,
  OutletSaleOrderDto,
  OutletSaleOrderItemDto,
} from "@/src/interface";
import { OutletState, useOutletStore } from "@/src/store/outlet";
import { CustomerState, useCustomerStore } from "@/src/store/customer";
import OrderAddress from "./address";
import OrderPaymentMethod from "./payment-method";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { baseUrl } from "@/src/util/services";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

export default function Order() {
  const products: IProduct[] = useOrderStore(
    (state: OrderState) => state.products
  );
  const note: string = useOrderStore((state: OrderState) => state.note);
  const customer: Customer | null = useCustomerStore(
    (state: CustomerState) => state.customer
  );
  const outlet: Outlet | null = useOutletStore(
    (state: OutletState) => state.outlet
  );
  const paymentMethod: string = useOrderStore(
    (state: OrderState) => state.paymentMethod
  );

  const setNote = useOrderStore((state: OrderState) => state.setNote);
  const selectedProducts: { [key: string]: number } = useOrderStore(
    (state: OrderState) => state.selectedProducts
  );

  const productAmount: number = useMemo<number>(() => {
    return Number(
      Object.values(selectedProducts).reduce(
        (acc: number, cur: number) => acc + cur,
        0
      )
    );
  }, [selectedProducts]);

  const totalOrder: number = useMemo(() => {
    return products
      .map<number>((product) => {
        return (
          (product?.sale_price || 0) * (selectedProducts[product?.id] || 0)
        );
      })
      .reduce((acc, cur) => acc + cur, 0);
  }, [selectedProducts]);

  const orderMutation = useMutation<
    AxiosResponse,
    AxiosError<{ message: string }>,
    OutletSaleOrderDto
  >({
    mutationFn: (orderDto: OutletSaleOrderDto) => {
      return axios.post(`${baseUrl}/api/v1/outlet-sale-orders`, {
        ...orderDto,
      });
    },
    onSuccess: (data) => {
      const outletSaleOrder = (data.data?.data ?? null) as OutletSaleOrder;
      handleLoginSuccess(outletSaleOrder);
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Terjadi Kesalahan", {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    },
  });

  const orderItems: OutletSaleOrderItemDto[] = useMemo<
    OutletSaleOrderItemDto[]
  >(() => {
    return products
      .map<OutletSaleOrderItemDto>((product): OutletSaleOrderItemDto => {
        const amount =
          (product?.sale_price || 0) * (selectedProducts[product?.id] || 0);
        return {
          good_id: product.id,
          price: product.sale_price,
          qty: selectedProducts[product?.id] ?? 0,
          note: "",
          amount,
        };
      })
      .filter((orderItem) => (orderItem?.qty ?? 0) > 0);
  }, [selectedProducts]);
  const router = useRouter();

  const handleLoginSuccess = (data: OutletSaleOrder) => {
    router.replace(`/my-order/detail/${data.id}`);
  };

  const now = dayjs();

  const onClickOrder = () => {
    orderMutation.mutate({
      date: now.format("YYYY-MM-DD").toString(),
      subtotal: totalOrder,
      total: totalOrder,
      payment_method: paymentMethod,
      note: note,
      customer_id: customer?.id ?? null,
      outlet_id: outlet?.id ?? null,
      goods: orderItems,
      recipient_name: customer?.name ?? null,
      recipient_phone: customer?.phone ?? null,
      recipient_address: customer?.address ?? null,
    });
  };

  //         'good_id' => $good['id'],
  //         'price' => $good['price'],
  //         'quantity' => $good['qty'],
  //         'amount' => $amount,
  //         'note' => $good['note'] ?? '',

  // const [orderNote, setOrderNote] = useState<string>("");
  // const [paymentMethod, setPaymentMethod] = useState<string>("tunai");

  return (
    <html lang="en" data-theme="lofi">
      <body className="bg-slate-300">
        <div className="bg-slate-100 max-w-screen-sm mx-auto relative">
          <div className="px-4 py-3 shadow-sm text-xl font-semibold bg-white flex justify-between items-center">
            <div className="flex items-center">
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
              {/* {hasHistory ? (
              ) : null} */}
              <div>Pemesanan</div>
            </div>
            {/* <div>
              <button
                className="btn btn-circle btn-ghost"
                onClick={() => {
                  router.push("/my-order");
                }}
              >
                <RiListCheck2 />
              </button>
            </div> */}
          </div>
          <div className="text-sm">
            <OrderAddress />
            <Product />
            <div className="p-4 bg-green-50 border-t border-t-green-200 border-b border-b-green-200">
              <p className="mb-1">Opsi Pengiriman</p>
              <div className="flex justify-between">
                <div className="font-semibold text-sm">Instan</div>
                <div>
                  <div className="badge bg-green-50 me-2 flex border-0">
                    <RiDiscountPercentLine
                      className="text-green-600 me-1"
                      size={12}
                    />
                    <span className="text-xs text-green-600">Gratis</span>
                  </div>
                </div>
              </div>
              <div className="text-xs mb-4">Tiba hari ini atau besok</div>
              <div className="pt-2 text-xs text-green-500">
                <div className="flex">
                  <RiErrorWarningLine size={16} className="me-1" />
                  <p>Waktu pengiriman tergantung pada waktu pemesanan</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-b border-b-slate-100">
              <div className="flex items-center justify-between">
                <div>Catatan</div>
                {/* <div>
                  <div>{JSON.stringify(orderItems)}</div>
                </div> */}
                <div>
                  <input
                    type="text"
                    placeholder="Tinggalkan catatan"
                    className="input input-ghost w-full max-w-xs input-sm text-right"
                    value={note}
                    onChange={(event) => {
                      setNote(event.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-b border-b-slate-100 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  Total Pesanan ({productAmount.toLocaleString("De-de")}{" "}
                  Produk):
                </div>
                <div className="font-semibold text-amber-500">
                  Rp {totalOrder.toLocaleString("De-de")}
                </div>
              </div>
            </div>
            <OrderPaymentMethod />
            <div className="bg-white p-4 mb-2">
              <div className="flex items-center mb-3">
                <div className="me-1">
                  <RiFileListLine className="text-amber-500" size={18} />
                </div>
                <div>Rincian Pembayaran</div>
              </div>
              <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
                <div>Subtotal untuk produk</div>
                <div>Rp {totalOrder.toLocaleString("De-de")}</div>
              </div>
              <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
                <div>Subtotal pengiriman</div>
                <div>Rp 0</div>
              </div>
              <div className="flex items-center justify-between text-base">
                <div>Total Pembayaran</div>
                <div>Rp {totalOrder.toLocaleString("De-de")}</div>
              </div>
            </div>
            <div className="bg-white flex p-4 w-full">
              <div>
                <RiCheckboxMultipleLine size={16} className="text-amber-500" />
              </div>
              <div className="ps-2">
                <p className="text-xs">
                  Dengan melanjutkan, saya setuju dengan Syarat dan Ketentuan
                  yang berlaku
                </p>
              </div>
            </div>
            <div className="py-2"></div>
            <div className="sticky bottom-0 left-0 right-0">
              <div className="bg-white flex shadow-sm items-center justify-between">
                <div className="px-4 py-2 text-end w-3/5">
                  <div className="text-gray-400 text-xs">Total Pembayaran</div>
                  <div className="font-semibold text-amber-500 text-base">
                    Rp {totalOrder.toLocaleString("De-de")}
                  </div>
                </div>
                <div className="self-stretch w-2/5">
                  <button
                    className="btn bg-amber-500 text-white hover:bg-amber-600 h-full w-full"
                    disabled={orderMutation.isPending}
                    onClick={() => {
                      onClickOrder();
                    }}
                  >
                    {orderMutation.isPending ? (
                      <span className="loading loading-spinner"></span>
                    ) : null}
                    Buat Pesanan
                  </button>
                </div>
              </div>
              {/* <div className="absolute top-0 left-0 w-full h-2 shadow-[0px_-2px_3px_rgba(0,0,0,0.2)]"></div> */}
            </div>
            <ToastContainer
              position="bottom-center"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Slide}
            />
          </div>
        </div>
      </body>
    </html>
  );
}
