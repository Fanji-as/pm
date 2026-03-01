"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Globe } from "lucide-react";
import "@/styles/components/LanguageSwitcher.css";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="language-switcher">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "en" | "id")}
        aria-label="Select language"
      >
        <option value="en">{t.language.en}</option>
        <option value="id">{t.language.id}</option>
      </select>
      <Globe size={16} className="icon" />
    </div>
  );
}
