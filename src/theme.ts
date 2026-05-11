export const colors = {
  background: "#080D18",
  backgroundAlt: "#0D1424",
  surface: "#121A2C",
  surfaceHigh: "#18233A",
  line: "#263148",
  text: "#F7FAFF",
  muted: "#9AA7BD",
  soft: "#CBD5E1",
  orange: "#FF7A00",
  orangeLight: "#FFB347",
  purple: "#7C3AED",
  blue: "#2F80ED",
  emerald: "#00D084",
  red: "#FF4D67",
  yellow: "#FFC247",
  white: "#FFFFFF",
  black: "#05070D"
};

export const gradients = {
  primary: [colors.orange, colors.orangeLight],
  cool: [colors.purple, colors.blue],
  success: [colors.emerald, "#6EE7B7"],
  hero: ["#0A0F1C", "#101A31", "#21142B"]
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
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  pill: 999
};

export const shadows = {
  glow: {
    shadowColor: colors.orange,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  }
};
