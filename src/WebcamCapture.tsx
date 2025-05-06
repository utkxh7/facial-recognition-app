import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import useFaceModels from './faceModels';

const WebcamCapture = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { modelsLoaded, loadingError } = useFaceModels();
  const [isCameraOn, setIsCameraOn] = useState(false);

  const detectFaces = async () => {
    const video = webcamRef.current?.video as HTMLVideoElement | undefined;
    const canvas = canvasRef.current;

    if (!video || !canvas || !modelsLoaded || video.readyState !== 4) return;

    try {
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.SsdMobilenetv1Options()
      ).withFaceLandmarks().withFaceDescriptors();

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      }
    } catch (err) {
      console.error('Face detection error:', err);
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      const stream = webcamRef.current?.video?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' }
        });

        if (webcamRef.current?.video) {
          webcamRef.current.video.srcObject = stream;
          setIsCameraOn(true);
        }
      } catch (error) {
        console.error('Camera error:', error);
      }
    }
  };

  useEffect(() => {
    if (!modelsLoaded || !isCameraOn) return;

    const interval = setInterval(() => {
      detectFaces();
    }, 300);

    return () => clearInterval(interval);
  }, [modelsLoaded, isCameraOn]);

  return (
    <div style={{ position: 'relative' }}>
      {loadingError && (
        <div style={{ color: 'red', padding: '10px' }}>
          {loadingError}
        </div>
      )}

      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 1280,
          height: 720,
          facingMode: 'user'
        }}
        style={{
          display: isCameraOn ? 'block' : 'none',
          width: '100%',
          height: 'auto'
        }}
      />

      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          width: '100%',
          height: 'auto'
        }}
      />

      <button
        onClick={toggleCamera}
        disabled={!modelsLoaded}
        style={{
          padding: '10px 20px',
          margin: '10px',
          backgroundColor: modelsLoaded ? '#4CAF50' : '#cccccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: modelsLoaded ? 'pointer' : 'not-allowed'
        }}
      >
        {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
      </button>
    </div>
  );
};

export default WebcamCapture;
