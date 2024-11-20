"use client";

import { Customer, Outlet } from "@/src/interface";
import { useCustomerStore } from "@/src/store/customer";
import { useOutletStore } from "@/src/store/outlet";
import { baseUrl } from "@/src/util/services";
import { RiCloseCircleFill, RiPhoneLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const setCustomer = useCustomerStore((state) => state.setCustomer);
  const setOutlet = useOutletStore((state) => state.setOutlet);

  const loginMutation = useMutation<
    AxiosResponse,
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: (phone: string) => {
      return axios.post(`${baseUrl}/api/v1/customers/auth/login`, {
        phone,
      });
    },
    onSuccess: (data) => {
      const token = "this_is_mock_token"; // Sesuaikan dengan struktur respons server
      const customer = (data?.data?.data ?? null) as Customer;
      const outlet = (customer?.outlet ?? null) as Outlet;
      handleLoginSuccess(token, customer, outlet);
    },
  });

  const handleLoginSuccess = (
    token: string,
    customer: Customer,
    outlet: Outlet
  ) => {
    setCookie("token", token, { maxAge: 60 * 60 * 2, path: "/" });

    setCustomer(customer);
    setOutlet(outlet);

    router.replace("/my-order");
  };

  const onClickLoginButton = () => {
    if (!phoneNumber.toString().trim()) {
      return toast(
        <div className="flex items-center">
          <div className="me-2">
            <RiCloseCircleFill className="text-red-500" />
          </div>
          <div>Nomor handphone harus diisi</div>
        </div>,
        {
          position: "bottom-center",
          autoClose: 500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
          closeButton: false,
        }
      );
    }

    loginMutation.mutate(phoneNumber);
  };

  return (
    <html lang="en" data-theme="bumblebee">
      <body className="bg-slate-100">
        <div className="w-dvw h-dvh p-3 flex justify-center items-center mx-auto max-w-screen-sm">
          <div className="container">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Pemesanan</h2>
                <p>Masukkan nomor handphone untuk melakukan pemesanan</p>
                <div className="my-3">
                  <label className="input input-bordered flex items-center gap-2">
                    <RiPhoneLine />
                    <div>+62</div>
                    <input
                      type="number"
                      className="grow"
                      placeholder="Nomor Handphone"
                      onChange={(event) => setPhoneNumber(event.target.value)}
                    />
                  </label>
                </div>
                {loginMutation.isError ? (
                  <div>
                    <span className="text-sm text-red-500">
                      {loginMutation.error.response?.data.message ||
                        "Terjadi kesalahan"}
                    </span>
                  </div>
                ) : null}

                <div className="card-actions justify-end">
                  <button
                    className="btn btn-accent w-full"
                    onClick={() => {
                      onClickLoginButton();
                    }}
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <span className="loading loading-spinner"></span>
                    ) : null}
                    Masuk
                  </button>
                </div>
              </div>
            </div>
          </div>
          <ToastContainer
            position="bottom-center"
            autoClose={100}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </body>
    </html>
  );
}
