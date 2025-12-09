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
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating Stars - Minimalist */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl focus:outline-none transition-opacity hover:opacity-80"
              >
                <span className={star <= (hoverRating || rating) ? "text-yellow-500" : "text-gray-300"}>
                  ★
                </span>
              </button>
            ))}
          </div>
          {(hoverRating > 0 || rating > 0) && (
            <span className="text-sm text-text-secondary">
              {ratingLabels[(hoverRating || rating) as keyof typeof ratingLabels]}
            </span>
          )}
        </div>

        {/* Input Area - Minimalist */}
        <div 
          className={`relative bg-white border rounded-sm transition-colors ${
            isDragging ? 'border-text-secondary' : 'border-border focus-within:border-text-secondary'
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
            rows={4}
            className="w-full px-4 py-3 bg-transparent border-none focus:outline-none resize-none text-sm text-text-primary placeholder:text-text-muted"
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

          {/* Toolbar - Minimalist */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-light">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors underline"
              title={t("uploadImage")}
            >
              {t("addImageButton", { current: images.length, max: MAX_IMAGES })}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (rating === 0 && !comment)}
              className="px-5 py-2 bg-text-primary text-white text-sm rounded-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
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

        {/* Messages - Simple */}
        {error && (
          <div className="text-sm text-error">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-success">
            {t("success")}
          </div>
        )}
        
      </form>
    </div>
  );
}
