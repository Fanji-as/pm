"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/i18n/context";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function InvitationPage() {
  const { token } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${token}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setInvitation(data.invitation);
      }
    } catch (error) {
      console.error("Failed to load invitation:", error);
      setError(t.invitations.failedToLoadInvitation);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user) {
      router.push(`/login?redirect=/invitations/${token}`);
      return;
    }

    setAccepting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAccepted(true);
        setTimeout(() => {
          router.push(`/projects/${data.projectId}`);
        }, 2000);
      } else {
        setError(data.error || t.invitations.failedToAcceptInvitation);
      }
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      setError(t.invitations.failedToAcceptInvitation);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle size={64} className="mx-auto mb-4 text-red-500" />
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

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold mb-2">
            {t.invitations.invitationAccepted}
          </h1>
          <p className="text-gray-600 mb-6">
            {t.invitations.youveBeenAddedToProject}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <Clock size={64} className="mx-auto mb-4 text-blue-500" />
          <h1 className="text-2xl font-bold mb-2">
            {t.invitations.projectInvitation}
          </h1>
          <p className="text-gray-600">
            {t.invitations.youveBeenInvitedToJoinProject}
          </p>
        </div>

        {invitation && invitation.projectName && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">
              <strong>{t.invitations.project}:</strong> {invitation.projectName}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>{t.invitations.invitedBy}:</strong>{" "}
              {invitation.inviterName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>{t.invitations.email}:</strong> {invitation.inviterEmail}
            </p>
          </div>
        )}

        {user ? (
          <div className="space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <Button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="w-full"
            >
              {accepting ? t.invitations.accepting : t.invitations.accept}
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              {t.invitations.decline}
            </Button>
          </div>
        ) : (
          <div className="mb-6 space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              {t.invitations.youNeedToCreateAccount}
            </p>
            <Button
              onClick={() => router.push(`/invitations/${token}/register`)}
              className="w-full"
            >
              {t.invitations.createAccountAndJoinProject}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                router.push(`/login?redirect=/invitations/${token}`)
              }
              className="w-full"
            >
              {t.invitations.alreadyHaveAccount} {t.invitations.signIn}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
