"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/i18n/context";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/dashboard");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    const handleThemeChange = (event: CustomEvent) => {
      const newTheme = event.detail as "light" | "dark";
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
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

  useEffect(() => {
    const urlParams = new URLSearchParams(globalThis.location.search);
    const redirect = urlParams.get("redirect");
    if (redirect) {
      setRedirectPath(redirect);
      console.log("Redirect path set to:", redirect);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting login with:", email);
      const { user, token } = await login(email, password);
      console.log("Login successful:", user);
      localStorage.setItem("token", token);
      console.log("Token stored in localStorage");
      setUser(user);
      console.log(
        "User set in store, attempting to redirect to:",
        redirectPath,
      );
      router.push(redirectPath);
      console.log("Redirect command executed");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || t.auth.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const registerHref = redirectPath === "/dashboard"
    ? "/register"
    : `/register?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2
            className="mt-6 text-center text-3xl font-extrabold"
            style={{ color: "var(--color-text)" }}
          >
            {t.auth.login}
          </h2>
          <p
            className="mt-2 text-center text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t.auth.hasAccount}{" "}
            <Link
              href={registerHref}
              className="font-medium text-primary hover-text-primary-light"
            >
              {t.auth.register}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label={t.auth.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            <Input
              label={t.auth.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t.messages.signingIn : t.messages.signIn}
          </Button>
        </form>
      </div>
    </div>
  );
}
