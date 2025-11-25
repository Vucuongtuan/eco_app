interface ColorSelectorProps {
  colorVariants: any[];
  selectedColor: any;
  handleColorChange: (colorOption: any) => void;
  selectedGalleryItem: any;
}

export function ColorSelector({
  colorVariants,
  selectedColor,
  handleColorChange,
  selectedGalleryItem,
}: ColorSelectorProps) {
  return (
    <div className="flex flex-col space-y-4 mt-4">
      <div>
        <h4 className="text-sm font-medium mb-3">Colors</h4>
        <div className="flex gap-2">
          {colorVariants.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleColorChange(item.variantOption)}
              className={`w-8 h-8 rounded-full border-2 ${
                selectedGalleryItem?.id === item.id
                  ? "border-blue-500"
                  : "border-gray-300"
              }`}
              style={{
                backgroundColor: (item.variantOption as any)?.value,
              }}
              title={(item.variantOption as any)?.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
