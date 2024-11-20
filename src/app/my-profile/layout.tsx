// "use client";

import Provider from "@/src/util/provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saya",
  description: "Saya",
};

export default function MyProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Provider>{children}</Provider>;
}
