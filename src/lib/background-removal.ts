import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenter: any = null;

function resizeImageIfNeeded(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement
) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const initializeModel = async (
  onProgress?: (progress: number) => void
): Promise<void> => {
  if (segmenter) return;

  console.log('Initializing background removal model...');
  
  segmenter = await pipeline(
    'image-segmentation',
    'Xenova/segformer-b0-finetuned-ade-512-512',
    {
      device: 'webgpu',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      progress_callback: (progressData: any) => {
        if (progressData?.progress && onProgress) {
          onProgress(progressData.progress);
        }
      },
    }
  );
  
  console.log('Model initialized successfully');
};

interface SegmentationResult {
  label?: string;
  mask?: {
    data: number[];
  };
}

export const removeBackground = async (
  imageElement: HTMLImageElement
): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');

    // Initialize model if not already done
    if (!segmenter) {
      await initializeModel();
    }

    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not get canvas context');

    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(
      `Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`
    );

    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');

    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result: SegmentationResult[] = await segmenter(imageData);

    console.log('Segmentation result:', result);

    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid segmentation result');
    }

    // Find the person/subject mask - try different labels
    const subjectLabels = ['person', 'people', 'human', 'face'];
    let subjectMask = result.find((r) =>
      subjectLabels.some((label) => r.label?.toLowerCase().includes(label))
    );

    // If no person found, use the first non-background result
    if (!subjectMask) {
      subjectMask = result.find(
        (r) => !r.label?.toLowerCase().includes('background')
      );
    }

    // Fallback to first result
    if (!subjectMask) {
      subjectMask = result[0];
    }

    if (!subjectMask?.mask) {
      throw new Error('No valid mask found in segmentation result');
    }

    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');

    if (!outputCtx) throw new Error('Could not get output canvas context');

    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);

    // Apply the mask
    const outputImageData = outputCtx.getImageData(
      0,
      0,
      outputCanvas.width,
      outputCanvas.height
    );
    const data = outputImageData.data;

    // Apply mask to alpha channel - keep the subject (where mask is high)
    for (let i = 0; i < subjectMask.mask.data.length; i++) {
      const alpha = Math.round(subjectMask.mask.data[i] * 255);
      data[i * 4 + 3] = alpha;
    }

    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Mask applied successfully');

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const isWebGPUSupported = async (): Promise<boolean> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any;
  if (!nav.gpu) {
    return false;
  }
  try {
    const adapter = await nav.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
};
