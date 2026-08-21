/**
 * Professional design system for a premium fintech app.
 */

import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F1117',
    textSecondary: '#64748B',
    background: '#F2F4FC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8ECFF',
    accent: '#6366F1',
    accentSoft: '#EEF0FF',
    border: 'rgba(0,0,0,0.07)',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    card: '#FFFFFF',
  },
  dark: {
    text: '#E8EAFF',
    textSecondary: '#6B7280',
    background: '#0C0E1A',
    backgroundElement: '#161828',
    backgroundSelected: '#1E2238',
    accent: '#818CF8',
    accentSoft: '#1E1F3A',
    border: 'rgba(255,255,255,0.07)',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    card: '#161828',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
