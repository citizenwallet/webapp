"use client";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { COLORS } from "@/theme/colors";
import { faSizeToPixelSize, iconSizeMapper } from "@/theme/iconSizeMapper";

interface IconButtonProps {
  $color?: string;
  $backgroundColor?: string;
  size?: string;
}

const BaseIconButton = css<IconButtonProps>`
  cursor: pointer;
  outline: none;
  padding: 16px;
  margin: 0;

  border-radius: 50%;

  height: ${(props) => `${faSizeToPixelSize(props.size)}px`};
  width: ${(props) => `${faSizeToPixelSize(props.size)}px`};
`;

export const IconButton = styled(FontAwesomeIcon)<IconButtonProps>`
  ${BaseIconButton}

  background-color: ${(props) => props.$backgroundColor || COLORS.primary};
  color: ${(props) => props.$color || COLORS.white};

  border: solid 3px ${(props) => props.$color || COLORS.primary};
`;

export const AltIconButton = styled(FontAwesomeIcon)<IconButtonProps>`
  ${BaseIconButton}

  background-color: ${(props) => props.$backgroundColor || COLORS.secondary};
  color: ${(props) => props.$color || COLORS.primary};

  border: solid 3px ${(props) => props.$color || COLORS.secondary};
`;

export const OutlinedIconButton = styled(FontAwesomeIcon)<IconButtonProps>`
  ${BaseIconButton}

  background-color: ${(props) => props.$backgroundColor || COLORS.white};
  color: ${(props) => props.$color || COLORS.primary};

  border: solid 3px ${(props) => props.$color || COLORS.primary};
`;

export const PrimaryButton = styled.button`
  height: 50px;
  padding: 5px 2rem;
  margin: 0;

  font-size: 1.2rem;
  color: ${COLORS.white};

  background-color: ${COLORS.primary};
  border: none;
  outline: none;

  border-radius: 25px;

  cursor: pointer;
`;

export const OutlinedPrimaryButton = styled.button`
  height: 50px;
  padding: 5px 2rem;
  margin: 0;

  font-size: 1.2rem;
  color: ${COLORS.primary};

  background-color: ${COLORS.white};
  border: none;
  outline: none;

  border-radius: 25px;
  border: solid 3px ${COLORS.primary};

  cursor: pointer;
`;
