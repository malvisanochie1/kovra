/**
 * JS mirror of the tokens in `src/global.css`, for the few places that need raw
 * values: gradients, SVG fills and animated colour interpolation.
 */
export const colors = {
  ink: '#05070F',
  ink2: '#0A0F1E',
  ink3: '#111933',
  ink4: '#1A2448',
  edge: 'rgba(255,255,255,0.08)',
  gold: '#E3BF6E',
  goldSoft: '#F4DEA4',
  goldDeep: '#B48A3A',
  azure: '#5B7CFF',
  snow: '#F3F5FA',
  mist: '#9BA5C2',
  dim: '#5F6A8A',
  success: '#3FD69A',
  danger: '#FF6B7A',
} as const;

export const gradients = {
  gold: [colors.goldSoft, colors.gold, colors.goldDeep] as const,
  night: [colors.ink3, colors.ink2, colors.ink] as const,
  glass: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)'] as const,
};
