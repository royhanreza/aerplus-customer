// "use client";

import Provider from "@/src/util/provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pesanan Saya",
  description: "Pesanan Saya",
};

export default function MyOrderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Provider>{children}</Provider>;
}
