import Provider from "@/src/util/provider";
import { RiArrowLeftLine } from "@remixicon/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pesanan Saya",
  description: "Pesanan Saya",
};

export default function OrderDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Provider>{children}</Provider>;
}
