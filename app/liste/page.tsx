import type { Metadata } from "next";
import { SoruAkisi } from "@/components/akis/SoruAkisi";

export const metadata: Metadata = {
  title: "Listemi oluştur",
  alternates: { canonical: "/liste" },
};

export default function ListePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <SoruAkisi />
    </div>
  );
}
