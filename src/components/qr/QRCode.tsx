import { cn } from "@/lib/utils";
import { Flex } from "@radix-ui/themes";
import qr from "qr.js";

interface QRCodeProps {
  qrCode: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
}

export default function QRCode({
  qrCode,
  size = 256,
  backgroundColor = "#FFFFFF",
  foregroundColor = "#000000",
}: QRCodeProps) {
  const generatedCode = qr(qrCode);

  const cells = generatedCode.modules;

  const viewBoxSize = cells.length;

  const background = cells
    .map((row: boolean[], rowIndex: number) =>
      row
        .map((cell, cellIndex) =>
          !cell ? `M ${cellIndex} ${rowIndex} l 1 0 0 1 -1 0 Z` : "",
        )
        .join(" "),
    )
    .join(" ");

  const foreground = cells
    .map((row: boolean[], rowIndex: number) =>
      row
        .map((cell, cellIndex) =>
          cell ? `M ${cellIndex} ${rowIndex} l 1 0 0 1 -1 0 Z` : "",
        )
        .join(" "),
    )
    .join(" ");

  return (
    <svg
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={background} fill={backgroundColor} />
      <path d={foreground} fill={foregroundColor} />
    </svg>
  );

  return generatedCode.modules.map((row: boolean[], index: number) => (
    <Flex key={index}>
      {row.map((column, cindex) => (
        <div
          className={cn("h-4 w-4", column ? "bg-black" : undefined)}
          key={cindex}
        >
          {column}
        </div>
      ))}
    </Flex>
  ));
}
