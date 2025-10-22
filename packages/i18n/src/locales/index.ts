// Export all locale files to make them accessible from the package root
export { default as enCore } from "./en/core";
export { default as enCoreExtended } from "./en/core-extended";
export { default as enTranslations } from "./en/translations";
export { default as enTranslationsExtended } from "./en/translations-extended";
export { default as enAccessibility } from "./en/accessibility";
// editor
export { default as enEditor } from "./en/editor";
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
    "core-extended": () => import("./en/core-extended"),
    "translations-extended": () => import("./en/translations-extended"),
    "editor-extended": () => import("./en/editor-extended"),
  },
  fr: {
    translations: () => import("./fr/translations"),
    accessibility: () => import("./fr/accessibility"),
    editor: () => import("./fr/editor"),
    "translations-extended": () => import("./fr/translations-extended"),
    "editor-extended": () => import("./fr/editor-extended"),
  },
  es: {
    translations: () => import("./es/translations"),
    accessibility: () => import("./es/accessibility"),
    editor: () => import("./es/editor"),
    "translations-extended": () => import("./es/translations-extended"),
    "editor-extended": () => import("./es/editor-extended"),
  },
  ja: {
    translations: () => import("./ja/translations"),
    accessibility: () => import("./ja/accessibility"),
    editor: () => import("./ja/editor"),
    "translations-extended": () => import("./ja/translations-extended"),
    "editor-extended": () => import("./ja/editor-extended"),
  },
  "zh-CN": {
    translations: () => import("./zh-CN/translations"),
    accessibility: () => import("./zh-CN/accessibility"),
    editor: () => import("./zh-CN/editor"),
    "translations-extended": () => import("./zh-CN/translations-extended"),
    "editor-extended": () => import("./zh-CN/editor-extended"),
  },
  "zh-TW": {
    translations: () => import("./zh-TW/translations"),
    accessibility: () => import("./zh-TW/accessibility"),
    editor: () => import("./zh-TW/editor"),
    "translations-extended": () => import("./zh-TW/translations-extended"),
    "editor-extended": () => import("./zh-TW/editor-extended"),
  },
  ru: {
    translations: () => import("./ru/translations"),
    accessibility: () => import("./ru/accessibility"),
    editor: () => import("./ru/editor"),
    "translations-extended": () => import("./ru/translations-extended"),
    "editor-extended": () => import("./ru/editor-extended"),
  },
  it: {
    translations: () => import("./it/translations"),
    accessibility: () => import("./it/accessibility"),
    editor: () => import("./it/editor"),
    "translations-extended": () => import("./it/translations-extended"),
    "editor-extended": () => import("./it/editor-extended"),
  },
  cs: {
    translations: () => import("./cs/translations"),
    accessibility: () => import("./cs/accessibility"),
    editor: () => import("./cs/editor"),
    "translations-extended": () => import("./cs/translations-extended"),
    "editor-extended": () => import("./cs/editor-extended"),
  },
  sk: {
    translations: () => import("./sk/translations"),
    accessibility: () => import("./sk/accessibility"),
    editor: () => import("./sk/editor"),
    "translations-extended": () => import("./sk/translations-extended"),
    "editor-extended": () => import("./sk/editor-extended"),
  },
  de: {
    translations: () => import("./de/translations"),
    accessibility: () => import("./de/accessibility"),
    editor: () => import("./de/editor"),
    "translations-extended": () => import("./de/translations-extended"),
    "editor-extended": () => import("./de/editor-extended"),
  },
  ua: {
    translations: () => import("./ua/translations"),
    accessibility: () => import("./ua/accessibility"),
    editor: () => import("./ua/editor"),
    "translations-extended": () => import("./ua/translations-extended"),
    "editor-extended": () => import("./ua/editor-extended"),
  },
  pl: {
    translations: () => import("./pl/translations"),
    accessibility: () => import("./pl/accessibility"),
    editor: () => import("./pl/editor"),
    "translations-extended": () => import("./pl/translations-extended"),
    "editor-extended": () => import("./pl/editor-extended"),
  },
  ko: {
    translations: () => import("./ko/translations"),
    accessibility: () => import("./ko/accessibility"),
    editor: () => import("./ko/editor"),
    "translations-extended": () => import("./ko/translations-extended"),
    "editor-extended": () => import("./ko/editor-extended"),
  },
  "pt-BR": {
    translations: () => import("./pt-BR/translations"),
    accessibility: () => import("./pt-BR/accessibility"),
    editor: () => import("./pt-BR/editor"),
    "translations-extended": () => import("./pt-BR/translations-extended"),
    "editor-extended": () => import("./pt-BR/editor-extended"),
  },
  id: {
    translations: () => import("./id/translations"),
    accessibility: () => import("./id/accessibility"),
    editor: () => import("./id/editor"),
    "translations-extended": () => import("./id/translations-extended"),
    "editor-extended": () => import("./id/editor-extended"),
  },
  ro: {
    translations: () => import("./ro/translations"),
    accessibility: () => import("./ro/accessibility"),
    editor: () => import("./ro/editor"),
    "translations-extended": () => import("./ro/translations-extended"),
    "editor-extended": () => import("./ro/editor-extended"),
  },
  "vi-VN": {
    translations: () => import("./vi-VN/translations"),
    accessibility: () => import("./vi-VN/accessibility"),
    editor: () => import("./vi-VN/editor"),
    "translations-extended": () => import("./vi-VN/translations-extended"),
    "editor-extended": () => import("./vi-VN/editor-extended"),
  },
  "tr-TR": {
    translations: () => import("./tr-TR/translations"),
    accessibility: () => import("./tr-TR/accessibility"),
    editor: () => import("./tr-TR/editor"),
    "translations-extended": () => import("./tr-TR/translations-extended"),
    "editor-extended": () => import("./tr-TR/editor-extended"),
  },
};
