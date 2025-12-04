"use client";

import React, { useState } from "react";

export default function ReplyForm({
  parentId,
  onReply,
}: {
  parentId: string;
  onReply?: (id: string, text: string) => void;
}) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      // call parent handler if provided; otherwise consumer can hook into API
      if (onReply) await onReply(parentId, text.trim());
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-gray-200 p-2 text-sm"
        placeholder="Viết trả lời..."
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1 text-sm rounded-md border border-gray-200 bg-transparent disabled:opacity-60"
        >
          {isSubmitting ? "Đang gửi..." : "Gửi trả lời"}
        </button>
      </div>
    </form>
  );
}
