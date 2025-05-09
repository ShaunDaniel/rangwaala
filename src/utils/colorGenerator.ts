type HarmonyRule = 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'splitComplementary' | 'monochromatic';

interface ColorPalette {
  colors: string[];
  harmony: HarmonyRule;
}

/**
 * Keeps hue values within the standard 0-360 degree range
 * This handles cases where calculations might result in negative values or values > 360
 */
const normalizeHue = (hue: number): number => {
  return ((hue % 360) + 360) % 360;
};

/**
 * Converts HSL (Hue, Saturation, Lightness) color to HEX format
 * 
 * @param hue - Color angle on the color wheel (0-360)
 * @param saturation - Color intensity (0-100)
 * @param lightness - Brightness of color (0-100)
 * @returns Hex color code (e.g. #FF5733)
 */
const hslToHex = (hue: number, saturation: number, lightness: number): string => {
  // Normalize values to the 0-1 range that the conversion algorithm expects
  hue /= 360;
  saturation /= 100;
  lightness /= 100;
  let red, green, blue;

  if (saturation === 0) {
    // Achromatic (gray) case - all RGB values are equal to lightness
    red = green = blue = lightness;
  } else {
    // Helper function for the HSL to RGB conversion algorithm
    // Handles the different cases based on which color segment we're in
    const calculateColorComponent = (primaryComp: number, secondaryComp: number, hueSegment: number) => {
      if (hueSegment < 0) hueSegment += 1;
      if (hueSegment > 1) hueSegment -= 1;
      if (hueSegment < 1/6) return primaryComp + (secondaryComp - primaryComp) * 6 * hueSegment;
      if (hueSegment < 1/2) return secondaryComp;
      if (hueSegment < 2/3) return primaryComp + (secondaryComp - primaryComp) * (2/3 - hueSegment) * 6;
      return primaryComp;
    };

    // Calculate temporary values needed for the RGB conversion
    const tempComponent = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    const primaryComponent = 2 * lightness - tempComponent;
    
    // Calculate RGB values based on the hue
    red = calculateColorComponent(primaryComponent, tempComponent, hue + 1/3);
    green = calculateColorComponent(primaryComponent, tempComponent, hue);
    blue = calculateColorComponent(primaryComponent, tempComponent, hue - 1/3);
  }

  // Convert RGB values (0-1) to hexadecimal
  const componentToHex = (colorComponent: number) => {
    const hex = Math.round(colorComponent * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex; // Ensure two-digit format
  };

  return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`;
};

/**
 * Generates a color palette based on a randomly selected harmony rule
 * 
 * @returns Object containing an array of color codes and the harmony rule used
 */
export const generatePalette = (): ColorPalette => {
  // Available color harmony patterns
  const harmonyRules: HarmonyRule[] = [
    'analogous',        // Colors adjacent to each other on the color wheel
    'complementary',    // Colors opposite each other on the color wheel
    'triadic',          // Three colors evenly spaced on the color wheel
    'tetradic',         // Four colors forming a rectangle on the color wheel
    'splitComplementary', // Base color plus two colors adjacent to its complement
    'monochromatic'     // Single hue with variations in saturation and lightness
  ];
  
  // Pick a random harmony rule
  const selectedHarmony = harmonyRules[Math.floor(Math.random() * harmonyRules.length)];
  
  // Generate base hue (0-360 degrees on the color wheel)
  const baseHue = Math.floor(Math.random() * 360);
  
  // Default saturation and lightness values for vibrant but balanced colors
  const baseSaturation = 70; // Higher values are more vivid (0-100)
  const baseLightness = 60;  // Mid-range for good visibility (0-100)
  
  let paletteHues: number[] = [];
  
  // Calculate related hues based on the selected harmony rule
  switch (selectedHarmony) {
    case 'analogous':
      // Adjacent colors (±30° and ±15° from base)
      paletteHues = [
        normalizeHue(baseHue - 30), // Further left on color wheel
        normalizeHue(baseHue - 15), // Left on color wheel
        baseHue,                    // Base color
        normalizeHue(baseHue + 15), // Right on color wheel
        normalizeHue(baseHue + 30)  // Further right on color wheel
      ];
      break;
      
    case 'complementary':
      // Base + complement (180° opposite) with transition colors
      paletteHues = [
        baseHue,                      // Base color
        normalizeHue(baseHue + 30),   // Transition color
        normalizeHue(baseHue + 60),   // Transition color
        normalizeHue(baseHue + 150),  // Near complement
        normalizeHue(baseHue + 180)   // True complement
      ];
      break;
      
    case 'triadic':
      // Three colors spaced 120° apart with transitions
      paletteHues = [
        baseHue,                     // Base color
        normalizeHue(baseHue + 60),  // Transition to second triadic
        normalizeHue(baseHue + 120), // Second triadic color
        normalizeHue(baseHue + 180), // Transition to third triadic
        normalizeHue(baseHue + 240)  // Third triadic color
      ];
      break;
      
    case 'tetradic':
      // Four colors forming a rectangle on the color wheel
      paletteHues = [
        baseHue,                     // Base color
        normalizeHue(baseHue + 90),  // Second color (90° from base)
        normalizeHue(baseHue + 180), // Third color (180° from base)
        normalizeHue(baseHue + 270), // Fourth color (270° from base)
        normalizeHue(baseHue + 45)   // Transition color for variety
      ];
      break;
      
    case 'splitComplementary':
      // Base color plus colors on either side of its complement
      paletteHues = [
        baseHue,                      // Base color
        normalizeHue(baseHue + 60),   // Transition color
        normalizeHue(baseHue + 120),  // Transition color
        normalizeHue(baseHue + 150),  // Left of complement (180° - 30°)
        normalizeHue(baseHue + 210)   // Right of complement (180° + 30°)
      ];
      break;
      
    case 'monochromatic':
      // Same hue with varied saturation and lightness for depth
      return {
        harmony: selectedHarmony,
        colors: [
          hslToHex(baseHue, baseSaturation - 20, baseLightness + 15), // Lighter, less saturated
          hslToHex(baseHue, baseSaturation - 10, baseLightness + 5),  // Light variant
          hslToHex(baseHue, baseSaturation, baseLightness),           // Base color
          hslToHex(baseHue, baseSaturation + 5, baseLightness - 10),  // Darker variant
          hslToHex(baseHue, baseSaturation + 10, baseLightness - 20)  // Darkest, most saturated
        ]
      };
      
    default:
      paletteHues = [baseHue, baseHue, baseHue, baseHue, baseHue];
  }
  
  // Convert each hue to a hex color using the base saturation and lightness
  const colorCodes = paletteHues.map(hue => hslToHex(hue, baseSaturation, baseLightness));
  
  return { colors: colorCodes, harmony: selectedHarmony };
};