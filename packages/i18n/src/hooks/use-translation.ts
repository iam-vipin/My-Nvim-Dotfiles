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

import { useContext } from "react";
// context
import { TranslationContext } from "../context";
// types
import type { ILanguageOption, TLanguage } from "../types";

export type TTranslationStore = {
  t: (key: string, params?: Record<string, unknown>) => string;
  currentLocale: TLanguage;
  changeLanguage: (lng: TLanguage) => void;
  languages: ILanguageOption[];
};

/**
 * Provides the translation store to the application
 * @returns {TTranslationStore}
 * @returns {(key: string, params?: Record<string, any>) => string} t: method to translate the key with params
 * @returns {TLanguage} currentLocale - current locale language
 * @returns {(lng: TLanguage) => void} changeLanguage - method to change the language
 * @returns {ILanguageOption[]} languages - available languages
 * @throws {Error} if the TranslationProvider is not used
 */
export function useTranslation(): TTranslationStore {
  const store = useContext(TranslationContext);
  if (!store) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return {
    t: store.t.bind(store),
    currentLocale: store.currentLocale,
    changeLanguage: (lng: TLanguage) => store.setLanguage(lng),
    languages: store.availableLanguages,
  };
}
