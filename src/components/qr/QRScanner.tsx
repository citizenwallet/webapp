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
  const [isTransitioning, setIsTransitioning] = useState(false);

  const onScanSuccess: QrcodeSuccessCallback = async (decodedText, result) => {
    await stopScanner().then(() => {
      onScan(decodedText);
    });
  };

  const onScanFailure: QrcodeErrorCallback = (errorMessage, error) => {
    if (errorMessage.includes("NotFoundException")) return;
    console.error("QR code scan failed:", errorMessage);
  };

  const stopScanner = useCallback(async () => {
    if (!isScanning || !scannerRef.current || isTransitioning) return;

    try {
      setIsTransitioning(true);
      await scannerRef.current.stop();
      setIsScanning(false);
    } catch (err) {
      console.error("Failed to stop scanner:", err);
    } finally {
      setIsTransitioning(false);
    }
  }, [isScanning, isTransitioning]);

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
      if (isScanning && scannerRef.current && !isTransitioning) {
        scannerRef.current
          .stop()
          .then(() => {
            setIsScanning(false);
            if (scannerRef.current) {
              scannerRef.current = null;
            }
          })
          .catch((err) => console.error("Cleanup error:", err))
          .finally(() => {
            setIsTransitioning(false);
          });
      }
    };
  }, [isActive, isScanning, stopScanner, isTransitioning]);

  return (
    <div className="h-full w-full">
      <div id="qr-reader" ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export default QrCodeScanner;
