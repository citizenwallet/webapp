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

export const HeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;

  background-color: ${COLORS.background};

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  height: 60px;
  width: 100%;

  padding: 1rem;
`;

export const ActionBar = styled.div`
  position: fixed;
  top: 60px;
  left: 0;

  background-color: ${COLORS.background};

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  min-height: 300px;
  width: 100%;

  padding-bottom: 1rem;

  ${fadeIn}
`;

export const ActionBarSmall = styled.div`
  position: fixed;
  top: 60px;
  left: 0;

  background-color: ${COLORS.background};

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  min-height: 100px;
  width: 100%;

  padding-bottom: 1rem;

  ${fadeIn}
`;

export const ChildWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  height: 100%;
  width: 100%;

  padding-top: 2rem;

  margin-top: 360px;
`;

export const ContentWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  min-height: 100dvh;
  width: 100%;
`;
