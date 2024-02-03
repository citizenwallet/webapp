"use client";

import { COLORS } from "@/theme/colors";
import styled, { css } from "styled-components";

const fadeIn = css`
  /* Add these lines */
  opacity: 0;
  animation: fadeIn 0.25s ease-in-out forwards;

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

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

interface ActionsWrapperProps {
  $show?: boolean;
}

export const ActionBar = styled.div`
  position: fixed;
  top: 60px;
  left: 0;

  background: linear-gradient(
    to bottom,
    ${COLORS.background} 0%,
    ${COLORS.background} 95%,
    transparent 100%
  );

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  min-height: 300px;
  width: 100%;

  padding-bottom: 2rem;

  ${fadeIn}
`;

export const ActionBarSmall = styled.div`
  position: fixed;
  top: 60px;
  left: 0;

  background: linear-gradient(
    to bottom,
    ${COLORS.background} 0%,
    ${COLORS.background} 85%,
    transparent 100%
  );

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  min-height: 100px;
  width: 100%;

  padding-bottom: 2rem;

  ${fadeIn}
`;

export const ActionsWrapper = styled.div<ActionsWrapperProps>`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  width: 100%;

  overflow: hidden;

  // on appear fade in and increase height
  transition: all 0.25s ease-in-out;

  ${(props) =>
    props.$show
      ? css`
          opacity: 1;

          max-height: 200px;
        `
      : css`
          opacity: 0;

          max-height: 0px;
        `}
`;
