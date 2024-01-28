export const iconSizeMapper = {
  "2xs": 8,
  xs: 12,
  sm: 14,
  "1x": 16,
  lg: 21,
  "2x": 32,
  "3x": 48,
  "4x": 64,
  "5x": 80,
  "6x": 96,
  "7x": 112,
  "8x": 128,
  "9x": 144,
  "10x": 160,
};

export const faSizeToPixelSize = (size?: string) => {
  return iconSizeMapper[size as keyof typeof iconSizeMapper] || 16;
};
