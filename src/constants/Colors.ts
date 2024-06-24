const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0'); // Convert to Hex and pad with 0
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Example conversion from HSL to Hex
const colors = {
  light: {
    background: hslToHex(0, 0, 100),
    foreground: hslToHex(0, 0, 3.9),
    card: hslToHex(0, 0, 100),
    cardForeground: hslToHex(0, 0, 3.9),
    popover: hslToHex(0, 0, 100),
    popoverForeground: hslToHex(0, 0, 3.9),
    primary: hslToHex(0, 0, 9),
    primaryForeground: hslToHex(0, 0, 98),
    secondary: hslToHex(0, 0, 96.1),
    secondaryForeground: hslToHex(0, 0, 9),
    muted: hslToHex(0, 0, 96.1),
    mutedForeground: hslToHex(0, 0, 45.1),
    accent: hslToHex(0, 0, 96.1),
    accentForeground: hslToHex(0, 0, 9),
    destructive: hslToHex(0, 84.2, 60.2),
    destructiveForeground: hslToHex(0, 0, 98),
    border: hslToHex(0, 0, 89.8),
    input: hslToHex(0, 0, 89.8),
    ring: hslToHex(0, 0, 3.9),
  },
  dark: {
    background: hslToHex(0, 0, 3.9),
    foreground: hslToHex(0, 0, 98),
    card: hslToHex(0, 0, 3.9),
    cardForeground: hslToHex(0, 0, 98),
    popover: hslToHex(0, 0, 3.9),
    popoverForeground: hslToHex(0, 0, 98),
    primary: hslToHex(0, 0, 98),
    primaryForeground: hslToHex(0, 0, 9),
    secondary: hslToHex(0, 0, 14.9),
    secondaryForeground: hslToHex(0, 0, 98),
    muted: hslToHex(0, 0, 14.9),
    mutedForeground: hslToHex(0, 0, 63.9),
    accent: hslToHex(0, 0, 14.9),
    accentForeground: hslToHex(0, 0, 98),
    destructive: hslToHex(0, 62.8, 30.6),
    destructiveForeground: hslToHex(0, 0, 98),
    border: hslToHex(0, 0, 14.9),
    input: hslToHex(0, 0, 14.9),
    ring: hslToHex(0, 0, 83.1),
  }
};

export const Colors = {
  light: {
    primary: colors.light.primary,
    primaryForeground: colors.light.primaryForeground,
    secondary: colors.light.secondary,
    secondaryForeground: colors.light.secondary,
    background: colors.light.background,
    foreground: colors.light.foreground,
    card: colors.light.card,
    cardForeground: colors.light.cardForeground,
    popover: colors.light.popover,
    popoverForeground: colors.light.popoverForeground,
    muted: colors.light.muted,
    mutedForeground: colors.light.mutedForeground,
    accent: colors.light.accent,
    accentForeground: colors.light.accentForeground,  
    destructive: colors.light.destructive,
    destructiveForeground: colors.light.destructiveForeground,
    border: colors.light.border,
    input: colors.light.input,
    ring: colors.light.ring,
  },
  dark: {
    primary: colors.dark.primary,
    primaryForeground: colors.dark.primaryForeground,
    secondary: colors.dark.secondary,
    secondaryForeground: colors.dark.secondary,
    background: colors.dark.background,
    foreground: colors.dark.foreground,
    card: colors.dark.card,
    cardForeground: colors.dark.cardForeground,
    popover: colors.dark.popover,
    popoverForeground: colors.dark.popoverForeground,
    muted: colors.dark.muted,
    mutedForeground: colors.dark.mutedForeground,
    accent: colors.dark.accent,
    accentForeground: colors.dark.accentForeground,  
    destructive: colors.dark.destructive,
    destructiveForeground: colors.dark.destructiveForeground,
    border: colors.dark.border,
    input: colors.dark.input,
    ring: colors.dark.ring,
  }
};
