import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/utils/clipboard";
import { useSafeEffect } from "@/hooks/useSafeEffect";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  label?: string;
  value: string;
  onClick?: (value: string) => void;
}

export default function CopyButton({ label, value, onClick }: CopyButtonProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [clicked, setClicked] = useState(false);

  const badgeLabel = label ?? value;

  useSafeEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    setClicked(true);

    if (onClick) onClick(value);
    copyToClipboard(value);

    timeoutRef.current = setTimeout(() => {
      setClicked(false);
    }, 1500);
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={cn(
        "text-lg gap-2 transition-colors duration-200",
        clicked ? "cursor-default border-success" : "cursor-pointer",
      )}
    >
      {badgeLabel} {!clicked && <CopyIcon size="18" />}
      {clicked && (
        <CheckIcon size="18" className="animate-fade-in text-success" />
      )}
    </Button>
  );
}
