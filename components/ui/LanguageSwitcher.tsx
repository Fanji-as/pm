"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "en" | "id")}
        className="appearance-none pl-8 pr-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium cursor-pointer transition-colors"
        aria-label="Select language"
      >
        <option value="en">{t.language.en}</option>
        <option value="id">{t.language.id}</option>
      </select>
      <Globe
        size={16}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
      />
    </div>
  );
}