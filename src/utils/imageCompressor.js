/**
 * CivicAI - Client-Side Image Compression Utility
 * 
 * Optimized for mobile cameras (e.g. iQOO 50MP/12MP cameras).
 * Resizes images to max 1280px maintaining aspect ratio and compresses to ~80% JPEG.
 * Reduces 5MB-15MB phone photos to ~150KB-300KB for instant upload and localStorage safety.
 */

export async function compressImage(file, { maxWidth = 800, maxHeight = 800, quality = 0.75 } = {}) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Provided file is not an image.');
  }

  const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Failed to load image for compression.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Render to canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas 2D context.'));
        }

        // Draw and smooth
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to dataURL & Blob
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Failed to create compressed image blob.'));
            }

            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
            const compressedSizeKB = Math.round(compressedFile.size / 1024);

            const sizeFormatted =
              compressedFile.size < 1024 * 1024
                ? `${compressedSizeKB} KB`
                : `${compressedSizeMB} MB`;

            const originalFormatted =
              file.size < 1024 * 1024
                ? `${Math.round(file.size / 1024)} KB`
                : `${originalSizeMB} MB`;

            const savedPercent = Math.max(
              0,
              Math.round(((file.size - compressedFile.size) / file.size) * 100)
            );

            resolve({
              file: compressedFile,
              previewUrl: dataUrl,
              name: compressedFile.name,
              size: sizeFormatted,
              originalSize: originalFormatted,
              savedPercent,
              width,
              height,
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}
