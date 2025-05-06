import * as faceapi from '@vladmandic/face-api';

// Define a simplified type that matches v0.22.2's actual output
export type SafeFaceDetection = {
  detection: {
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    score: number;
  };
  landmarks?: faceapi.FaceLandmarks68;
  age?: number;
  gender?: 'male' | 'female';
  genderProbability?: number;
};

export async function safeDetectFaces(
  input: HTMLImageElement | HTMLVideoElement,
  options?: faceapi.SsdMobilenetv1Options
): Promise<SafeFaceDetection[]> {
  try {
    // @ts-ignore - Temporary bypass for version mismatch
    const detections = await faceapi
      .detectAllFaces(input, options)
      .withFaceLandmarks()
      .withAgeAndGender();
    
    return validateDetections(detections);
  } catch (error) {
    console.error("Face detection error:", error);
    return [];
  }
}

function validateDetections(detections: any[]): SafeFaceDetection[] {
  if (!Array.isArray(detections)) return [];

  return detections.filter(det => {
    const box = det.detection?.box;
    return (
      box &&
      typeof box.x === 'number' &&
      typeof box.width === 'number' &&
      box.width > 10 // Minimum face size
    );
  });
}