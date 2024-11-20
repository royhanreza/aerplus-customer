import { useCustomerStore } from "@/src/store/customer";
import { useOutletStore } from "@/src/store/outlet";
import { RiMapPinLine, RiTruckLine } from "@remixicon/react";

export default function OrderAddress() {
  const customer = useCustomerStore((state) => state.customer);
  const outlet = useOutletStore((state) => state.outlet);

  return (
    <div className="bg-gradient-to-br from-amber-50 from-10% to-white to-90% w-full mt-2">
      <div className="flex justify-between items-center mb-1">
        <div>
          <div className="flex p-4 w-full">
            <div>
              <RiMapPinLine size={16} className="text-amber-500" />
            </div>
            <div className="ps-2">
              <div className="mb-2 font-semibold">Alamat Pengiriman</div>
              <div className="text-xs">
                <p>
                  {customer?.name} | (+62) {customer?.phone}
                </p>
                <p>{customer?.address}</p>
              </div>
            </div>
          </div>
          <div className="flex p-4 w-full">
            <div>
              <RiTruckLine size={16} className="text-amber-500" />
            </div>
            <div className="ps-2">
              <div className="mb-2 font-semibold">Kirim Dari</div>
              <div className="text-xs">
                <p>
                  Outlet {outlet?.name} | {outlet?.phone}
                </p>
                <p>{outlet?.address}</p>
              </div>
            </div>
          </div>
        </div>
        {/* <div>
            <RiArrowDropRightLine className="text-gray-300" />
          </div> */}
      </div>
      {/* <Link href="/address/edit">
      </Link> */}
      <div className="w-full h-1 bg-[length:20px_20px] bg-[linear-gradient(45deg,_#ef4444_25%,_transparent_25%,_transparent_50%,_#FFD54F_50%,_#FFD54F_75%,_transparent_75%)]"></div>
    </div>
  );
}
