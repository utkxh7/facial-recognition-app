import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

function WebcamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load face-api.js models
  useEffect(() => {
    let isMounted = true;
    const MODEL_URL = process.env.PUBLIC_URL + '/models';

    const loadModels = async () => {
      try {
        setLoading(true);
        
        // Load models sequentially with error handling for each
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        console.log('SSD Mobilenet v1 loaded');
        
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log('Face Landmark 68 loaded');
        
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log('Face Recognition loaded');

        if (isMounted) {
          setModelsLoaded(true);
          setLoading(false);
          startVideo();
        }
      } 
      
      catch (err) {
        console.error("Model loading error:", err);
        if (isMounted) {
          setError("Failed to load face detection models. Check console for details.");
          setLoading(false);
        }
      }
    };

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Webcam error:", err);
          setError("Could not access webcam. Please check permissions.");
        });
    };

    loadModels();

    return () => {
      isMounted = false;
      // Clean up video stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Face detection
  useEffect(() => {
    if (!modelsLoaded) return;

    const detectFaces = async () => {
      try {
        if (videoRef.current && !videoRef.current.paused) {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.SsdMobilenetv1Options()
          );
          console.log('Detections:', detections);
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
    };

    const interval = setInterval(detectFaces, 500);
    return () => clearInterval(interval);
  }, [modelsLoaded]);

  return (
    <div style={{ position: 'relative' }}>
      {loading && <div>Loading face detection models...</div>}
      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#ffebee' }}>
          {error}
        </div>
      )}
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline
        width="720" 
        height="560"
        style={{ display: 'block' }}
      />
    </div>
  );
}

export default WebcamCapture;