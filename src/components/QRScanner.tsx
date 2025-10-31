/* eslint-disable @typescript-eslint/no-unused-vars */
import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";
import somfyLogo from "../assets/somfy_logo.svg";
import { BiSolidTorch } from "react-icons/bi";

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

const QRScannerComponent = ({ onScan, onError }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [hasFlash, setHasFlash] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string | undefined>("");
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [, setCurrentZoom] = useState(1);
  const [manualZoom, setManualZoom] = useState(1);
  const [isAutoFlash, setIsAutoFlash] = useState(true);
  const [, setIsAutoZoomEnabled] = useState(true);
  const [showZoomTooltip, setShowZoomTooltip] = useState(false);
  const lastScanRef = useRef<string>("");
  const lastScanTimeRef = useRef<number>(0);
  const scanAttemptRef = useRef<number>(0);
  const zoomIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const videoStreamRef = useRef<MediaStream | null>(null);

  // Function to fetch and select the best camera
  const fetchBestCamera = async () => {
    try {
      const cameras = await QrScanner.listCameras(true);
      console.log("📷 Available cameras:", cameras);

      // Filter cameras that include "back" in the label (rear cameras)
      const backCameras = cameras.filter((camera) => camera.label.toLowerCase().includes("back"));

      // Sort cameras by number in label (higher number = better quality usually)
      const sortedCameras = backCameras.sort((a, b) => {
        const matchA = a.label.match(/\d+/);
        const matchB = b.label.match(/\d+/);
        const numberA = matchA ? parseInt(matchA[0], 10) : Infinity;
        const numberB = matchB ? parseInt(matchB[0], 10) : Infinity;

        if (numberA === numberB) {
          return a.label.localeCompare(b.label);
        }
        return numberA - numberB;
      });

      // Select the best camera (first sorted back camera or fallback to environment)
      if (sortedCameras.length > 0) {
        setSelectedCamera(sortedCameras[0].id);
        console.log("✅ Selected camera:", sortedCameras[0].label);
      } else {
        setSelectedCamera("environment"); // Fallback to default back camera
        console.log("⚠️ No back camera found, using 'environment' as fallback");
      }
    } catch (error) {
      console.error("❌ Error fetching cameras:", error);
      setSelectedCamera("environment");
    }
  };

  // Auto-zoom functionality - increases zoom gradually if QR not detected
  const applyZoom = async (zoomLevel: number) => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;

    if (capabilities.zoom) {
      try {
        await track.applyConstraints({
          advanced: [{ zoom: zoomLevel } as any],
        });
        setCurrentZoom(zoomLevel);
        console.log(`🔍 Zoom applied: ${zoomLevel}x`);
      } catch (error) {
        console.error("❌ Error applying zoom:", error);
      }
    }
  };

  // Auto-flash functionality - turns on flash in low light conditions
  const toggleAutoFlash = async (enable: boolean) => {
    if (!scannerRef.current || !isAutoFlash) return; // Check if auto-flash is allowed

    try {
      if (enable && !isFlashOn) {
        await scannerRef.current.turnFlashOn();
        setIsFlashOn(true);
        console.log("💡 Flash turned ON automatically");
      } else if (!enable && isFlashOn) {
        await scannerRef.current.turnFlashOff();
        setIsFlashOn(false);
        console.log("💡 Flash turned OFF");
      }
    } catch (error) {
      console.error("❌ Error toggling flash:", error);
    }
  };

  // Manual flash toggle by user
  const handleManualFlashToggle = async () => {
    if (!scannerRef.current) return;

    try {
      if (isFlashOn) {
        // Turn off flash
        await scannerRef.current.turnFlashOff();
        setIsFlashOn(false);
        setIsAutoFlash(false);
      } else {
        // Turn on flash manually
        await scannerRef.current.turnFlashOn();
        setIsFlashOn(true);
        setIsAutoFlash(true);
      }
    } catch (error) {
      console.error("❌ Error toggling flash manually:", error);
      onError?.("Flash control not available on this device");
    }
  };

  // Manual zoom control - User can increase zoom
  // const handleManualZoom = () => {
  //   if (!isScanning) return;

  //   // Disable auto-zoom when user manually zooms
  //   setIsAutoZoomEnabled(false);

  //   // Increase zoom by 0.5x steps, max 3.0x
  //   const newZoom = Math.min(currentZoom + 0.5, 3.0);
  //   applyZoom(newZoom);
  // };

  // Handle zoom slider change
  const handleZoomSliderChange = (value: number) => {
    setManualZoom(value);

    // If scanning, apply zoom immediately and disable auto-zoom
    if (isScanning) {
      setIsAutoZoomEnabled(false);
      applyZoom(value);
    }
  };

  // Reset zoom to 1.0x and restart auto-zoom from beginning
  // const handleResetZoom = () => {
  //   if (!isScanning) return;

  //   // Clear the existing zoom interval
  //   if (zoomIntervalRef.current) {
  //     clearInterval(zoomIntervalRef.current);
  //     zoomIntervalRef.current = null;
  //   }

  //   // Reset zoom to 1.0x
  //   applyZoom(1.0);
  //   setManualZoom(1.0);

  //   // Reset scan attempts counter
  //   scanAttemptRef.current = 0;

  //   // Re-enable auto-zoom and restart it from the beginning
  //   setIsAutoZoomEnabled(true);

  //   // Restart auto-zoom process (disabled - manual zoom only)
  //   // startAutoZoom();
  // };

  // Auto-adjust zoom based on scan attempts - Smooth gradual zoom (DISABLED - Manual zoom only)
  // const startAutoZoom = () => {
  //   // Auto-zoom disabled - users now control zoom manually via slider
  //   return;

  //   /* Original auto-zoom code (disabled):
  //   // Clear any existing interval
  //   if (zoomIntervalRef.current) {
  //     clearInterval(zoomIntervalRef.current);
  //   }

  //   let zoomLevel = 1.0;
  //   scanAttemptRef.current = 0;

  //   // Gradually increase zoom every 2 seconds for smoother experience
  //   zoomIntervalRef.current = setInterval(() => {
  //     // Check the current state - if auto-zoom was disabled, stop
  //     if (!isAutoZoomEnabled) {
  //       if (zoomIntervalRef.current) {
  //         clearInterval(zoomIntervalRef.current);
  //         zoomIntervalRef.current = null;
  //       }
  //       return;
  //     }

  //     scanAttemptRef.current += 1;

  //     // Smooth zoom progression: 1.0 -> 1.2 -> 1.4 -> 1.6 -> 1.8 -> 2.0 -> 2.2 -> 2.4 -> 2.6 -> 2.8 -> 3.0
  //     if (scanAttemptRef.current <= 10) {
  //       zoomLevel = 1.0 + scanAttemptRef.current * 0.2; // Increment by 0.2x each time
  //       const cappedZoom = Math.min(zoomLevel, 3.0);
  //       applyZoom(cappedZoom); // Cap at 3.0x and update currentZoom state
  //     }

  //     // Turn on flash after 5 attempts (10 seconds) if still not detected
  //     if (scanAttemptRef.current === 5) {
  //       toggleAutoFlash(true);
  //     }
  //   }, 2000); // Check every 2 seconds for smoother progression
  //   */
  // };

  // Stop auto-zoom and reset
  const stopAutoZoom = () => {
    if (zoomIntervalRef.current) {
      clearInterval(zoomIntervalRef.current);
      zoomIntervalRef.current = null;
    }
    scanAttemptRef.current = 0;
    applyZoom(1); // Reset to default zoom
    setManualZoom(1); // Reset manual zoom slider
    toggleAutoFlash(false); // Turn off flash
    setIsAutoZoomEnabled(true); // Re-enable auto-zoom for next scan
  };

  useEffect(() => {
    fetchBestCamera();
  }, []);

  useEffect(() => {
    if (!videoRef.current || !selectedCamera) return;

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

          // Stop auto-zoom when QR is detected
          stopAutoZoom();

          // alert(`✅ Successfully Scanned!\n\nQR Code Value:\n${result.data}`);
          onScan(result.data);
          setIsScanning(false);
        } else {
          console.log("⏭️ Skipping duplicate scan");
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: selectedCamera,
      }
    );

    scannerRef.current = qrScanner;

    QrScanner.hasCamera().then((hasCamera) => {
      setHasCamera(hasCamera);
      if (!hasCamera) {
        if (onError) {
          onError("No camera found on this device");
        }
      }
    });

    // Check if flash is available
    qrScanner
      .hasFlash()
      .then((hasFlashSupport) => {
        setHasFlash(hasFlashSupport);
        console.log("💡 Flash support:", hasFlashSupport);
      })
      .catch(() => {
        setHasFlash(false);
        console.log("💡 Flash not supported");
      });

    return () => {
      qrScanner.stop();
      qrScanner.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera]);

  useEffect(() => {
    if (scannerRef.current) {
      if (isScanning) {
        scannerRef.current
          .start()
          .then(() => {
            // Start auto-zoom after scanner starts (disabled - manual zoom only)
            // startAutoZoom();
            console.log("📷 Scanner started - manual zoom enabled");
          })
          .catch((err) => {
            console.error("Error starting scanner:", err);
            const errorMessage = "Failed to start camera. Please check permissions.";

            if (onError) {
              onError(errorMessage);
            }
            setIsScanning(false);
          });
      } else {
        scannerRef.current.stop();
        // Stop auto-zoom when scanner stops
        stopAutoZoom();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning, onError]);

  const handleStartScanning = () => {
    if (hasCamera) {
      setIsScanning(true);
    }
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  const handleToggleScanning = () => {
    if (isScanning) {
      handleStopScanning();
    } else {
      handleStartScanning();
    }
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center p-3 overflow-y-auto">
      <div className="w-full mx-auto" style={{ maxWidth: "400px" }}>
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-32 mb-3">
            <img src={somfyLogo} alt="Somfy Logo" className="w-full h-full text-white object-fill  " />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Scan QR Code</h1>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg ">
            <div className={`w-2.5 h-2.5  ${isScanning ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
            <p className={`text-xs font-bold ${isScanning ? "text-green-600" : "text-gray-700"}`}>{isScanning ? "Scanning..." : "Ready"}</p>
          </div>

          {/* Auto-zoom and Flash Indicators */}
          {/* {false && (
            <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
              {currentZoom > 2.0 && (
                <button
                  onClick={handleResetZoom}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all bg-yellow-100 hover:bg-yellow-200 active:scale-95"
                >
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-yellow-700">Reset Zoom</span>
                </button>
              )}

              {currentZoom > 1 && (
                <button
                  onClick={handleManualZoom}
                  disabled={currentZoom >= 3.0}
                  className={`flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full transition-all hover:bg-blue-200 active:scale-95 ${
                    currentZoom >= 3.0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-blue-700">{currentZoom.toFixed(1)}x</span>
                </button>
              )}
              <button
                onClick={handleManualFlashToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                  isFlashOn ? "bg-yellow-100 hover:bg-yellow-200 active:scale-95" : "bg-gray-100 hover:bg-gray-200 active:scale-95"
                }`}
              >
                <svg className={`w-4 h-4 ${isFlashOn ? "text-yellow-600" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className={`text-xs font-semibold ${isFlashOn ? "text-yellow-700" : "text-gray-700"}`}>
                  {isFlashOn ? "Flash OFF" : "Flash ON"}
                </span>
              </button>
            </div>
          )} */}
        </div>

        {/* Camera Container */}
        <div className="bg-white rounded-2xl p-4 shadow-2xl border-2 border-gray-100 ">
          {/* Camera Frame */}
          <div className="relative bg-black rounded-xl overflow-hidden shadow-inner">
            <video ref={videoRef} className="w-full lg:w-[80%] 2xl:w-full aspect-square object-cover" style={{ maxHeight: "350px" }} />

            {/* Scanning Overlay */}
            {/* {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg animate-pulse"></div>
                <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg animate-pulse"></div>
                <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg animate-pulse"></div>
                <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-yellow-400 rounded-br-lg animate-pulse"></div>
              </div>
            )} */}

            {/* Inactive Overlay */}
            {!isScanning && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black bg-opacity-85 cursor-pointer transition-all hover:bg-opacity-90"
                onClick={handleStartScanning}
              >
                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-xl mb-3 shadow-xl">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-base font-bold text-white mb-1">Camera Ready</p>
                  <p className="text-xs text-gray-400">Tap "Start Scan" to begin</p>
                </div>
              </div>
            )}

            {/* No Camera */}
            {!hasCamera && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-xl mb-3 shadow-lg">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-red-800 mb-1">Camera Not Found</p>
                  <p className="text-xs text-red-600">Please check permissions</p>
                </div>
              </div>
            )}
          </div>

          {/* Zoom Slider - Always visible */}
          <div className="mt-4 px-1">
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Zoom</label>
            <div className="relative">
              {/* Tooltip */}
              {showZoomTooltip && (
                <div
                  className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg z-10"
                  style={{
                    left: `${((manualZoom - 1) / 2) * 100}%`,
                  }}
                >
                  {manualZoom.toFixed(1)}x<div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
                </div>
              )}

              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={manualZoom}
                onChange={(e) => handleZoomSliderChange(parseFloat(e.target.value))}
                onMouseDown={() => setShowZoomTooltip(true)}
                onMouseUp={() => setShowZoomTooltip(false)}
                onTouchStart={() => setShowZoomTooltip(true)}
                onTouchEnd={() => setShowZoomTooltip(false)}
                className="w-full h-2 bg-gradient-to-r from-blue-200 to-blue-400 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((manualZoom - 1) / 2) * 100}%, #dbeafe ${
                    ((manualZoom - 1) / 2) * 100
                  }%, #dbeafe 100%)`,
                }}
              />
            </div>
          </div>

          {/* Button - Single Toggle Button with Flash */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleToggleScanning}
              disabled={!hasCamera}
              className={`${hasFlash ? "flex-1" : "w-full"} py-2.5 px-4 rounded-xl font-semibold text-sm transition-all shadow-md ${
                isScanning ? "bg-red-500 text-white hover:opacity-90" : "bg-buttonColor text-white "
              } active:scale-95 hover:shadow-lg ${!hasCamera ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isScanning ? "Stop Scan" : "Start Scan"}
            </button>

            {/* Flash/Torch Button - Only show if flash is available */}
            {hasFlash && (
              <button
                onClick={handleManualFlashToggle}
                disabled={!hasCamera || !isScanning}
                className={`p-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                  isFlashOn ? "bg-yellow-500 text-white hover:opacity-90" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                } active:scale-95 hover:shadow-lg ${!hasCamera || !isScanning ? "opacity-50 cursor-not-allowed" : ""}`}
                title={isFlashOn ? "Turn Flash Off" : "Turn Flash On"}
              >
                <BiSolidTorch size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerComponent;
