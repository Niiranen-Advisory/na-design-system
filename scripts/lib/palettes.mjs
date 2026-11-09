// Shared by the cut-* scripts. Fallback values baked into generated files;
// they mirror tokens.css (light) and palettes/licensing-guide.css (dark).
export const SLASH = 20; // degrees, the brand slash
export const TAN = Math.tan((SLASH * Math.PI) / 180);

export const PALETTES = {
  light: {
    bg: '#ffffff', raised: '#eeeeeb', ink: '#1a1a18', muted: '#55534d', border: '#cfccc3',
    accent: '#7a2e1c', plateBg: '#0b0b0b', plateBorder: '#2c2a27', plateAccent: '#d06a4e',
    plateInk: '#ffffff', plateMuted: '#a8a29a',
  },
  dark: {
    bg: '#181110', raised: '#241a17', ink: '#efe9e6', muted: '#a89f9a', border: '#3a2c27',
    accent: '#e07a4f', plateBg: '#000000', plateBorder: '#262320', plateAccent: '#e07a4f',
    plateInk: '#ffffff', plateMuted: '#9b968d',
  },
};

export const MONO = 'SFMono-Regular,Consolas,"Liberation Mono",Menlo,monospace';
export const v = (name, fb) => `var(--na-color-${name},${fb})`;
export const f = (n) => +n.toFixed(1);
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Resolve var(--x, fallback) to the fallback. Office renderers ignore CSS custom properties. */
export const bake = (svg) => svg.replace(/var\(--[\w-]+,\s*([^)]+)\)/g, '$1');
