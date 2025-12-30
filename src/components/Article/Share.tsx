"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface ShareProps {
  title: string;
  description: string;
  slug: string;
}

export default function Share({ title, description, slug }: ShareProps) {
  const t = useTranslations("posts");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/${locale}/posts/${slug}`;
      setShareUrl(url);
    }
  }, [slug, locale]);

  const handleShare = async () => {
    if (!shareUrl) return;

    // Kiểm tra nếu trình duyệt hỗ trợ Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
        console.log("Nội dung đã được chia sẻ thành công!");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Lỗi khi chia sẻ:", error);
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Lỗi khi copy link:", error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-3">
      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={!shareUrl}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1f1f1f] bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3569ed] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t("share")}
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden lg:inline">{t("share")}</span>
      </button>

      {/* Copy Link Button (visible only on desktop or when share API not available) */}
      {typeof window !== "undefined" && !navigator.share && (
        <button
          onClick={handleCopyLink}
          disabled={!shareUrl}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1f1f1f] bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3569ed] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t("copyLink")}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="hidden lg:inline text-green-600">
                {t("copied")}
              </span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="hidden lg:inline">{t("copyLink")}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
