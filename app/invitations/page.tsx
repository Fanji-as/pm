"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/i18n/context";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export default function InvitationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadInvitations();
  }, [user]);

  const loadInvitations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/invitations", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setInvitations(data.invitations);
      } else {
        setError(data.error || t.invitations.failedToLoadInvitations);
      }
    } catch (error) {
      console.error("Failed to load invitations:", error);
      setError(t.invitations.failedToLoadInvitations);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={20} className="text-yellow-500" />;
      case "accepted":
        return <CheckCircle size={20} className="text-green-500" />;
      case "declined":
        return <XCircle size={20} className="text-red-500" />;
      case "expired":
        return <XCircle size={20} className="text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return t.invitations.pending;
      case "accepted":
        return t.invitations.accepted;
      case "declined":
        return t.invitations.declined;
      case "expired":
        return t.invitations.expired;
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <nav
        style={{
          backgroundColor: "var(--color-white)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="container">
          <div className="flex justify-between h-16 items-center">
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {t.invitations.title}
            </h1>
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard")}
            >
              {t.invitations.goToDashboard}
            </Button>
          </div>
        </div>
      </nav>

      <main className="main">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {invitations.length === 0 ? (
          <Card className="p-12 text-center">
            <Clock
              size={64}
              className="mx-auto mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            />
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--color-text)" }}
            >
              {t.invitations.noInvitations}
            </h2>
            <p style={{ color: "var(--color-text-secondary)" }}>
              {t.invitations.noPendingInvitations}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((invitation) => (
              <Card key={invitation._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(invitation.status)}
                    <span
                      className="ml-2 text-sm font-medium"
                      style={{ color: "var(--color-text)" }}
                    >
                      {getStatusText(invitation.status)}
                    </span>
                  </div>
                </div>

                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--color-text)" }}
                >
                  {invitation.projectId?.name || t.common.noResults}
                </h3>

                <div
                  className="space-y-2 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <p>
                    <strong>{t.invitations.invitedBy}:</strong>{" "}
                    {invitation.inviterId?.name || "Unknown"}
                  </p>
                  <p>
                    <strong>{t.invitations.email}:</strong>{" "}
                    {invitation.inviterId?.email || "Unknown"}
                  </p>
                  <p>
                    <strong>Expires:</strong>{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>

                {invitation.status === "pending" && (
                  <Button
                    onClick={() =>
                      router.push(`/invitations/${invitation.token}`)
                    }
                    className="w-full mt-4"
                  >
                    {t.invitations.viewInvitation}
                  </Button>
                )}

                {invitation.status === "accepted" && (
                  <Button
                    onClick={() =>
                      router.push(`/projects/${invitation.projectId?._id}`)
                    }
                    className="w-full mt-4"
                  >
                    {t.invitations.goToProject}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
