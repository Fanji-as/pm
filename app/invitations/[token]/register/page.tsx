"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/i18n/context";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { Clock, UserPlus } from "lucide-react";

export default function InvitationRegisterPage() {
  const { token } = useParams();
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [invitationData, setInvitationData] = useState<any>(null);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${token}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setInvitationData(data.invitation);
        setEmail(data.invitation.inviteeEmail);
      } else {
        setError(data.error || t.invitations.failedToLoadInvitation);
      }
    } catch (error) {
      console.error("Failed to load invitation:", error);
      setError(t.invitations.failedToLoadInvitation);
    } finally {
      setLoadingInvitation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Registering with email:", email);
      const { user, token: authToken } = await register(name, email, password);
      localStorage.setItem("token", authToken);
      setUser(user);
      console.log("Registration successful, user:", user);

      // Accept the invitation automatically
      console.log("Accepting invitation with token:", token);
      const acceptResponse = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const acceptData = await acceptResponse.json();
      console.log("Accept response:", acceptData);

      if (acceptResponse.ok && acceptData.success) {
        console.log(
          "Invitation accepted, redirecting to project:",
          acceptData.projectId,
        );
        router.push(`/projects/${acceptData.projectId}`);
      } else {
        console.log("Failed to accept invitation:", acceptData.error);
        // Even if acceptance fails, redirect to dashboard since user is registered
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Clock size={64} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">
            {t.invitations.invitationError}
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>
            {t.invitations.goToDashboard}
          </Button>
        </Card>
      </div>
    );
  }

  const loginHref = `/login?redirect=/invitations/${token}`;

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <UserPlus size={48} className="text-blue-600" />
            </div>
          </div>
          <h2
            className="mt-6 text-center text-3xl font-extrabold"
            style={{ color: "var(--color-text)" }}
          >
            {t.invitations.createYourAccount}
          </h2>
          <p
            className="mt-2 text-center text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t.invitations.youveBeenInvitedToJoin}{" "}
            <strong>{invitationData?.projectName}</strong>
          </p>
        </div>

        {invitationData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-2">
              <strong>{t.invitations.project}:</strong>{" "}
              {invitationData.projectName}
            </p>
            <p className="text-sm text-blue-900 mb-2">
              <strong>{t.invitations.invitedBy}:</strong>{" "}
              {invitationData.inviterName}
            </p>
            <p className="text-sm text-blue-900">
              <strong>{t.invitations.email}:</strong>{" "}
              {invitationData.inviteeEmail}
            </p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label={t.auth.name}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
            <Input
              label={t.auth.email}
              type="email"
              value={email}
              onChange={() => {}} // Email is read-only
              required
              placeholder="you@example.com"
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <Input
              label={t.auth.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? t.messages.creatingAccount
              : t.invitations.createAccountAndJoinProject}
          </Button>
        </form>

        <p
          className="mt-2 text-center text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t.invitations.alreadyHaveAccount}{" "}
          <a
            href={loginHref}
            className="font-medium text-primary hover-text-primary-light"
          >
            {t.invitations.signIn}
          </a>
        </p>
      </div>
    </div>
  );
}
