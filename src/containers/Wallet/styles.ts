"use client";

import styled from "styled-components";

export const TransactionListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  overflow-y: auto;

  height: 100%;
  width: 100%;
`;

interface WhiteGradientProps {
  $direction?: "top" | "bottom";
}

export const WhiteGradient = styled.div<WhiteGradientProps>`
  background: linear-gradient(
    to ${(props) => props.$direction ?? "top"},
    white,
    transparent
  );

  height: 40px;
  width: 100%;
`;
