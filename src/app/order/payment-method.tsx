import { useOrderStore } from "@/src/store/order";
import { RiMoneyDollarCircleLine } from "@remixicon/react";

export default function OrderPaymentMethod() {
  const paymentMethod: string = useOrderStore(
    (state: any) => state.paymentMethod
  );

  const setPaymentMethod = useOrderStore(
    (state: any) => state.setPaymentMethod
  );

  return (
    <div className="bg-white mb-2">
      <div className="flex items-center p-4 border-b border-b-slate-100">
        <div className="me-1">
          <RiMoneyDollarCircleLine className="text-amber-500" size={20} />
        </div>
        <div>Metode Pembayaran</div>
      </div>
      <div className="p-4 flex space-x-4">
        <label
          className={`flex box-border items-center px-4 py-6 border rounded-lg cursor-pointer transition-all w-full ${
            paymentMethod == "cash" ? "border-2 border-amber-500" : ""
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="cash"
            className={`radio mr-2 radio-sm checked:bg-amber-500 `}
            onChange={(event) => {
              setPaymentMethod(event.target.value);
            }}
            checked={paymentMethod === "cash"}
          />
          <div className="text-xs">
            <div className="mb-1">Tunai (COD)</div>
            <div className="text-gray-400">Bayar saat terima barang</div>
          </div>
        </label>
        <label
          className={`flex box-border items-center px-4 py-6 border rounded-lg cursor-pointer transition-all 
             w-full ${
               paymentMethod == "transfer" ? "border-2 border-amber-500" : ""
             }`}
        >
          <input
            type="radio"
            name="payment"
            value="transfer"
            className="radio mr-2 radio-sm checked:bg-amber-500"
            onChange={(event) => {
              setPaymentMethod(event.target.value);
            }}
            checked={paymentMethod === "transfer"}
          />
          <div className="text-xs">
            <div className="mb-1">Transfer</div>
            <div className="text-gray-400">Bayar melalui transfer bank</div>
          </div>
        </label>
      </div>
      {/* <div className="mb-3">
                <div role="alert" className="alert alert-warning rounded-none">
                  <RiSecurePaymentFill />
                  <div>
                    <p>Pembayaran Ke:</p>
                    <p className="font-semibold mb-2">
                      BANK BCA a.n. TJHIN YIE FANG
                    </p>
                    <div className="text-lg font-bold flex justify-center md:justify-start">
                      <p className="me-2">4910-5150-26</p>
                      <RiFileCopy2Line
                        onClick={() => {
                          onClickCopyBankAccountNumber("4910515026");
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pb-4 px-4">
                <label
                  htmlFor="transfer-proof"
                  className="rounded-lg border-2 border-amber-500 border-dashed flex flex-col justify-center items-center py-10"
                >
                  <div className="mb-1">
                    <RiImageAddLine className="text-amber-500" />
                  </div>
                  <div className="text-center">
                    <span className="text-amber-500">
                      Upload Bukti Transfer
                    </span>
                  </div>
                </label>
                <input
                  type="file"
                  id="transfer-proof"
                  className="h-0 w-0 hidden"
                />
              </div> */}
    </div>
  );
}
