import { RiArrowLeftLine } from "@remixicon/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ubah Alamat",
  description: "Ubah Alamat",
};

export default function EditAddressLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
