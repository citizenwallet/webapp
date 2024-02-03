"use client";

import { COLORS } from "@/theme/colors";
import styled, { css } from "styled-components";

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
