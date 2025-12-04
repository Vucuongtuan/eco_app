"use client";

import { createReview } from "@/service/actions";
import { useTranslations } from "next-intl";
import { ClipboardEvent, DragEvent, useRef, useState } from "react";

interface ReviewFormProps {
  userId: string;
  productId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ userId, productId, onSuccess }: ReviewFormProps) {
  const t = useTranslations("review");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_IMAGES = 5;

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (images.length + newFiles.length > MAX_IMAGES) {
      setError(t("error.maxImages", { max: MAX_IMAGES }));
      setTimeout(() => setError(""), 3000);
      return;
    }

    const newPreviews: string[] = [];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      const dt = new DataTransfer();
      imageFiles.forEach(file => dt.items.add(file));
      handleFileSelect(dt.files);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError(t("error.ratingRequired"));
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const mediaIds: string[] = [];
      
      if (images.length > 0) {
        for (const image of images) {
          const formData = new FormData();
          formData.append("file", image);
          
          const response = await fetch("/api/upload-media", {
            method: "POST",
            body: formData,
          });
          
          if (!response.ok) throw new Error(t("error.uploadFailed"));
          
          const data = await response.json();
          mediaIds.push(data.id);
        }
      }

      await createReview({
        userId,
        productId,
        rating,
        comment: comment.trim(),
        mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
      });
      
      setSuccess(true);
      setRating(0);
      setComment("");
      setImages([]);
      setImagePreviews([]);
      
      if (onSuccess) onSuccess();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || t("error.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = {
    1: t("ratingLabels.1"),
    2: t("ratingLabels.2"),
    3: t("ratingLabels.3"),
    4: t("ratingLabels.4"),
    5: t("ratingLabels.5")
  };

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl focus:outline-none transition-transform hover:scale-110"
              >
                <span className={star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-200"}>
                  ★
                </span>
              </button>
            ))}
          </div>
          {(hoverRating > 0 || rating > 0) && (
            <span className="text-sm font-medium text-gray-600 animate-in fade-in">
              {ratingLabels[(hoverRating || rating) as keyof typeof ratingLabels]}
            </span>
          )}
        </div>

        {/* Input Area */}
        <div 
          className={`relative group bg-white rounded-xl border transition-all duration-200 ${
            isDragging ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 focus-within:border-gray-400 focus-within:shadow-sm'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onPaste={handlePaste}
            rows={3}
            className="w-full pl-4 pr-4 py-3 bg-transparent border-none focus:ring-0 resize-none text-sm placeholder:text-gray-400"
            placeholder={t("placeholder")}
          />

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group/image w-16 h-16">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border border-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white rounded-full opacity-0 group-hover/image:opacity-100 transition-all flex items-center justify-center text-xs shadow-sm hover:scale-110"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-50 bg-gray-50/50 rounded-b-xl">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title={t("uploadImage")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
              <span className="text-xs text-gray-400 hidden sm:inline-block">
                {t("maxImages", { max: MAX_IMAGES })}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (rating === 0 && !comment)}
              className="px-4 py-1.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {/* Messages */}
        {error && (
          <div className="text-sm text-red-600 animate-in fade-in">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-600 animate-in fade-in">
            ✨ {t("success")}
          </div>
        )}
        
      </form>
    </div>
  );
}
