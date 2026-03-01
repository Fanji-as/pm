import { en } from "./translations.en";
import { id } from "./translations.id";

export type Language = "en" | "id";

export const translations = {
  en: en,
  id: id,
} as const;
