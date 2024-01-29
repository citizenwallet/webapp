"use client";

import styled, { css } from "styled-components";

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
