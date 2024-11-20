"use client";
import {
  RiCheckboxCircleLine,
  RiShoppingBag4Fill,
  RiContrastDrop2Fill,
  RiArrowLeftLine,
  RiPhoneLine,
} from "@remixicon/react";
import Link from "next/link";

export default function EditAddress() {
  return (
    <html lang="en" data-theme="lofi">
      <body className="bg-slate-300">
        <div className="bg-slate-100 min-h-dvh max-w-screen-sm mx-auto">
          <div className="bg-white shadow-sm">
            <div className="px-4 py-3 text-xl font-semibold flex items-center">
              <div className="me-2">
                <button className="btn btn-circle btn-ghost">
                  <RiArrowLeftLine />
                </button>
              </div>
              <div>Ubah Alamat</div>
            </div>
          </div>
          <div className="text-sm p-2">
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="mb-3">
                <label htmlFor="" className="block mb-2 font-medium">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Nama Penerima"
                  className="input input-bordered w-full input-sm"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="" className="block mb-2 font-medium">
                  No. Handphone Penerima
                </label>
                <label className="input input-bordered flex items-center gap-2 input-sm">
                  {/* <RiPhoneLine /> */}
                  <div>+62</div>
                  <input
                    type="number"
                    className="grow"
                    placeholder="12345678"
                  />
                </label>
              </div>
              <div className="mb-3">
                <label htmlFor="" className="block mb-2 font-medium">
                  Alamat
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Masukkan Alamat"
                ></textarea>
              </div>
              <div>
                <button className="btn bg-amber-500 text-white w-full rounded-md">
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
