"use client";

import { COLORS } from "@/theme/colors";
import styled from "styled-components";

interface CommonTextProps {
  fontSize?: string;
  $color?: string;
}

export const Title = styled.h1`
  font-size: 6cqw;
  font-weight: bold;
  margin: 0;

  // ellipsis
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Subtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0;
`;

export const SubtleSubtitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;

  color: ${COLORS.subtle};
`;

export const Text = styled.p<CommonTextProps>`
  font-size: ${(props) => props.fontSize || "1rem"};
  color: ${(props) => props.color || "unset"};
  font-weight: 300;
  margin: 0;
`;

export const TextBold = styled.p`
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
`;

export const TextSubtle = styled.p<CommonTextProps>`
  font-size: ${(props) => props.fontSize ?? "1rem"};
  font-weight: 300;
  margin: 0;

  color: ${(props) => props.color ?? COLORS.subtle};
`;

export const CurrencyAmountLarge = styled.h1`
  font-size: 10cqw;
  font-weight: bold;
  margin: 0;

  color: ${COLORS.text};

  // ellipsis
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CurrencySymbolLarge = styled.h1`
  font-size: 4cqw;
  font-weight: bold;
  margin: 0;

  color: ${COLORS.text};

  // ellipsis
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface CurrentAmountProps {
  $positive?: boolean;
}

export const CurrencyAmountSmall = styled.p<CurrentAmountProps>`
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.05rem;
  margin: 0;

  color: ${(props) => (props.$positive ? COLORS.success : COLORS.text)};

  &::before {
    content: "${(props) => (props.$positive ? "+" : "")}";
  }
`;
