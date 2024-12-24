"use client";

import {
  RiArrowLeftLine,
  RiMapPinLine,
  RiLogoutCircleLine,
  RiMap2Line,
} from "@remixicon/react";

import "react-toastify/dist/ReactToastify.css";
import { Customer } from "@/src/interface";
import { CustomerState, useCustomerStore } from "@/src/store/customer";
import { useRouter } from "next/navigation";

export default function MyProfile() {
  const customer: Customer | null = useCustomerStore(
    (state: CustomerState) => state.customer
  );

  const router = useRouter();

  const clearCookies = () => {
    // Mengatur cookie expired dengan tanggal masa lalu
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    // Tambahkan cookie lain yang perlu dihapus dengan format yang sama
  };

  const onClickLogout = async () => {
    try {
      // 1. Hapus cookie
      clearCookies();
      // 3. Refresh router untuk memastikan state terupdate
      router.refresh();

      // 4. Redirect ke halaman login
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <html lang="en" data-theme="lofi">
      <body className="bg-slate-300">
        <div className="bg-slate-100 max-w-screen-sm mx-auto relative min-h-dvh">
          <div className="px-4 py-3 text-xl font-semibold flex items-center justify-between">
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
              <div>Profil Saya</div>
            </div>
            <div>
              <button
                className="btn btn-circle btn-ghost"
                onClick={() => {
                  onClickLogout();
                }}
              >
                <RiLogoutCircleLine />
              </button>
            </div>
          </div>
          <div className="text-sm">
            <div className="p-4 bg-amber-300">
              <div className="flex items-center">
                <div className="avatar">
                  <div className="w-14 rounded-full">
                    <img src="https://img.freepik.com/premium-psd/3d-render-avatar-character_23-2150611743.jpg" />
                  </div>
                </div>
                <div className="ps-3">
                  <p className="text-lg font-bold mb-1">{customer?.name}</p>
                  <p className="bg-gradient-to-r from-cyan-500 to-cyan-400 px-3 py-1 text-xs rounded text-white font-medium">
                    0 Poin
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-b border-b-slate-100 mb-2 text-xs">
              <div className="flex items-center justify-between">
                <div>No. Handphone:</div>
                <div className="font-semibold">{customer?.phone}</div>
              </div>
            </div>
            <div className="bg-white mb-2">
              <div className="flex items-center p-4 border-b border-b-slate-100">
                <div className="me-1">
                  <RiMap2Line className="text-amber-500" size={20} />
                </div>
                <div>Alamat Kirim</div>
              </div>
              <div className="p-4 flex space-x-4 text-xs">
                <p>{customer?.address}</p>
              </div>
            </div>
            <div className="bg-white mb-2">
              <div className="flex items-center p-4 border-b border-b-slate-100">
                <div className="me-1">
                  <RiMapPinLine className="text-amber-500" size={20} />
                </div>
                <div>Titik Kirim</div>
              </div>
              <div className="p-4 text-xs">
                <div className="mb-4">
                  <img
                    src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+FF0000(${customer?.longitude},${customer?.latitude}),pin-m+0000FF(${customer?.longitude},${customer?.latitude})/${customer?.longitude},${customer?.latitude},18,0/1200x800?access_token=pk.eyJ1Ijoia2l0dG9rYXR0byIsImEiOiJja2t5eTducm4wYmhwMnFwNXI4ejA4cGhuIn0.xoSKS41bJtuetZ8v5p_aiQ`}
                    alt="Lokasi Customer"
                    className="rounded-sm"
                  />
                </div>
                <button
                  className="btn btn-primary w-full"
                  onClick={() => {
                    router.push("/my-profile/edit-location");
                  }}
                >
                  Ubah Titik
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
