"use client";

import { Media as MediaType } from "@/payload-types";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Media } from "../Media";
import ReplyForm from "./ReplyForm";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex text-yellow-400 text-xs gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "text-yellow-400" : "text-gray-200"}>
          ★
        </span>
      ))}
    </div>
  );
};

export default function ReviewItem({
  review,
  onReply,
}: {
  review: any;
  onReply?: (id: string, text: string) => void;
}) {
  const t = useTranslations("review");
  const [showReply, setShowReply] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MediaType | null>(null);
  const userName = review.user?.name || review.user?.email || t("guest");
  const userInitials = getInitials(userName);

  return (
    <>
      <div className="py-6 border-b border-gray-50 last:border-0 animate-in fade-in duration-500">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-semibold tracking-wider shrink-0">
            {userInitials}
          </div>

          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{userName}</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(review.createdAt || review.updatedAt || Date.now()).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {review.rating && <StarRating rating={review.rating} />}
            </div>

            {/* Content */}
            <div className="text-gray-600 text-sm leading-relaxed">
              {review.comment}
            </div>

            {/* Media */}
            {review.media && review.media.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {review.media.map((m: MediaType) => (
                  <div 
                    className="w-20 h-20 relative rounded-lg overflow-hidden border border-gray-100 cursor-zoom-in hover:opacity-90 transition-opacity" 
                    key={m.id}
                    onClick={() => setSelectedImage(m)}
                  >
                    <Media resource={m} imgSize="thumbnail" fClassName="object-cover w-full h-full" fill />
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="pt-1">
              <button
                className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1.5"
                onClick={() => setShowReply((s) => !s)}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 17l-5-5 5-5" />
                  <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                </svg>
                {t("reply")}
              </button>
            </div>

            {showReply && (
              <div className="mt-3">
                <ReplyForm parentId={review.id} onReply={onReply} />
              </div>
            )}

            {/* Replies */}
            {review.replies && review.replies.length > 0 && (
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100">
                {review.replies.map((reply: any) => {
                   const replyUserName = reply.user?.name || reply.user?.email || t("guest");
                   return (
                    <div key={reply.id} className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 text-[10px] font-semibold tracking-wider shrink-0">
                          {getInitials(replyUserName)}
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-medium text-gray-900">{replyUserName}</span>
                             <span className="text-xs text-gray-400">
                                {new Date(reply.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                             </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{reply.comment}</p>
                       </div>
                    </div>
                   );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <button 
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 z-10"
              onClick={() => setSelectedImage(null)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Media 
                resource={selectedImage} 
                fill
                imgClassName="object-contain"
                htmlElement={null}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
