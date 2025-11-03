import { useState, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { BiSolidCopy, BiSolidCheckCircle } from "react-icons/bi";
import QRScannerComponent from "./components/QRScanner";

// QR Code format regex - defined outside component to avoid re-creation
const qrformat =
  /E:[ABCDEF0123456789]{12}%M:?[ABCDEF0123456789]{4}\$F:?[ABCDEF0123456789]{4}\$H:?(?<hostname>sfy_poe_[ABCDEF0123456789]{6})\$P:?(?<pin>[ABCDEF0123456789]{4})/;

const TOAST_DURATION = 3000;

interface ScanResult {
  hostname: string;
  pin: string;
}

function App() {
  // const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  // const [lastScannedValue, setLastScannedValue] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  // Copy PIN to clipboard function
  const copyPinToClipboard = useCallback(async (pin: string) => {
    let success = false;

    // Method 1: Modern Clipboard API
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(pin);
        success = true;
        console.log("PIN copied via Clipboard API:", pin);
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (error) {
      console.warn("Clipboard API failed:", error);
      // Method 2: execCommand fallback
      try {
        const textArea = document.createElement("textarea");
        textArea.value = pin;
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        textArea.style.fontSize = "16px";

        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, pin.length);

        const result = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (result) {
          success = true;
          console.log("PIN copied via execCommand:", pin);
        }
      } catch (error2) {
        console.error("All copy methods failed:", error2);
      }
    }

    if (success) {
      setCopiedPin(true);
      toast.success("PIN copied to clipboard!", { duration: 2000 });
      setTimeout(() => setCopiedPin(false), 2000);
    } else {
      toast.error("Failed to copy PIN", { duration: 2000 });
    }
  }, []);

  // Handle continue button click
  const handleContinue = useCallback(() => {
    if (scanResult) {
      setScanResult(null);
      window.open(`https://${scanResult.hostname}/`, "_self");
    }
  }, [scanResult]);

  const handleScan = useCallback(async (result: string) => {
    setIsProcessing(true);

    // Validate QR code against regex pattern
    const match = result.match(qrformat);

    // Show modal instead of redirecting immediately
    if (match && match.groups && match.groups.hostname && match.groups.pin) {
      setScanResult({
        hostname: match.groups.hostname,
        pin: match.groups.pin,
      });

      toast.success("QR Code Scanned!", {
        description: "Review the details below.",
        duration: TOAST_DURATION,
      });
    } else {
      console.error("QR Code does not match expected format");
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

      {/* Scan Result Modal */}
      {scanResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <BiSolidCheckCircle className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">QR Code Scanned!</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Hostname Section */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Hostname</label>
                <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
                  <p className="font-mono text-sm font-bold text-gray-900 break-all">{scanResult.hostname}</p>
                </div>
              </div>

              {/* PIN Section */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">PIN</label>
                <div className="flex gap-2 items-stretch">
                  <div className="flex-1 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-1.5 border-2 border-yellow-200">
                    <p className="font-mono text-lg font-bold text-gray-900">{scanResult.pin}</p>
                  </div>
                  <button
                    onClick={() => copyPinToClipboard(scanResult.pin)}
                    className={`px-4 rounded-lg font-semibold transition-all active:scale-95 ${
                      copiedPin ? "bg-green-500 text-white hover:bg-green-600" : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    title="Copy PIN to clipboard"
                  >
                    {copiedPin ? <BiSolidCheckCircle className="w-5 h-5" /> : <BiSolidCopy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Click to copy PIN to clipboard</p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t-2 border-gray-100">
              <button
                onClick={() => setScanResult(null)}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-all active:scale-95 shadow-md"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed top-4 right-4 bg-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 z-50 border-2 border-blue-200">
          <div className="w-4 h-4 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-blue-900">Processing...</span>
        </div>
      )}
    </div>
  );
}

export default App;
