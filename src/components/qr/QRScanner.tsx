import {
  Html5Qrcode,
  Html5QrcodeCameraScanConfig,
  Html5QrcodeResult,
} from "html5-qrcode";
import {
  Html5QrcodeError,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
  QrDimensionFunction,
  QrDimensions,
} from "html5-qrcode/esm/core";
import { useSafeEffect } from "@/hooks/useSafeEffect";

const qrcodeRegionId = "html5qr-code-full-region";

const calculateQrbox: QrDimensionFunction = (viewfinderWidth: number, viewfinderHeight: number): QrDimensions => {
  const minDimension = Math.min(viewfinderWidth, viewfinderHeight);
  
  const qrboxSize = Math.floor(minDimension * 0.9);
  
  return {
    width: qrboxSize,
    height: qrboxSize
  };
};

const getScannerConfig = (): Html5QrcodeCameraScanConfig => {
  return {
    fps: 1,
    aspectRatio: 4 / 3,
    disableFlip: false,
    qrbox: calculateQrbox,
  };
};

interface QrScannerProps {
  onScan: (data: string) => void;
  isActive?: boolean;
}

const QrScanner = ({ onScan, isActive = true }: QrScannerProps) => {
  const onScanSuccess: QrcodeSuccessCallback = (
    decodedText: string,
    result: Html5QrcodeResult
  ) => {
    onScan(decodedText);
  };

  const onScanError: QrcodeErrorCallback = (
    errorMessage: string,
    error: Html5QrcodeError
  ) => {
    // Only log significant errors, not "NotFoundException" which happens when no QR is found
    if (!errorMessage.includes("NotFoundException")) {
      console.error("QR scan error:", errorMessage, error);
    }
  };

  useSafeEffect(() => {
    // Only start scanner if component is active
    if (!isActive) return;

    let html5QrcodeScanner: Html5Qrcode | null = null;

    try {
      html5QrcodeScanner = new Html5Qrcode(qrcodeRegionId);

      html5QrcodeScanner
        .start(
          { facingMode: "environment" },
          getScannerConfig(),
          onScanSuccess,
          onScanError
        )
        .catch((err) => {
          console.error("Failed to start scanner:", err);
        });
    } catch (error) {
      console.error("Error initializing scanner:", error);
    }

    // Cleanup function when component will unmount or isActive changes
    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner
          .stop()
          .then(() => {
            console.log("QR Code scanning stopped");
          })
          .catch((err) => {
            console.error("Failed to stop scanner:", err);
          });
      }
    };
  }, [isActive, onScan]);

  return <div id={qrcodeRegionId} className="w-full h-full" />;
};

export default QrScanner;
