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
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Customer,
  Product as IProduct,
  Outlet,
  OutletSaleOrder,
  OutletSaleOrderDto,
  OutletSaleOrderItemDto,
  Member,
  Voucher,
  MemberValidationResponse,
} from "@/src/interface";
import { OutletState, useOutletStore } from "@/src/store/outlet";
import { CustomerState, useCustomerStore } from "@/src/store/customer";
import OrderAddress from "./address";
import OrderPaymentMethod from "./payment-method";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { baseUrl, qyubitApiUrl } from "@/src/util/services";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { formatPhoneNumber, getAppStoreLink } from "@/src/util/util";

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

  const [getMemberLoading, setGetMemberLoading] = useState(false);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [membershipChecked, setMembershipChecked] = useState(false);

  const getMember = useCallback(
    async (isMounted: boolean) => {
      console.log("fetching member");
      console.log(customer?.phone);
      const formattedPhoneNumber = formatPhoneNumber(customer?.phone ?? "");
      try {
        if (isMounted) setGetMemberLoading(true);
        const response = await axios.post(
          `${qyubitApiUrl}/api/order/validate`,
          {
            phone_number: formattedPhoneNumber,
            voucher_code: "",
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const data: MemberValidationResponse = response.data.data;
        console.log(data);
        if (isMounted) {
          setVoucher(data?.benefit || null);
          setMember(data?.member || null);
          setGetMemberLoading(false);
          setMembershipChecked(true);
        }
      } catch (error) {
        console.log(error);
        if (isMounted) {
          setVoucher(null);
          setMember(null);
          setGetMemberLoading(false);
          setMembershipChecked(true);
        }
      }
    },
    [customer?.phone]
  );

  useEffect(() => {
    let isMounted = true;

    if (customer?.phone) {
      getMember(isMounted);
    }

    return () => {
      isMounted = false;
    };
  }, [customer?.phone, getMember]);

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
          (product?.customer_product_sale_price || 0) *
          (selectedProducts[product?.id] || 0)
        );
      })
      .reduce((acc, cur) => acc + cur, 0);
  }, [selectedProducts, products]);

  const discountAmount: number = useMemo(() => {
    if (!voucher || !member) return 0;

    if (voucher.type === "item") {
      // Discount per item per quantity
      return products
        .map<number>((product) => {
          if (product.sale_price == 0) {
            return 0;
          }
          const quantity = selectedProducts[product?.id] || 0;
          return voucher.value * quantity;
        })
        .reduce((acc, cur) => acc + cur, 0);
    } else if (voucher.type === "transaction") {
      // Discount per transaction (total)
      return voucher.value;
    }

    return 0;
  }, [voucher, member, selectedProducts, products]);

  const finalTotal: number = useMemo(() => {
    return Math.max(0, totalOrder - discountAmount);
  }, [totalOrder, discountAmount]);

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
          price: product.customer_product_sale_price,
          qty: selectedProducts[product?.id] ?? 0,
          note: "",
          amount,
        };
      })
      .filter((orderItem) => (orderItem?.qty ?? 0) > 0);
  }, [selectedProducts, products]);
  const router = useRouter();

  const handleLoginSuccess = (data: OutletSaleOrder) => {
    router.replace(`/my-order/detail/${data.id}`);
  };

  const now = dayjs();

  const onClickOrder = () => {
    orderMutation.mutate({
      date: now.format("YYYY-MM-DD").toString(),
      subtotal: totalOrder,
      discount: discountAmount,
      total: finalTotal,
      payment_method: paymentMethod,
      note: note,
      customer_id: customer?.id ?? null,
      outlet_id: outlet?.id ?? null,
      goods: orderItems,
      recipient_name: customer?.name ?? null,
      recipient_phone: customer?.phone ?? null,
      recipient_address: customer?.address ?? null,
      recipient_address_latitude: customer?.latitude ?? null,
      recipient_address_longitude: customer?.longitude ?? null,
      member: member ? JSON.stringify(member) : null,
      voucher: voucher ? JSON.stringify(voucher) : null,
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

            {/* Member Section */}
            {getMemberLoading && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-t-blue-200 border-b border-b-indigo-200">
                <div className="flex items-center justify-center">
                  <div className="flex items-center">
                    <div className="loading loading-spinner loading-sm me-3"></div>
                    <div className="text-sm font-medium text-blue-700">
                      Memeriksa keanggotaan Sahabat Aerplus...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {membershipChecked && member && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-t-purple-200 border-b border-b-blue-200 relative overflow-hidden shadow-lg">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12 animate-shimmer"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 animate-shimmer-delayed"></div>

                {/* Sparkle Effects */}
                <div className="absolute top-2 right-4 text-yellow-400 animate-sparkle">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div
                  className="absolute top-6 left-6 text-yellow-300 animate-sparkle"
                  style={{ animationDelay: "0.5s" }}
                >
                  <svg
                    className="w-2 h-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div
                  className="absolute bottom-4 right-8 text-yellow-200 animate-sparkle"
                  style={{ animationDelay: "1s" }}
                >
                  <svg
                    className="w-2.5 h-2.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center me-3">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-700 text-sm">
                        Member Sahabat Aerplus
                      </div>
                      <div className="text-xs text-purple-600">
                        Selamat datang kembali, {member?.user_name || "Sahabat"}
                        !
                      </div>
                    </div>
                  </div>
                  <div className="badge bg-purple-100 text-purple-700 border-0">
                    <svg
                      className="w-3 h-3 me-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </div>
                </div>

                {voucher && (
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center me-2">
                          <RiDiscountPercentLine
                            className="text-green-600"
                            size={14}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            Benefit Tersedia
                          </div>
                          <div className="text-xs text-gray-600">
                            Manfaat member Sahabat Aerplus
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          Rp {voucher?.value?.toLocaleString("id-ID") || "0"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {voucher?.type === "item"
                            ? "Diskon per item"
                            : voucher?.type === "transaction"
                            ? "Diskon per transaksi"
                            : "Member Benefit"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-2 text-xs text-purple-600">
                  <div className="flex items-center">
                    <svg
                      className="w-3 h-3 me-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Nikmati keuntungan eksklusif sebagai member
                  </div>
                </div>
              </div>
            )}

            {membershipChecked && !member && (
              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-t border-t-orange-200 border-b border-b-red-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center me-3">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-orange-700 text-sm">
                        Belum Terdaftar Member
                      </div>
                      <div className="text-xs text-orange-600">
                        Anda belum memiliki keanggotaan Sahabat Aerplus
                      </div>
                    </div>
                  </div>
                  <div className="badge bg-orange-100 text-orange-700 border-0">
                    <svg
                      className="w-3 h-3 me-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Non-Member
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-orange-200 mb-3">
                  <div className="text-sm font-medium text-gray-800 mb-2">
                    💔 Manfaat yang Terlewatkan:
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <svg
                        className="w-3 h-3 me-2 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Diskon eksklusif untuk setiap pembelian
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg
                        className="w-3 h-3 me-2 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Poin reward untuk setiap transaksi
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg
                        className="w-3 h-3 me-2 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Akses ke promo khusus member
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg
                        className="w-3 h-3 me-2 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Prioritas layanan pelanggan
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium text-orange-700 mb-2">
                    🎉 Daftar Sekarang dan Dapatkan Manfaatnya!
                  </div>
                  <a
                    href={getAppStoreLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg
                      className="w-4 h-4 me-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Download Aplikasi Sahabat Aerplus
                  </a>
                </div>

                <div className="mt-3 text-xs text-orange-600 text-center">
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-3 h-3 me-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Gratis dan mudah untuk bergabung!
                  </div>
                </div>
              </div>
            )}

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
                  Rp {finalTotal.toLocaleString("De-de")}
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
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-green-600 text-xs mb-1">
                  <div className="flex items-center">
                    <RiDiscountPercentLine className="me-1" size={12} />
                    <span>
                      Diskon{" "}
                      {voucher?.type === "item" ? "per item" : "per transaksi"}
                    </span>
                  </div>
                  <div>-Rp {discountAmount.toLocaleString("De-de")}</div>
                </div>
              )}
              <div className="flex items-center justify-between text-base">
                <div>Total Pembayaran</div>
                <div>Rp {finalTotal.toLocaleString("De-de")}</div>
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
                    Rp {finalTotal.toLocaleString("De-de")}
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
