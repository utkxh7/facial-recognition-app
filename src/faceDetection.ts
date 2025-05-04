// utils/faceDetection.ts (or your detection file)
export async function safeDetectFaces(input: HTMLImageElement | HTMLVideoElement) {
    try {
      // @ts-ignore
      const detections = await faceapi.detectAllFaces(input);
      return validateDetections(detections); // Add this new function
    } catch (error) {
      console.error("Face detection crashed:", error);
      return [];
    }
  }
  
  // NEW: Add this validation function in the same file
  function validateDetections(detections: any[]) {
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