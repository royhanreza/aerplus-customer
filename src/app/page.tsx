"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <html lang="en" data-theme="bumblebee">
      <body className="bg-slate-100">
        <div className="w-dvw h-dvh flex justify-center items-center mx-auto max-w-screen-sm">
          <div className="container">
            <div className="hero bg-base-200 min-h-screen">
              <div className="hero-content text-center">
                <div className="max-w-md">
                  <h1 className="text-5xl font-bold text-amber-500">
                    <span className="font-medium">Toko</span>Kita
                  </h1>
                  <div className="pb-6 pt-3">
                    <p className="text-sm">
                      Platform belanja untuk kebutuhan harian yang menawarkan
                      pengalaman belanja praktis, cepat, dan hemat.
                    </p>
                    {/* <p>Masuk untuk mulai pemesanan</p> */}
                  </div>
                  <Link href={"/login"} className="btn btn-secondary w-full">
                    Masuk
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
