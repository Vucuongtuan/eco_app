"use client";

export default function ReviewFilter({
  rating,
  onChangeRating,
  search,
  onSearchChange,
}: {
  rating: number | null;
  onChangeRating: (r: number | null) => void;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 items-center mb-3">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Tìm theo nội dung..."
        className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm"
      />

      <select
        value={rating ?? ""}
        onChange={(e) =>
          onChangeRating(e.target.value ? Number(e.target.value) : null)
        }
        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
      >
        <option value="">Tất cả</option>
        <option value="5">5 sao</option>
        <option value="4">4 sao trở lên</option>
        <option value="3">3 sao trở lên</option>
        <option value="2">2 sao trở lên</option>
        <option value="1">1 sao trở lên</option>
      </select>
    </div>
  );
}
