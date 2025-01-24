import React, { useRef, useState, useCallback } from "react";
import {
  Html5Qrcode,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
} from "html5-qrcode";
import { useSafeEffect } from "@/hooks/useSafeEffect";

interface QrCodeScannerProps {
  isActive: boolean;
  onScan: (data: string) => void;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ isActive, onScan }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const onScanSuccess: QrcodeSuccessCallback = (decodedText, result) => {
    stopScanner();
    onScan(decodedText.trim());
  };

  const onScanFailure: QrcodeErrorCallback = (errorMessage, error) => {
    if (errorMessage.includes("NotFoundException")) return;
    console.error("QR code scan failed:", errorMessage);
  };

  const stopScanner = useCallback(async () => {
    if (!isScanning || !scannerRef.current) return;

    try {
      await scannerRef.current.stop();
      setIsScanning(false);
    } catch (err) {
      console.error("Failed to stop scanner:", err);
    }
  }, [isScanning]);

  useSafeEffect(() => {
    if (!containerRef.current) return;

    async function startScanner() {
      if (isScanning || !isActive) return;

      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          onScanSuccess,
          onScanFailure
        );
        setIsScanning(true);
      } catch (err) {
        console.error("Failed to start scanner:", err);
        setIsScanning(false);
      }
    }

    if (isActive) {
      startScanner();
    } else {
      stopScanner();
    }

    // Cleanup
    return () => {
      if (isScanning && scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            setIsScanning(false);
            if (scannerRef.current) {
              scannerRef.current = null;
            }
          })
          .catch((err) => console.error("Cleanup error:", err));
      }
    };
  }, [isActive, isScanning, stopScanner]);

  return (
    <div className="h-full w-full">
      <div id="qr-reader" ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export default QrCodeScanner;
