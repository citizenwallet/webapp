"use client";

import { useCallback, useRef } from "react";
import QrScanner from "qr-scanner";
import { useSafeEffect } from "@/hooks/useSafeEffect";

interface QRScannerProps {
  onScan: (data: string) => void;
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner>();

  const hasScannedRef = useRef(false);

  const handleScan = useCallback(
    (result: QrScanner.ScanResult) => {
      if (!result?.data || hasScannedRef.current) {
        return;
      }
      hasScannedRef.current = true;
      onScan(result.data);
    },
    [onScan]
  );

  useSafeEffect(() => {
    qrScannerRef.current = new QrScanner(videoRef.current!, handleScan, {
      maxScansPerSecond: 4,
      highlightScanRegion: true,
      highlightCodeOutline: true,
    });
    qrScannerRef.current.start();
    return () => {
      qrScannerRef.current!.stop();
    };
  }, [handleScan]);

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover animate-fade-in-slow bg-gray-500"
    ></video>
  );
}
