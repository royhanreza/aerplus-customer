import { OutletSaleOrderReview } from "@/src/interface";
import { Rating as ReactRating } from "@smastrom/react-rating";
import { useState } from "react";

const ratingDescriptions = [
  "Sangat Buruk",
  "Buruk",
  "OK",
  "Hampir Sempurna",
  "Sempurna",
];

export default function Review({
  orderReview,
  onSendReview,
  isPendingMutation,
}: {
  orderReview: OutletSaleOrderReview | null | undefined;
  onSendReview: ({
    review,
    rating,
  }: {
    review: string | null;
    rating: number;
  }) => void;
  isPendingMutation: boolean;
}) {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");

  return (
    <div className="card bg-base-100 shadow-sm rounded-xl overflow-hidden mb-2">
      <div className="px-4 py-3 flex justify-between items-center text-sm">
        <div className="font-semibold">Penilaian Saya</div>
      </div>
      {orderReview != null ? (
        <div className="card-body text-gray-600 px-4 pt-0 pb-4">
          <div className="flex flex-col items-center">
            <ReactRating
              className="mb-2"
              style={{ maxWidth: 180 }}
              value={orderReview.rating ?? 0}
              readOnly
            />
            {(orderReview.rating ?? -1) > -1 ? (
              <p>{ratingDescriptions[(orderReview.rating ?? -1) - 1]}</p>
            ) : null}
            <div className="bg-slate-50 p-3 rounded mt-3">
              {orderReview.review == null || orderReview.review == "" ? (
                <em className="text-sm">Tidak ada ulasan</em>
              ) : (
                <blockquote className="text-sm text-center">
                  &quot;{orderReview.review}&quot;
                </blockquote>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-body text-gray-600 px-4 pt-0 pb-4">
          <div className="flex flex-col items-center">
            <ReactRating
              className="mb-2"
              style={{ maxWidth: 250 }}
              value={rating}
              onChange={(value: number) => {
                setRating(value);
              }}
            />
            {rating > -1 ? <p>{ratingDescriptions[rating - 1]}</p> : null}
          </div>
          <div>
            <textarea
              className="textarea textarea-bordered w-full rounded"
              placeholder="Tulis Ulasan (Opsional)"
              onChange={(event) => {
                setReview(event.target.value);
              }}
            ></textarea>
          </div>
          <div>
            <button
              className="btn btn-primary w-full"
              onClick={() => {
                onSendReview({ review, rating });
              }}
              disabled={isPendingMutation}
            >
              {isPendingMutation ? (
                <span className="loading loading-spinner"></span>
              ) : null}
              Kirim Ulasan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
