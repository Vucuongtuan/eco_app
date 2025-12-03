"use client";

import { Media as MeidaType } from "@/payload-types";
import { useState } from "react";
import { Media } from "../Media";
import ReplyForm from "./ReplyForm";

export default function ReviewItem({
  review,
  onReply,
}: {
  review: any;
  onReply?: (id: string, text: string) => void;
}) {
  const [showReply, setShowReply] = useState(false);

 console.log({review});
  return (
    <div className="py-3 border-b border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-gray-800">
            {review.user?.name || review.user?.email || "Khách"}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(
              review.createdAt || review.updatedAt || Date.now()
            ).toLocaleDateString()}
          </div>
          <div className="flex gap-4 flex-wrap ">
            {review.media && review.media.map((m :MeidaType) => (
              <div className="w-18 h-18 relative" key={m.id}>
                <Media resource={m} imgSize="small" fClassName="aspect-[1/1]" fill  />
              </div>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-700">
          {review.rating ? `${review.rating} ★` : ""}
        </div>
      </div>

      <div className="mt-2 text-gray-700 text-sm">
        {review.comment}
      </div>

      <div className="mt-2">
        <button
          className="text-sm text-gray-600 hover:underline"
          onClick={() => setShowReply((s) => !s)}
        >
          Reply
        </button>
      </div>

      {showReply && <ReplyForm parentId={review.id} onReply={onReply} />}

      {/* Display replies */}
      {review.replies && review.replies.length > 0 && (
        <div className="ml-8 mt-3 space-y-3 border-l-2 border-gray-200 pl-4">
          {review.replies.map((reply: any) => (
            <div key={reply.id} className="text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-gray-800">
                    {reply.user?.name || reply.user?.email || "Khách"}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(
                      reply.createdAt || reply.updatedAt || Date.now()
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mt-1 text-gray-700">
                {reply.comment}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
