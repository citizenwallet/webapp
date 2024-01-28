"use client";

import Image from "next/image";
import UserIcon from "@/assets/icons/user.svg";
import { ImageWrapper } from "./styles";
import { COLORS } from "@/theme/colors";

interface RoundedImageProps {
  src?: string;
  size?: number;
  accentColor?: string;
}

export default function RoundedImage({
  src,
  size = 42,
  accentColor = COLORS.secondary,
}: RoundedImageProps) {
  return (
    <ImageWrapper style={{ backgroundColor: accentColor }}>
      <Image
        src={src ?? UserIcon}
        alt="User RoundedImage Icon"
        height={size}
        width={size}
      />
    </ImageWrapper>
  );
}
