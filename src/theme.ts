export const colors = {
  background: "#0B0F14",
  backgroundAlt: "#10161D",
  surface: "#121820",
  surfaceHigh: "#18212B",
  line: "#2A3542",
  text: "#F4F7FB",
  muted: "#7F8B99",
  soft: "#C5CDD8",
  orange: "#D97706",
  orangeLight: "#F59E0B",
  purple: "#6D5BD0",
  blue: "#2563EB",
  emerald: "#059669",
  red: "#DC2626",
  yellow: "#FFC247",
  white: "#FFFFFF",
  black: "#05070D"
};

export const gradients = {
  primary: ["#B45309", colors.orange],
  cool: ["#334155", "#475569"],
  success: [colors.emerald, "#10B981"],
  hero: [colors.background, colors.backgroundAlt]
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

export const radii = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 8,
  pill: 999
};

export const shadows = {
  glow: {
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  card: {
    shadowColor: colors.black,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  }
};
