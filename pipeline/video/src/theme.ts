// Unsupervised Voice palette: white page, near-black ink, red accent (matches the astronaut).
export const colors = {
  paper: "#FFFFFF",
  ink: "#0D0D10",
  red: "#D62839",
  redLight: "#FF5A5F",
  redDark: "#8E1B2A",
  muted: "#6B6B76",
} as const;

// Open-licensed fonts are still an open item; this is a system stack for now.
export const fonts = {
  sans: '"Segoe UI", "Helvetica Neue", Arial, system-ui, sans-serif',
} as const;

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
