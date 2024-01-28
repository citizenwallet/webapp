"use client";

import { COLORS } from "@/theme/colors";
import styled from "styled-components";

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

export const Text = styled.p`
  font-size: 1rem;
  font-weight: 300;
  margin: 0;
`;

export const TextBold = styled.p`
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
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
