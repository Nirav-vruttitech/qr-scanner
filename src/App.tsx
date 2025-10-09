import { useState, useCallback } from "react";
import QRScannerComponent from "./components/QRScanner";

interface ScanResult {
  data: string;
  timestamp: string;
  status: "success" | "error";
  message?: string;
}

function App() {
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedValue, setLastScannedValue] = useState<string>("");

  console.log("scanHistory: ", scanHistory);
  // API call function - Replace with your actual API endpoint
  const makeAPICall = async (qrData: string): Promise<void> => {
    try {
      // Replace this URL with your actual API endpoint
      const response = await fetch("https://api.example.com/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCode: qrData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Add success result to history
      setScanHistory((prev) => [
        {
          data: qrData,
          timestamp: new Date().toLocaleString(),
          status: "success",
          message: "Successfully processed",
        },
        ...prev.slice(0, 9), // Keep only last 10 results
      ]);
    } catch (error) {
      console.error("API call error:", error);

      // Add error result to history
      setScanHistory((prev) => [
        {
          data: qrData,
          timestamp: new Date().toLocaleString(),
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const handleScan = useCallback(
    async (result: string) => {
      // if (isProcessing) return; // Prevent multiple simultaneous API calls

      console.log("=== QR SCAN TRIGGERED ===");
      console.log("Scanned Result:", result);

      setIsProcessing(true);
      setLastScannedValue(result);

      await makeAPICall(result);

      setIsProcessing(false);
    },
    [isProcessing]
  );

  const handleError = useCallback((error: string) => {
    console.error("Scanner Error:", error);
    // alert(`❌ Scanner Error!\n\n${error}`);
  }, []);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <QRScannerComponent onScan={handleScan} onError={handleError} />

      {/* Last Scanned Value Display */}
      {lastScannedValue && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white px-6 py-4 rounded-2xl shadow-2xl z-50 border-2 border-blue-500 max-w-md w-11/12">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-700 mb-1">Scanned QR Code:</h3>
              <p className="font-mono text-base font-semibold text-blue-600 break-all">{lastScannedValue}</p>
            </div>
            <button onClick={() => setLastScannedValue("")} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed top-5 right-5 bg-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border-2 border-blue-200">
          <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-base font-bold text-blue-900">Processing...</span>
        </div>
      )}

      {/* Scan History - Clean Design */}
      {/* {scanHistory.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-64 overflow-hidden z-40 border-t-2 border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Scan History</h3>
                <p className="text-xs text-blue-100">
                  {scanHistory.length} recent scan{scanHistory.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-44 p-3 bg-gray-50">
            <div className="space-y-2">
              {scanHistory.map((scan, index) => (
                <div
                  key={index}
                  className={`p-2.5 rounded-lg border transition-all ${
                    scan.status === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            scan.status === "success" ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {scan.status === "success" ? (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-500">{scan.timestamp}</span>
                      </div>
                      <p className="font-mono text-xs font-semibold text-gray-800 truncate">{scan.data}</p>
                      {scan.message && (
                        <p className={`text-xs mt-0.5 ${scan.status === "success" ? "text-green-700" : "text-red-700"}`}>{scan.message}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                        scan.status === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      }`}
                    >
                      {scan.status === "success" ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default App;
