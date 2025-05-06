import { useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';

export default function useFaceModels() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const MODEL_URL = process.env.PUBLIC_URL + '/models';

    const loadModels = async () => {
      try {
        console.log('Loading models from:', MODEL_URL);
        
        // Load models sequentially for better reliability
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        console.log('SSD Mobilenet loaded');
        
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log('Face Landmarks loaded');
        
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log('Face Recognition loaded');
        
        setModelsLoaded(true);
      } catch (error) {
        console.error('Model loading failed:', error);
        setLoadingError('Failed to load models. Trying CDN fallback...');
        
        // Fallback to CDN
        try {
          const CDN_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
          await faceapi.nets.ssdMobilenetv1.loadFromUri(CDN_URL);
          await faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL);
          await faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL);
          setModelsLoaded(true);
          setLoadingError(null);
        } catch (cdnError) {
          console.error('CDN fallback failed:', cdnError);
          setLoadingError('Failed to load models from both local and CDN');
        }
      }
    };

    loadModels();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return { modelsLoaded, loadingError };
}