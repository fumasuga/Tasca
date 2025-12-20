import { Platform } from 'react-native';

export type ThemeMode = 'dark' | 'light';

// Dark Theme
const darkColors = {
  bg: {
    primary: '#0D0D12',
    secondary: '#13131A',
    tertiary: '#1A1A24',
    elevated: '#22222E',
    card: '#16161F',
  },
  accent: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    tertiary: '#A78BFA',
    glow: 'rgba(99, 102, 241, 0.3)',
    subtle: 'rgba(99, 102, 241, 0.1)',
  },
  success: {
    primary: '#10B981',
    secondary: '#34D399',
    glow: 'rgba(16, 185, 129, 0.3)',
    subtle: 'rgba(16, 185, 129, 0.1)',
  },
  warning: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  error: {
    primary: '#EF4444',
    secondary: '#F87171',
    glow: 'rgba(239, 68, 68, 0.3)',
    subtle: 'rgba(239, 68, 68, 0.1)',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    muted: '#6B7280',
    disabled: '#4B5563',
  },
  border: {
    primary: '#27272F',
    secondary: '#333340',
    focus: '#6366F1',
    subtle: 'rgba(255, 255, 255, 0.06)',
  },
  glass: {
    bg: 'rgba(22, 22, 31, 0.8)',
    border: 'rgba(255, 255, 255, 0.08)',
  },
};

// Light Theme
const lightColors = {
  bg: {
    primary: '#FAFBFC',
    secondary: '#F3F4F6',
    tertiary: '#E5E7EB',
    elevated: '#FFFFFF',
    card: '#FFFFFF',
  },
  accent: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    tertiary: '#A78BFA',
    glow: 'rgba(99, 102, 241, 0.2)',
    subtle: 'rgba(99, 102, 241, 0.08)',
  },
  success: {
    primary: '#10B981',
    secondary: '#34D399',
    glow: 'rgba(16, 185, 129, 0.2)',
    subtle: 'rgba(16, 185, 129, 0.08)',
  },
  warning: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.2)',
  },
  error: {
    primary: '#EF4444',
    secondary: '#F87171',
    glow: 'rgba(239, 68, 68, 0.2)',
    subtle: 'rgba(239, 68, 68, 0.08)',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    muted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  border: {
    primary: '#E5E7EB',
    secondary: '#D1D5DB',
    focus: '#6366F1',
    subtle: 'rgba(0, 0, 0, 0.04)',
  },
  glass: {
    bg: 'rgba(255, 255, 255, 0.9)',
    border: 'rgba(0, 0, 0, 0.08)',
  },
};

export const getColors = (mode: ThemeMode) => mode === 'dark' ? darkColors : lightColors;

// Default export for backward compatibility
export const colors = darkColors;

// Platform-specific shadow styles
const createShadow = (color: string, offsetY: number, opacity: number, radius: number, elevation: number) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0 ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};

const createGlow = (color: string, radius: number, opacity: number, elevation: number) => {
  if (Platform.OS === 'web') {
    const webColor = color.replace(/,\s*1\)$/, `, ${opacity})`);
    return {
      boxShadow: `0 0 ${radius}px ${webColor}`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};

export const shadows = {
  sm: createShadow('#000', 2, 0.25, 4, 2),
  md: createShadow('#000', 4, 0.3, 8, 4),
  lg: createShadow('#000', 8, 0.4, 16, 8),
  glow: createGlow('rgba(99, 102, 241, 1)', 20, 0.4, 8),
  successGlow: createGlow('rgba(16, 185, 129, 1)', 16, 0.4, 6),
};

export const getShadows = (mode: ThemeMode) => {
  const opacity = mode === 'dark' ? 0.4 : 0.15;
  return {
    sm: createShadow('#000', 2, opacity * 0.6, 4, 2),
    md: createShadow('#000', 4, opacity * 0.75, 8, 4),
    lg: createShadow('#000', 8, opacity, 16, 8),
    glow: createGlow('rgba(99, 102, 241, 1)', 20, opacity, 8),
    successGlow: createGlow('rgba(16, 185, 129, 1)', 16, opacity, 6),
  };
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 14,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 26,
  '3xl': 34,
};
