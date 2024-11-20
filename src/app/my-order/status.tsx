import {
  RiCheckboxCircleLine,
  RiHourglassLine,
  RiInstanceLine,
  RiTruckLine,
} from "@remixicon/react";

export default function Status({
  status,
}: {
  status: string | null | undefined;
}) {
  if (status == "pending") {
    return (
      <div className="badge bg-lime-100 border-none rounded">
        <RiInstanceLine className="text-lime-600 me-1" size={12} />
        <span className="text-xs text-lime-600">Menunggu Dikirim</span>
      </div>
    );
  } else if (status == "waiting_payment") {
    return (
      <div className="badge bg-amber-100 border-none rounded">
        <RiHourglassLine className="text-amber-600 me-1" size={12} />
        <span className="text-xs text-amber-600">Menunggu Pembayaran</span>
      </div>
    );
  } else if (status == "deliver") {
    return (
      <div className="badge bg-blue-100 border-none rounded">
        <RiTruckLine className="text-blue-600 me-1" size={12} />
        <span className="text-xs text-blue-600">Dikirim</span>
      </div>
    );
  } else if (status == "finish") {
    return (
      <div className="badge bg-green-100 border-none rounded">
        <RiCheckboxCircleLine className="text-green-600 me-1" size={12} />
        <span className="text-xs text-green-600">Selesai</span>
      </div>
    );
  }

  return (
    <div className="badge bg-slate-100 border-none rounded">
      <RiHourglassLine className="text-slate-600 me-1" size={12} />
      <span className="text-xs text-slate-600">Selesai</span>
    </div>
  );
}
