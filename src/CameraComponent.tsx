import * as faceapi from 'face-api.js';
import { safeDetectFaces } from '../src/faceDetection'; // Verify the file exists or adjust the path

const processFaces = async (videoElement: HTMLVideoElement) => {
  const faces = await safeDetectFaces(videoElement);
  console.log('Detected faces:', faces);
};
