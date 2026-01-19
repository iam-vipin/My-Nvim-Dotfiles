/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

/**
 * Theme System Public API
 * Exports all theme-related utilities for use across Plane apps
 */

// Palette generation
export {
  calculateDynamicValueStop,
  generateColorPalette,
  generateThemePalettes,
  type ColorPalette,
  type PaletteOptions,
} from "./palette-generator";

// Theme application
export {
  applyCustomTheme,
  clearCustomTheme,
  isColorDark,
  getOnColorTextColors,
  type DarknessDetectionMethod,
} from "./theme-application";

// Color conversion utilities
export {
  hexToHSL,
  hexToOKLCH,
  hexToOKLCHString,
  // hexToRgb,
  isGrayscale,
  oklchToCSS,
  parseOKLCH,
  getRelativeLuminance,
  getPerceptualBrightness,
  // rgbToHex,
  type OKLCH,
  type RGB,
} from "./color-conversion";

// Color validation
export { normalizeHexColor, validateHexColor } from "./color-validation";

// Theme inversion (dark mode)
export { getBrandMapping, getNeutralMapping, invertPalette } from "./theme-inversion";

// Constants
export {
  BASELINE_LIGHTNESS_MAP,
  type ColorMode,
  DEFAULT_COLOR_MODE,
  DEFAULT_HUE_SHIFT_BRAND,
  DEFAULT_HUE_SHIFT_NEUTRAL,
  DEFAULT_LIGHT_MODE_LIGHTNESS_MAX,
  DEFAULT_LIGHT_MODE_LIGHTNESS_MIN,
  DEFAULT_DARK_MODE_LIGHTNESS_MAX,
  DEFAULT_DARK_MODE_LIGHTNESS_MIN,
  DEFAULT_SATURATION_CURVE,
  DEFAULT_VALUE_STOP,
  type SaturationCurve,
  SHADE_STOPS,
} from "./constants";
