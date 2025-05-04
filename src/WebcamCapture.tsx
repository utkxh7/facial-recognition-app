import { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

// Type definition for face detection with age and gender
type FaceDetectionWithAgeGender = faceapi.WithAge<
  faceapi.WithGender<
    faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>, faceapi.FaceLandmarks68>
  >
>;

const MODEL_URL = process.env.PUBLIC_URL + '/models';
const DETECTION_INTERVAL = 300; // in milliseconds

const VIDEO_CONSTRAINTS = {
  video: {
    width: { ideal: 720 },
    height: { ideal: 560 },
    facingMode: 'user'
  }
};

function WebcamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [detections, setDetections] = useState<FaceDetectionWithAgeGender[]>([]); // Fixed typo from 'detections' to 'detections'

  const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load face-api models
  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      setModelsLoaded(true);
    } catch (err) {
      console.error("Model loading failed:", err);
      setError("Could not load models. Please check your connection or refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setDetections([]);
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      if (stream) stopCamera();

      const localStream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      if (videoRef.current) {
        videoRef.current.srcObject = localStream;
        await new Promise<void>(resolve => { // Added explicit void type to Promise
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });
      }

      setStream(localStream);
      setIsCameraOn(true);
      setError(null);
    } catch (err) {
      console.error("Webcam error:", err);
      setError("Could not access webcam. Please grant permission.");
      setIsCameraOn(false);
    }
  }, [stopCamera, stream]);

  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded || !isCameraOn) return;

    try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withAgeAndGender();
        setDetections(detections as unknown as FaceDetectionWithAgeGender[]);

      const canvas = canvasRef.current;
      const dims = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      };

      faceapi.matchDimensions(canvas, dims);
      const resizedDetections = faceapi.resizeResults(detections, dims);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      }
    } catch (err) {
      console.error("Detection error:", err);
    }
  }, [modelsLoaded, isCameraOn]);

  // Load models on mount
  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, [loadModels, stopCamera]);

  // Start camera automatically once models are loaded
  useEffect(() => {
    if (modelsLoaded && !isCameraOn) {
      startCamera();
    }
  }, [modelsLoaded, isCameraOn, startCamera]);

  // Start/stop face detection loop
  useEffect(() => {
    if (modelsLoaded && isCameraOn) {
      detectionInterval.current = setInterval(detectFaces, DETECTION_INTERVAL);
      return () => {
        if (detectionInterval.current) {
          clearInterval(detectionInterval.current);
        }
      };
    }
  }, [modelsLoaded, isCameraOn, detectFaces]);

  return (
    <div className="container mt-4 text-center">
      <h2 className="mb-4">Face Detection & Age/Gender Estimation</h2>

      {loading && (
        <div className="alert alert-info">
          <span className="spinner-border spinner-border-sm me-2" /> Loading models...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
          <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      <div className="mb-3">
        <button
          className={`btn ${isCameraOn ? 'btn-danger' : 'btn-success'} me-2`}
          onClick={isCameraOn ? stopCamera : startCamera}
          disabled={loading}
        >
          {isCameraOn ? 'Stop Webcam' : 'Start Webcam'}
        </button>
      </div>

      <div className="position-relative mx-auto" style={{ maxWidth: '720px' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="bg-dark rounded"
          style={{ display: isCameraOn ? 'block' : 'none', width: '100%' }}
        />
        <canvas
          ref={canvasRef}
          className="position-absolute top-0 start-0"
          style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
        />
        {detections.map((d, i) => (
          <div
            key={i}
            className="position-absolute bg-dark text-white bg-opacity-75 rounded p-1"
            style={{
              left: `${d.detection.box.x.toFixed(2)}px`,
              top: `${Math.max(0, d.detection.box.y - 30).toFixed(2)}px`,
              minWidth: '140px'
            }}
          >
            <small>
              Age: ~{Math.round(d.age)} | Gender: {d.gender} ({Math.round(d.genderProbability * 100)}%)
            </small>
          </div>
        ))}
      </div>

      {detections.length > 0 && (
        <div className="mt-3">
          <h5>Detected: {detections.length} face{detections.length !== 1 ? 's' : ''}</h5>
        </div>
      )}
    </div>
  );
}

export default WebcamCapture;