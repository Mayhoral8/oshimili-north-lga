const validateImageDimensions = (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > maxWidth || img.height > maxHeight) {
          reject(
            new Error(
              `Image dimensions (${img.width}x${img.height}) exceed the maximum allowed (${maxWidth}x${maxHeight})`
            )
          );
        } else {
          resolve();
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};