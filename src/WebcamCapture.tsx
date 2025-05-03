import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

function WebcamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  // Load models
  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      const MODEL_URL = '/models';
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);

      try {
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      } catch {
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
      }

      setModelsLoaded(true);
      setLoading(false);
    } catch (err) {
      console.error("Model loading failed:", err);
      setError("Failed to load models. Check console.");
      setLoading(false);
    }
  }, []);

  // Start webcam
  const startCamera = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = localStream;
      }
      setStream(localStream);
      setIsCameraOn(true);
    } catch (err) {
      console.error("Webcam error:", err);
      setError("Webcam access denied or failed.");
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsCameraOn(false);
  };

  // Face detection
  useEffect(() => {
    if (!modelsLoaded || !videoRef.current || !canvasRef.current || !isCameraOn) return;

    const detectFaces = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState !== 4) return;

      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.SsdMobilenetv1Options()
      ).withFaceLandmarks();

      faceapi.matchDimensions(canvas, video);
      const resized = faceapi.resizeResults(detections, video);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceLandmarks(canvas, resized);
      }
    };

    const interval = setInterval(detectFaces, 300);
    return () => clearInterval(interval);
  }, [modelsLoaded, isCameraOn]);

  useEffect(() => {
    loadModels();
    return stopCamera; // Cleanup on unmount
  }, [loadModels]);

  return (
    <div style={{ textAlign: 'center' }}>
      {loading && <div>Loading models...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div style={{ marginBottom: '10px' }}>
        <button onClick={startCamera} disabled={isCameraOn || loading} style={{ marginRight: '10px' }}>
          Start Webcam
        </button>
        <button onClick={stopCamera} disabled={!isCameraOn}>
          Stop Webcam
        </button>
      </div>

      <div style={{ position: 'relative', width: '720px', margin: '0 auto' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="720"
          height="560"
          style={{ backgroundColor: '#000', display: isCameraOn ? 'block' : 'none' }}
        />

        <canvas
          ref={canvasRef}
          width="720"
          height="560"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            display: isCameraOn ? 'block' : 'none'
          }}
        />
      </div>
    </div>
  );
}

export default WebcamCapture;
