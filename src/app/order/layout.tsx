import Provider from "@/src/util/provider";
import { RiArrowLeftLine } from "@remixicon/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pemesanan",
  description: "Pemesanan barang",
};

export default function OrderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Provider>{children}</Provider>;
}
