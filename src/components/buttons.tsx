"use client";
import styled, { CSSProperties, css } from "styled-components";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { COLORS } from "@/theme/colors";
import { faSizeToPixelSize } from "@/theme/iconSizeMapper";
import { MouseEventHandler } from "react";

interface IconButtonProps {
  $shadow?: boolean;
  $color?: string;
  $backgroundColor?: string;
  size?: string;
  style?: CSSProperties | undefined;
  onClick?: MouseEventHandler<SVGSVGElement> | undefined;
}

const ButtonShadow = css`
  box-shadow: 0px 4px 15px rgba(41.17, 6.73, 85, 0.12);
`;

const BaseIconButton = css`
  cursor: pointer;
  outline: none;
  padding: 16px;
  margin: 0;

  border-radius: 50%;
`;

const BaseIconButtonDimensions = css<IconButtonProps>`
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
  ${BaseIconButtonDimensions}
  ${(props) => props.$shadow && ButtonShadow}

  background-color: ${(props) => props.$backgroundColor || COLORS.primary};
  color: ${(props) => props.$color || COLORS.white};

  border: solid 3px ${(props) => props.$color || COLORS.primary};
`;

export const AltIconButton = styled(FontAwesomeIcon)<IconButtonProps>`
  ${BaseIconButton}
  ${BaseIconButtonDimensions}
  ${(props) => props.$shadow && ButtonShadow}

  background-color: ${(props) => props.$backgroundColor || COLORS.secondary};
  color: ${(props) => props.$color || COLORS.primary};

  border: solid 3px ${(props) => props.$color || COLORS.secondary};
`;

const IconButtonContainer = styled.div<IconButtonProps>`
  ${BaseIconButton}
  ${(props) => props.$shadow && ButtonShadow}

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${(props) => props.$backgroundColor || COLORS.white};
  color: ${(props) => props.$color || COLORS.primary};

  border: solid 3px ${(props) => props.$color || COLORS.primary};

  height: ${(props) => `${faSizeToPixelSize(props.size) * 2}px`};
  width: ${(props) => `${faSizeToPixelSize(props.size) * 2}px`};
`;

// in trying to keep things simple, this component got a bit convoluted
// this was done because Safari clips the svg icon even when you set a border radius there is enough space
export const OutlinedIconButton = ({
  $shadow,
  $color,
  $backgroundColor,
  size,
  style,
  onClick,
  ...props
}: FontAwesomeIconProps & IconButtonProps) => (
  <IconButtonContainer
    $shadow={$shadow}
    $color={$color}
    $backgroundColor={$backgroundColor}
    size={size}
    style={style}
    onClick={onClick}
  >
    <FontAwesomeIcon size={size} {...props} />
  </IconButtonContainer>
);

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
