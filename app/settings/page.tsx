"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/i18n/context";
import { updateProfile } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import "@/styles/pages/Settings.css";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { t, language, setLanguage } = useLanguage();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    const handleThemeChange = (event: CustomEvent) => {
      const newTheme = event.detail as "light" | "dark";
      setTheme(newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    globalThis.addEventListener(
      "theme-change",
      handleThemeChange as EventListener,
    );

    return () => {
      globalThis.removeEventListener(
        "theme-change",
        handleThemeChange as EventListener,
      );
    };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const updatedUser = await updateProfile({ name });
      setUser(updatedUser);
      setSuccess(t.settings.profileUpdated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError(t.settings.passwordMismatch);
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError(t.settings.passwordTooShort);
      setIsLoading(false);
      return;
    }

    try {
      await updateProfile({
        currentPassword,
        newPassword,
      });
      setSuccess(t.settings.passwordUpdated);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    globalThis.dispatchEvent(
      new CustomEvent("theme-change", { detail: newTheme }),
    );
  };

  const handleLanguageChange = (newLang: "en" | "id") => {
    setLanguage(newLang);
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-back-link-container">
          <Link href="/dashboard" className="settings-back-link">
            ← {t.settings.backToDashboard}
          </Link>
        </div>

        <h1 className="settings-title">{t.settings.title}</h1>

        {error && <div className="error-message">{error}</div>}

        {success && <div className="success-message">{success}</div>}

        <div className="settings-sections">
          {/* Profile Settings */}
          <div className="settings-section">
            <h2 className="settings-section-title">
              {t.settings.profileSettings}
            </h2>
            <form onSubmit={handleUpdateProfile} className="settings-form">
              <Input
                label={t.settings.fullName}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t.settings.updating : t.settings.updateProfile}
              </Button>
            </form>
          </div>

          {/* Password Settings */}
          <div className="settings-section">
            <h2 className="settings-section-title">
              {t.settings.passwordSettings}
            </h2>
            <form onSubmit={handleUpdatePassword} className="settings-form">
              <Input
                label={t.settings.currentPassword}
                type="text"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                label={t.settings.newPassword}
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <Input
                label={t.settings.confirmPassword}
                type="text"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t.settings.updating : t.settings.updatePassword}
              </Button>
            </form>
          </div>

          {/* Theme Settings */}
          <div className="settings-section">
            <h2 className="settings-section-title">
              {t.settings.themeSettings}
            </h2>
            <div className="settings-button-group">
              <Button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={theme === "light" ? "settings-button-active" : ""}
              >
                {t.settings.lightTheme}
              </Button>
              <Button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={theme === "dark" ? "settings-button-active" : ""}
              >
                {t.settings.darkTheme}
              </Button>
            </div>
          </div>

          {/* Language Settings */}
          <div className="settings-section">
            <h2 className="settings-section-title">
              {t.settings.languageSettings}
            </h2>
            <div className="settings-button-group">
              <Button
                type="button"
                onClick={() => handleLanguageChange("en")}
                className={language === "en" ? "settings-button-active" : ""}
              >
                {t.language.en}
              </Button>
              <Button
                type="button"
                onClick={() => handleLanguageChange("id")}
                className={language === "id" ? "settings-button-active" : ""}
              >
                {t.language.id}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
