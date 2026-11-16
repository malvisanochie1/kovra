const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

function parse(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  const int = Number.parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

const toHex = (rgb: number[]) => `#${rgb.map((c) => clamp(c).toString(16).padStart(2, '0')).join('')}`;

/** Mixes a colour towards white (`amount` > 0) or black (`amount` < 0). */
export function shade(hex: string, amount: number): string {
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  return toHex(parse(hex).map((c) => c + (target - c) * t));
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parse(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Perceived brightness from 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const [r, g, b] = parse(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
