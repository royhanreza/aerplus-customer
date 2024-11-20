import {
  OutletSaleOrder,
  OutletSaleOrderPayTransferDto,
  SuccessResponse,
} from "@/src/interface";
import { useCustomerStore } from "@/src/store/customer";
import { baseUrl } from "@/src/util/services";
import { formatFileSize } from "@/src/util/util";
import {
  RiCheckLine,
  RiCloseLine,
  RiFileCopy2Line,
  RiImageAddLine,
} from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Payment({
  orderId,
  onSuccessPayment,
}: {
  orderId: number;
  onSuccessPayment: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [uploadProofOfPaymentLoading, setUploadProofOfPaymentLoading] =
    useState(false);

  const customer = useCustomerStore((state) => state.customer);

  const onClickCopyBankAccountNumber = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
    });
  };

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    setUploadProofOfPaymentLoading(true);
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setSelectedFile(file);

    const objectUrl = await createObjectUrl(file);
    setSelectedImage(objectUrl);
    setUploadProofOfPaymentLoading(false);
  };

  const createObjectUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // Membuat URL sementara untuk preview gambar
      const imageUrl = URL.createObjectURL(file);
      resolve(imageUrl);
    });
  };

  useEffect(() => {
    const clipboardTimeout = setTimeout(() => {
      setCopied(false);
    }, 500);

    return () => {
      clearTimeout(clipboardTimeout);
    };
  }, [copied]);

  const payTransferMutation = useMutation<
    AxiosResponse<SuccessResponse<OutletSaleOrder>>,
    AxiosError<{ message: string }>,
    OutletSaleOrderPayTransferDto
  >({
    mutationFn: (data: OutletSaleOrderPayTransferDto) => {
      const formData = new FormData();
      formData.append("file", data.file ?? "");
      formData.append("file_name", (data.file_name ?? "").toString());
      formData.append("file_size", (data.file_size ?? "").toString());
      formData.append("paid_by", (data.paid_by ?? "").toString());
      return axios.post(
        `${baseUrl}/api/v1/outlet-sale-orders/${orderId}/pay-transfer`,
        formData
      );
    },
    onSuccess: (data) => {
      const successMessage = data.data.message;
      toast.success(successMessage);
      onSuccessPayment();
      // window.location.reload();
      // const outletSaleOrder = (data.data?.data ?? null) as OutletSaleOrder;
      // handleLoginSuccess(outletSaleOrder);
    },
    onError: (error) => {
      const errorMessage = error.response?.data.message ?? "Terjadi kesalahan";
      toast.error(errorMessage);
    },
  });

  const onClickPay = () => {
    payTransferMutation.mutate({
      file: selectedFile,
      file_name: selectedFile?.name ?? "",
      file_size: selectedFile?.size ?? "",
      paid_by: customer?.id ?? "",
    });
  };

  return (
    <div>
      <div className="badge bg-blue-100 border-none rounded mb-3">
        <span className="text-xs text-blue-600">Transfer Manual</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center mb-5">
          <div>
            <Image
              src={`/bca-logo.png`}
              alt="Logo BCA"
              width={60}
              height={60}
            />
          </div>
          <div className="ps-5">
            <p className="font-semibold">Bank BCA</p>
            <div className="flex items-center">
              <p className="font-bold text-lg my-1 me-3">4910-5150-26</p>
              <div>
                {copied ? (
                  <RiCheckLine className="text-green-500" />
                ) : (
                  <RiFileCopy2Line
                    onClick={() => {
                      onClickCopyBankAccountNumber("4910515026");
                    }}
                    className="cursor-pointer"
                  />
                )}
              </div>
            </div>
            <p className="font-medium text-sm text-gray-500">
              a/n TJHIN YIE FANG
            </p>
          </div>
        </div>
        {/* <div className="badge bg-blue-100 border-none rounded">
          <span className="text-xs text-blue-600">Transfer Manual</span>
        </div> */}
      </div>
      {!selectedImage ? (
        <div className="mb-3">
          <label
            htmlFor="transfer-proof"
            className="rounded-lg border-2 border-slate-300 bg-slate-50 border-dashed flex flex-col justify-center items-center py-10"
          >
            {uploadProofOfPaymentLoading ? (
              <div>
                <span className="loading loading-spinner loading-lg text-slate-400"></span>
              </div>
            ) : (
              <div className="mb-1">
                <RiImageAddLine className="text-slate-400" />
              </div>
            )}
            <div className="text-center">
              <span className="text-slate-400 text-sm">
                Upload Bukti Transfer
              </span>
            </div>
          </label>
          <input
            type="file"
            id="transfer-proof"
            className="h-0 w-0 hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      ) : null}
      {selectedImage != null && selectedImage != "" ? (
        <>
          <div className="flex border border-slate-200 rounded overflow-hidden mb-3">
            <div
              className="bg-slate-50"
              style={{ width: "120px", height: "120px" }}
            >
              <Image
                src={selectedImage}
                alt="Bukti Pembayaran"
                width={100}
                height={100}
                objectFit="cover"
                className="w-full h-full object-cover"
                // className="object-cover"
              />
            </div>
            <div className="px-3 py-2 flex justify-between items-center flex-1">
              <div>
                <p className="text-xs font-semibold">{selectedFile?.name}</p>
                <p className="text-xs font-semibold text-slate-500">
                  {formatFileSize(selectedFile?.size)}
                </p>
              </div>
              <div className="text-end">
                <button
                  className="btn btn-circle btn-ghost"
                  onClick={() => {
                    setSelectedImage("");
                  }}
                >
                  <RiCloseLine className="text-slate-300" />
                </button>
              </div>
            </div>
          </div>

          <button
            className="btn bg-blue-500 text-white rounded-md w-full hover:bg-blue-700"
            onClick={() => {
              onClickPay();
            }}
            disabled={payTransferMutation.isPending}
          >
            {payTransferMutation.isPending ? (
              <span className="loading loading-spinner"></span>
            ) : null}
            Bayar
          </button>
        </>
      ) : null}

      {/* <div className="mb-3">
        <div className="flex flex-col items-center">
          <RiSecurePaymentFill />
          <div className="text-center">
            <p>Pembayaran Ke:</p>
            <p className="font-semibold mb-2">BANK BCA a.n. TJHIN YIE FANG</p>
            <div className="text-lg font-bold flex justify-center">
              <p className="me-2">4910-5150-26</p>
              {copied ? (
                <RiCheckLine className="text-green-500" />
              ) : (
                <RiFileCopy2Line
                  onClick={() => {
                    onClickCopyBankAccountNumber("4910515026");
                  }}
                  className="cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
