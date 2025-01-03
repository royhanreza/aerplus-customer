// "use client";

import Provider from "@/src/util/provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ubah Lokasi",
  description: "Ubah Lokasi Saya",
};

export default function EditLocationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Provider>{children}</Provider>;
}
