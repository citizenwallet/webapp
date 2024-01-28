"use client";

import { COLORS } from "@/theme/colors";
import styled from "styled-components";

export const Main = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;

  min-height: 100dvh;
  width: 100dvw;

  overflow: auto;
`;

interface LayoutProps {
  $horizontal?: "start" | "center" | "end" | "space-between" | "space-around";
  $vertical?: "start" | "center" | "end";
  $fill?: boolean;
}

export const Row = styled.div<LayoutProps>`
  display: flex;
  flex-direction: row;
  justify-content: ${(props) => props.$horizontal || "flex-start"};
  align-items: ${(props) => props.$vertical || "center"};

  height: ${(props) => (props.$fill ? "100%" : "auto")};
  width: 100%;
`;

export const Column = styled.div<LayoutProps>`
  display: flex;
  flex-direction: column;
  justify-content: ${(props) => props.$vertical || "flex-start"};
  align-items: ${(props) => props.$horizontal || "center"};

  height: 100%;
  width: ${(props) => (props.$fill ? "100%" : "auto")};
`;

export const Expanded = styled.div`
  flex: 1;
`;

export const HeaderBar = styled.header`
  position: fixed;
  top: 0;
  left: 0;

  z-index: 9999;

  background-color: #ffffff;

  padding: 1rem;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  align-content: center;

  height: 60px;
  width: 100%;

  margin-bottom: 1rem;
`;

export const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  padding-top: 60px;
  padding-bottom: 60px;

  width: 90%;
  max-width: 1200px;
`;

export const FooterBar = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;

  z-index: 9999;

  padding: 1rem;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  align-content: center;

  height: 60px;
  width: 100%;

  margin-top: 1rem;
`;

interface VerticalSpacerProps {
  $spacing?: number;
}

export const HorizontalSpacer = styled.div<VerticalSpacerProps>`
  width: ${(props) => props.$spacing ?? 1}rem;
`;

interface VerticalSpacerProps {
  $spacing?: number;
}

export const VerticalSpacer = styled.div<VerticalSpacerProps>`
  height: ${(props) => props.$spacing ?? 1}rem;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;

  background-color: ${COLORS.divider};
`;
