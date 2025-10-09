import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

const QRScannerComponent = ({ onScan, onError }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const lastScanRef = useRef<string>("");
  const lastScanTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        const now = Date.now();
        const timeSinceLastScan = now - lastScanTimeRef.current;

        console.log("🔍 QR Scanner callback triggered");
        console.log("Detected data:", result.data);

        // Prevent duplicate scans within 2 seconds
        if (result.data !== lastScanRef.current || timeSinceLastScan > 2000) {
          lastScanRef.current = result.data;
          lastScanTimeRef.current = now;

          console.log("✅ QR Code Successfully Detected:", result.data);
          alert(`✅ Successfully Scanned!\n\nQR Code Value:\n${result.data}`);
          onScan(result.data);
        } else {
          console.log("⏭️ Skipping duplicate scan");
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: "environment",
      }
    );

    scannerRef.current = qrScanner;

    QrScanner.hasCamera().then((hasCamera) => {
      setHasCamera(hasCamera);
      if (!hasCamera) {
        alert("❌ No Camera Found!\n\nPlease check if your device has a camera and permissions are granted.");
        if (onError) {
          onError("No camera found on this device");
        }
      }
    });

    return () => {
      qrScanner.stop();
      qrScanner.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scannerRef.current) {
      if (isScanning) {
        scannerRef.current.start().catch((err) => {
          console.error("Error starting scanner:", err);
          const errorMessage = "Failed to start camera. Please check permissions.";
          alert(`❌ Camera Error!\n\n${errorMessage}\n\nDetails: ${err.message || err}`);
          if (onError) {
            onError(errorMessage);
          }
          setIsScanning(false);
        });
      } else {
        scannerRef.current.stop();
      }
    }
  }, [isScanning, onError]);

  const handleStartScanning = () => {
    if (hasCamera) {
      setIsScanning(true);
    }
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full mx-auto" style={{ maxWidth: "420px" }}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-4 shadow-xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Scanner</h1>
          <p className="text-gray-600 text-base mb-4">Scan any QR code instantly</p>
          <div className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-lg ">
            <div className={`w-3 h-3  ${isScanning ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
            <p className={`text-sm font-bold ${isScanning ? "text-green-600" : "text-gray-700"}`}>{isScanning ? "Scanning..." : "Ready"}</p>
          </div>
        </div>

        {/* Camera Container */}
        <div className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-gray-100">
          {/* Camera Frame */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-inner">
            <video ref={videoRef} className="w-full aspect-square object-cover" style={{ maxHeight: "400px" }} />

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-8 left-8 w-14 h-14 border-t-4 border-l-4 border-blue-400 rounded-tl-lg animate-pulse"></div>
                <div className="absolute top-8 right-8 w-14 h-14 border-t-4 border-r-4 border-blue-400 rounded-tr-lg animate-pulse"></div>
                <div className="absolute bottom-8 left-8 w-14 h-14 border-b-4 border-l-4 border-blue-400 rounded-bl-lg animate-pulse"></div>
                <div className="absolute bottom-8 right-8 w-14 h-14 border-b-4 border-r-4 border-blue-400 rounded-br-lg animate-pulse"></div>
              </div>
            )}

            {/* Inactive Overlay */}
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black bg-opacity-85">
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-2xl mb-4 shadow-xl">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-white mb-1">Camera Ready</p>
                  <p className="text-sm text-gray-400">Tap "Start Scan" to begin</p>
                </div>
              </div>
            )}

            {/* No Camera */}
            {!hasCamera && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-2xl mb-4 shadow-lg">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <p className="text-base font-bold text-red-800 mb-1">Camera Not Found</p>
                  <p className="text-sm text-red-600">Please check permissions</p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons - No Icons, Clean Design */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleStartScanning}
              disabled={!hasCamera || isScanning}
              className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md bg-blue-500 text-white hover:bg-blue-600 active:scale-95 hover:shadow-lg ${
                isScanning || !hasCamera ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isScanning ? "Scanning..." : "Start Scan"}
            </button>

            <button
              onClick={handleStopScanning}
              disabled={!isScanning}
              className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md bg-red-300 text-red-900 hover:bg-red-400 active:scale-95 hover:shadow-lg ${
                !isScanning ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Stop Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerComponent;
