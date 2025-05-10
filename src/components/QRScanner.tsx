
import React, { useEffect, useRef, useState } from 'react';
import { scanQRCodeFromCanvas, processVideoFrame } from '../lib/qrCode';

interface QRScannerProps {
  onScan: (data: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if camera is available and start stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasCamera(true);
        setScanning(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setHasCamera(false);
    }
  };
  
  // Stop video stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setScanning(false);
    }
  };
  
  // Handle scan from video
  const handleScan = () => {
    if (!scanning || !canvasRef.current || !videoRef.current) return;
    
    if (processVideoFrame(videoRef.current, canvasRef.current)) {
      const qrData = scanQRCodeFromCanvas(canvasRef.current);
      
      if (qrData) {
        onScan(qrData);
        stopCamera();
        return;
      }
    }
    
    requestAnimationFrame(handleScan);
  };
  
  // Process uploaded image
  const processUploadedImage = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      setImageUrl(event.target.result as string);
      
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const qrData = scanQRCodeFromCanvas(canvas);
            
            if (qrData) {
              onScan(qrData);
            } else {
              alert('No QR code found in image');
            }
          }
        }
      };
      
      img.src = event.target.result as string;
    };
    
    reader.readAsDataURL(file);
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processUploadedImage(file);
    }
  };
  
  // Initialize scanning
  useEffect(() => {
    if (scanning) {
      handleScan();
    }
    
    return () => {
      stopCamera();
    };
  }, [scanning]);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden mb-4">
        {scanning && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            ></video>
            <div className="qr-scanner-overlay">
              <div className="qr-scanner-line animate-scan-animation"></div>
              <div className="scanner-corner scanner-corner-top-left"></div>
              <div className="scanner-corner scanner-corner-top-right"></div>
              <div className="scanner-corner scanner-corner-bottom-left"></div>
              <div className="scanner-corner scanner-corner-bottom-right"></div>
            </div>
          </>
        )}
        
        {!scanning && imageUrl && (
          <img 
            src={imageUrl} 
            alt="Uploaded for QR scanning" 
            className="w-full h-full object-contain"
          />
        )}
        
        {!scanning && !imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mx-auto mb-4 text-gray-400"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <rect x="7" y="7" width="3" height="3"></rect>
                <rect x="14" y="7" width="3" height="3"></rect>
                <rect x="7" y="14" width="3" height="3"></rect>
                <rect x="14" y="14" width="3" height="3"></rect>
              </svg>
              <p className="text-gray-400 text-sm">
                {hasCamera === false 
                  ? "Camera not available" 
                  : "Select a method to scan QR code"}
              </p>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
      
      <div className="flex gap-3 w-full max-w-md">
        {hasCamera !== false && (
          <button
            onClick={scanning ? stopCamera : startCamera}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              scanning 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-delivery-500 hover:bg-delivery-600 text-white'
            }`}
          >
            {scanning ? 'Stop Camera' : 'Scan with Camera'}
          </button>
        )}
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors"
        >
          Upload Image
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default QRScanner;
