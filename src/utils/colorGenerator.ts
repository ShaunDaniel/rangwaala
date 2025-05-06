type HarmonyRule = 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'splitComplementary' | 'monochromatic';

interface ColorPalette {
  colors: string[];
  harmony: HarmonyRule;
}

/**
 * Normalizes a hue value to be within 0-360 range
 */
const normalizeHue = (hue: number): number => {
  return ((hue % 360) + 360) % 360;
};

/**
 * Converts HSL color to HEX
 */
const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Generates a color palette based on a harmony rule
 */
export const generatePalette = (): ColorPalette => {
  // Randomly select a harmony rule
  const harmonyRules: HarmonyRule[] = [
    'analogous', 
    'complementary', 
    'triadic', 
    'tetradic', 
    'splitComplementary', 
    'monochromatic'
  ];
  
  const harmony = harmonyRules[Math.floor(Math.random() * harmonyRules.length)];
  
  // Generate base hue (0-360)
  const baseHue = Math.floor(Math.random() * 360);
  
  // Default saturation and lightness values
  const baseSaturation = 70; // 0-100
  const baseLightness = 60; // 0-100
  
  let hues: number[] = [];
  
  // Calculate related hues based on the harmony rule
  switch (harmony) {
    case 'analogous':
      hues = [
        normalizeHue(baseHue - 30),
        normalizeHue(baseHue - 15),
        baseHue,
        normalizeHue(baseHue + 15),
        normalizeHue(baseHue + 30)
      ];
      break;
      
    case 'complementary':
      hues = [
        baseHue,
        normalizeHue(baseHue + 30),
        normalizeHue(baseHue + 60),
        normalizeHue(baseHue + 180 - 30),
        normalizeHue(baseHue + 180)
      ];
      break;
      
    case 'triadic':
      hues = [
        baseHue,
        normalizeHue(baseHue + 60),
        normalizeHue(baseHue + 120),
        normalizeHue(baseHue + 180),
        normalizeHue(baseHue + 240)
      ];
      break;
      
    case 'tetradic':
      hues = [
        baseHue,
        normalizeHue(baseHue + 90),
        normalizeHue(baseHue + 180),
        normalizeHue(baseHue + 270),
        normalizeHue(baseHue + 45)
      ];
      break;
      
    case 'splitComplementary':
      hues = [
        baseHue,
        normalizeHue(baseHue + 60),
        normalizeHue(baseHue + 120),
        normalizeHue(baseHue + 180 - 30),
        normalizeHue(baseHue + 180 + 30)
      ];
      break;
      
    case 'monochromatic':
      // For monochromatic, we keep the same hue but vary saturation and lightness
      return {
        harmony,
        colors: [
          hslToHex(baseHue, baseSaturation - 20, baseLightness + 15),
          hslToHex(baseHue, baseSaturation - 10, baseLightness + 5),
          hslToHex(baseHue, baseSaturation, baseLightness),
          hslToHex(baseHue, baseSaturation + 5, baseLightness - 10),
          hslToHex(baseHue, baseSaturation + 10, baseLightness - 20)
        ]
      };
      
    default:
      hues = [baseHue, baseHue, baseHue, baseHue, baseHue];
  }
  
  // Convert HSL to HEX colors
  const colors = hues.map(hue => hslToHex(hue, baseSaturation, baseLightness));
  
  return { colors, harmony };
};