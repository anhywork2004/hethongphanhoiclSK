import { colors } from "@/constants/colors";

// Shared presentation tokens used across screens so cards, buttons and
// shadows feel consistent. Pure styling constants — no business logic.

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  pill: 999,
};

// Thin-border card style used throughout the redesigned screens instead of
// heavy shadows — a hairline border plus a very light shadow for depth.
export const cardBorder = {
  borderWidth: 1,
  borderColor: colors.border,
};

export const cardShadow = {
  shadowColor: colors.shadow,
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export const softShadow = {
  shadowColor: colors.shadow,
  shadowOpacity: 0.03,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};

export const raisedShadow = {
  shadowColor: colors.shadow,
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};
