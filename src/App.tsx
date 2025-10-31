import { useState, useCallback } from "react";
import { Toaster, toast } from "sonner";
import QRScannerComponent from "./components/QRScanner";

// QR Code format regex - defined outside component to avoid re-creation
const qrformat =
  /E:[ABCDEF0123456789]{12}%M:?[ABCDEF0123456789]{4}\$F:?[ABCDEF0123456789]{4}\$H:?(?<hostname>sfy_poe_[ABCDEF0123456789]{6})\$P:?(?<pin>[ABCDEF0123456789]{4})/;

const TOAST_DURATION = 3000;
function App() {
  // const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedValue, setLastScannedValue] = useState<string>("");
  console.log("lastScannedValue: ", lastScannedValue);

  const handleScan = useCallback(async (result: string) => {
    console.log("=== QR SCAN TRIGGERED ===");
    console.log("Scanned Result:", result);

    setLastScannedValue(result);
    setIsProcessing(true);

    // Validate QR code against regex pattern
    const match = result.match(qrformat);

    if (match && match.groups && match.groups.hostname && match.groups.pin) {
      console.log("✅ QR Code matched successfully!");
      console.log("Hostname:", match.groups.hostname);
      console.log("PIN:", match.groups.pin);

      // // Copy PIN to clipboard and navigate to hostname in new tab
      try {
        await navigator.clipboard.writeText(match.groups.pin);
        console.log("📋 PIN copied to clipboard:", match.groups.pin);

        // Show success toast
        toast.success("QR Code Scanned!", {
          description: `PIN copied to clipboard. Opening ${match.groups.hostname}...`,
          duration: TOAST_DURATION,
        });
      } catch (clipboardError) {
        console.warn("⚠️ Failed to copy PIN to clipboard:", clipboardError);

        // Show warning toast
        toast.warning("QR Code Scanned!", {
          description: `Opening ${match.groups.hostname}... (Clipboard access denied)`,
          duration: TOAST_DURATION,
        });
      }

      // Open hostname in new tab
      window.open(`https://${match.groups.hostname}/`, "_self");
    } else {
      console.error("❌ QR Code does not match expected format");

      // Show error toast
      toast.error("Invalid QR Code", {
        description: "Please scan a valid Somfy PoE motor QR code.",
        duration: TOAST_DURATION,
      });
    }

    setIsProcessing(false);
  }, []);

  const handleError = useCallback((error: string) => {
    console.error("Scanner Error:", error);
    // alert(`❌ Scanner Error!\n\n${error}`);
  }, []);

  return (
    <div className="min-h-screen h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden select-none">
      <Toaster position="top-center" richColors expand={true} />
      <QRScannerComponent onScan={handleScan} onError={handleError} />

      {/* Last Scanned Value Display */}
      {/* {lastScannedValue && (
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
      )} */}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed top-4 right-4 bg-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 z-50 border-2 border-blue-200">
          <div className="w-4 h-4 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-blue-900">Processing...</span>
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
