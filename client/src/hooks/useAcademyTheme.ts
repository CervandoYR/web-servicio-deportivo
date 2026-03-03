import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';

function hexToHsl(hex: string): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function useAcademyTheme() {
  const primaryColor = useAuthStore((s) => s.academy?.primaryColor);

  useEffect(() => {
    const color = primaryColor || '#3B82F6';
    const [h, s, l] = hexToHsl(color);
    const root = document.documentElement;
    root.style.setProperty('--primary-50', `hsl(${h}, ${s}%, 97%)`);
    root.style.setProperty('--primary-100', `hsl(${h}, ${s}%, 93%)`);
    root.style.setProperty('--primary-200', `hsl(${h}, ${s}%, 86%)`);
    root.style.setProperty('--primary-300', `hsl(${h}, ${s}%, 76%)`);
    root.style.setProperty('--primary-400', `hsl(${h}, ${s}%, 63%)`);
    root.style.setProperty('--primary-500', `hsl(${h}, ${s}%, ${l}%)`);
    root.style.setProperty('--primary-600', `hsl(${h}, ${s}%, ${Math.max(l - 8, 10)}%)`);
    root.style.setProperty('--primary-700', `hsl(${h}, ${s}%, ${Math.max(l - 16, 8)}%)`);
    root.style.setProperty('--primary-800', `hsl(${h}, ${s}%, ${Math.max(l - 22, 6)}%)`);
    root.style.setProperty('--primary-900', `hsl(${h}, ${s}%, ${Math.max(l - 28, 4)}%)`);
  }, [primaryColor]);
}
