import {Platform} from 'react-native';

// ─── Colors ──────────────────────────────────────────────────────────────────

export const Colors = {
  // Primary
  primary: '#0078D4',
  primaryDark: '#005A9E',
  primaryLight: '#DEECF9',
  primaryFaded: '#0078D415',

  // Secondary
  secondary: '#2B88D8',
  secondaryDark: '#106EBE',
  secondaryLight: '#C7E0F4',

  // Background
  background: '#F5F7FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Borders & Dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',

  // Scopes
  scope1: '#EF4444',
  scope1Light: '#FEE2E2',
  scope2: '#F59E0B',
  scope2Light: '#FEF3C7',
  scope3: '#8B5CF6',
  scope3Light: '#EDE9FE',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.5)',
  skeleton: '#E5E7EB',
  disabled: '#D1D5DB',
  placeholder: '#9CA3AF',

  // Badge
  badgeDraft: '#F59E0B',
  badgeSubmitted: '#10B981',
  badgeFailed: '#EF4444',
};

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

// ─── Border Radius ───────────────────────────────────────────────────────────

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
  }),
  cardHover: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  }),
  button: Platform.select({
    ios: {
      shadowColor: '#0078D4',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  none: Platform.select({
    ios: {
      shadowColor: 'transparent',
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    android: {
      elevation: 0,
    },
  }),
};

// ─── Typography ──────────────────────────────────────────────────────────────

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
    color: Colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: Colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: Colors.text,
  },
  h4: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: Colors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: Colors.text,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: Colors.textTertiary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
};

// ─── Layout ──────────────────────────────────────────────────────────────────

export const Layout = {
  screenPadding: Spacing.lg,
  cardPadding: Spacing.lg,
  sectionSpacing: Spacing.xxl,
  inputHeight: 48,
  buttonHeight: 48,
  tabBarHeight: 60,
  headerHeight: 56,
};

// ─── Theme Export ────────────────────────────────────────────────────────────

const Theme = {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
  Typography,
  Layout,
};

export default Theme;
