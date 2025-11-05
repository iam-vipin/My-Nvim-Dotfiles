// Export all locale files to make them accessible from the package root
export { default as enCore } from "./en/core";
export { default as enCoreExtended } from "./en/core-extended";
export { default as enTranslations } from "./en/translations";
export { default as enTranslationsExtended } from "./en/translations-extended";
export { default as enAccessibility } from "./en/accessibility";
// editor
export { default as enEditor } from "./en/editor";
export { default as enEmptyState } from "./en/empty-state";
export { default as enEmptyStateExtended } from "./en/empty-state-extended";
export { default as enEditorExtended } from "./en/editor-extended";

// Define the locale data structure type
type LocaleData = {
  [key: string]: () => Promise<{ default: Record<string, unknown> }>;
};

// Export locale data for all supported languages
export const locales: Record<string, LocaleData> = {
  en: {
    core: () => import("./en/core"),
    translations: () => import("./en/translations"),
    accessibility: () => import("./en/accessibility"),
    editor: () => import("./en/editor"),
    "empty-state": () => import("./en/empty-state"),
    "empty-state-extended": () => import("./en/empty-state-extended"),
    "core-extended": () => import("./en/core-extended"),
    "translations-extended": () => import("./en/translations-extended"),
    "editor-extended": () => import("./en/editor-extended"),
  },
  fr: {
    translations: () => import("./fr/translations"),
    accessibility: () => import("./fr/accessibility"),
    editor: () => import("./fr/editor"),
    "empty-state": () => import("./fr/empty-state"),
    "empty-state-extended": () => import("./fr/empty-state-extended"),
    "translations-extended": () => import("./fr/translations-extended"),
    "editor-extended": () => import("./fr/editor-extended"),
  },
  es: {
    translations: () => import("./es/translations"),
    accessibility: () => import("./es/accessibility"),
    editor: () => import("./es/editor"),
    "empty-state": () => import("./es/empty-state"),
    "empty-state-extended": () => import("./es/empty-state-extended"),
    "translations-extended": () => import("./es/translations-extended"),
    "editor-extended": () => import("./es/editor-extended"),
  },
  ja: {
    translations: () => import("./ja/translations"),
    accessibility: () => import("./ja/accessibility"),
    editor: () => import("./ja/editor"),
    "empty-state": () => import("./ja/empty-state"),
    "empty-state-extended": () => import("./ja/empty-state-extended"),
    "translations-extended": () => import("./ja/translations-extended"),
    "editor-extended": () => import("./ja/editor-extended"),
  },
  "zh-CN": {
    translations: () => import("./zh-CN/translations"),
    accessibility: () => import("./zh-CN/accessibility"),
    editor: () => import("./zh-CN/editor"),
    "empty-state": () => import("./zh-CN/empty-state"),
    "empty-state-extended": () => import("./zh-CN/empty-state-extended"),
    "translations-extended": () => import("./zh-CN/translations-extended"),
    "editor-extended": () => import("./zh-CN/editor-extended"),
  },
  "zh-TW": {
    translations: () => import("./zh-TW/translations"),
    accessibility: () => import("./zh-TW/accessibility"),
    editor: () => import("./zh-TW/editor"),
    "empty-state": () => import("./zh-TW/empty-state"),
    "empty-state-extended": () => import("./zh-TW/empty-state-extended"),
    "translations-extended": () => import("./zh-TW/translations-extended"),
    "editor-extended": () => import("./zh-TW/editor-extended"),
  },
  ru: {
    translations: () => import("./ru/translations"),
    accessibility: () => import("./ru/accessibility"),
    editor: () => import("./ru/editor"),
    "empty-state": () => import("./ru/empty-state"),
    "empty-state-extended": () => import("./ru/empty-state-extended"),
    "translations-extended": () => import("./ru/translations-extended"),
    "editor-extended": () => import("./ru/editor-extended"),
  },
  it: {
    translations: () => import("./it/translations"),
    accessibility: () => import("./it/accessibility"),
    editor: () => import("./it/editor"),
    "empty-state": () => import("./it/empty-state"),
    "empty-state-extended": () => import("./it/empty-state-extended"),
    "translations-extended": () => import("./it/translations-extended"),
    "editor-extended": () => import("./it/editor-extended"),
  },
  cs: {
    translations: () => import("./cs/translations"),
    accessibility: () => import("./cs/accessibility"),
    editor: () => import("./cs/editor"),
    "empty-state": () => import("./cs/empty-state"),
    "empty-state-extended": () => import("./cs/empty-state-extended"),
    "translations-extended": () => import("./cs/translations-extended"),
    "editor-extended": () => import("./cs/editor-extended"),
  },
  sk: {
    translations: () => import("./sk/translations"),
    accessibility: () => import("./sk/accessibility"),
    editor: () => import("./sk/editor"),
    "empty-state": () => import("./sk/empty-state"),
    "empty-state-extended": () => import("./sk/empty-state-extended"),
    "translations-extended": () => import("./sk/translations-extended"),
    "editor-extended": () => import("./sk/editor-extended"),
  },
  de: {
    translations: () => import("./de/translations"),
    accessibility: () => import("./de/accessibility"),
    editor: () => import("./de/editor"),
    "empty-state": () => import("./de/empty-state"),
    "empty-state-extended": () => import("./de/empty-state-extended"),
    "translations-extended": () => import("./de/translations-extended"),
    "editor-extended": () => import("./de/editor-extended"),
  },
  ua: {
    translations: () => import("./ua/translations"),
    accessibility: () => import("./ua/accessibility"),
    editor: () => import("./ua/editor"),
    "empty-state": () => import("./ua/empty-state"),
    "empty-state-extended": () => import("./ua/empty-state-extended"),
    "translations-extended": () => import("./ua/translations-extended"),
    "editor-extended": () => import("./ua/editor-extended"),
  },
  pl: {
    translations: () => import("./pl/translations"),
    accessibility: () => import("./pl/accessibility"),
    editor: () => import("./pl/editor"),
    "empty-state": () => import("./pl/empty-state"),
    "empty-state-extended": () => import("./pl/empty-state-extended"),
    "translations-extended": () => import("./pl/translations-extended"),
    "editor-extended": () => import("./pl/editor-extended"),
  },
  ko: {
    translations: () => import("./ko/translations"),
    accessibility: () => import("./ko/accessibility"),
    editor: () => import("./ko/editor"),
    "empty-state": () => import("./ko/empty-state"),
    "empty-state-extended": () => import("./ko/empty-state-extended"),
    "translations-extended": () => import("./ko/translations-extended"),
    "editor-extended": () => import("./ko/editor-extended"),
  },
  "pt-BR": {
    translations: () => import("./pt-BR/translations"),
    accessibility: () => import("./pt-BR/accessibility"),
    editor: () => import("./pt-BR/editor"),
    "empty-state": () => import("./pt-BR/empty-state"),
    "empty-state-extended": () => import("./pt-BR/empty-state-extended"),
    "translations-extended": () => import("./pt-BR/translations-extended"),
    "editor-extended": () => import("./pt-BR/editor-extended"),
  },
  id: {
    translations: () => import("./id/translations"),
    accessibility: () => import("./id/accessibility"),
    editor: () => import("./id/editor"),
    "empty-state": () => import("./id/empty-state"),
    "empty-state-extended": () => import("./id/empty-state-extended"),
    "translations-extended": () => import("./id/translations-extended"),
    "editor-extended": () => import("./id/editor-extended"),
  },
  ro: {
    translations: () => import("./ro/translations"),
    accessibility: () => import("./ro/accessibility"),
    editor: () => import("./ro/editor"),
    "empty-state": () => import("./ro/empty-state"),
    "empty-state-extended": () => import("./ro/empty-state-extended"),
    "translations-extended": () => import("./ro/translations-extended"),
    "editor-extended": () => import("./ro/editor-extended"),
  },
  "vi-VN": {
    translations: () => import("./vi-VN/translations"),
    accessibility: () => import("./vi-VN/accessibility"),
    editor: () => import("./vi-VN/editor"),
    "empty-state": () => import("./vi-VN/empty-state"),
    "empty-state-extended": () => import("./vi-VN/empty-state-extended"),
    "translations-extended": () => import("./vi-VN/translations-extended"),
    "editor-extended": () => import("./vi-VN/editor-extended"),
  },
  "tr-TR": {
    translations: () => import("./tr-TR/translations"),
    accessibility: () => import("./tr-TR/accessibility"),
    editor: () => import("./tr-TR/editor"),
    "empty-state": () => import("./tr-TR/empty-state"),
    "empty-state-extended": () => import("./tr-TR/empty-state-extended"),
    "translations-extended": () => import("./tr-TR/translations-extended"),
    "editor-extended": () => import("./tr-TR/editor-extended"),
  },
};
