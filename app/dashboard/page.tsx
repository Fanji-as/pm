"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/i18n/context";
import { fetchProjects, createProject, deleteProject, logout } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { Plus, LogOut, Folder, Settings, UserPlus } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedProjectForInvite, setSelectedProjectForInvite] = useState("");
  const [projectName, setProjectName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProjects();

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

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!projectName.trim()) {
      setError(t.invitations.projectNameRequired);
      return;
    }

    try {
      await createProject(projectName);
      setProjectName("");
      setIsModalOpen(false);
      loadProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm(t.messages.areYouSureDeleteProject)) return;

    try {
      await deleteProject(id);
      loadProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleOpenInviteModal = (projectId: string) => {
    setSelectedProjectForInvite(projectId);
    setInviteEmail("");
    setError("");
    setSuccess("");
    setIsInviteModalOpen(true);
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      setError(t.invitations.emailRequired);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/projects/${selectedProjectForInvite}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ email: inviteEmail }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSuccess(t.invitations.invitationSentSuccessfully);
          setInviteEmail("");
          // For development, show the invitation link
          if (result.invitationLink) {
            console.log("Invitation Link:", result.invitationLink);
            setSuccess(`${t.invitations.invitationSentWithLink} ${result.invitationLink}`);
          }
          setTimeout(() => {
            setIsInviteModalOpen(false);
          }, 3000);
        } else {
          setError(result.message || t.invitations.failedToInviteUser);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || t.invitations.failedToInviteUser);
      }
    } catch (error) {
      console.error("Failed to invite user:", error);
      setError(t.invitations.failedToInviteUser);
    }
  };

  if (isLoading) {
    return (
      <div className="page-centered-simple">
        <div className="spinner"></div>
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
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="container">
          <div className="nav-container">
            <div className="nav-left">
              <h1
                className="text-title-lg"
                style={{ color: "var(--color-text)" }}
              >
                PM
              </h1>
            </div>
            <div className="nav-right">
              <span style={{ color: "var(--color-text-secondary)" }}>
                {t.messages.welcome}, {user?.name}
              </span>
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings size={18} />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={18} className="mr-2" />
                {t.messages.logout}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main">
        <div className="flex-between items-center mb-8">
          <div>
            <h2
              className="text-title-xl"
              style={{ color: "var(--color-text)" }}
            >
              {t.dashboard.myProjects}
            </h2>
            <p
              className="mt-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t.dashboard.manageProjects}
            </p>
          </div>
          {projects.length > 0 && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={18} className="mr-2" />
              {t.projects.createProject}
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <Card className="card-padding-lg text-center">
            <Folder
              size={48}
              className="mx-auto mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            />
            <h3
              className="text-subtitle mb-2"
              style={{ color: "var(--color-text)" }}
            >
              {t.dashboard.noProjectsYet}
            </h3>
            <p
              className="mb-6"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t.dashboard.createFirstProject}
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              {t.projects.createProject}
            </Button>
          </Card>
        ) : (
          <div className="grid-3 gap-6">
            {projects.map((project) => (
              <Link key={project._id} href={`/projects/${project._id}`}>
                <Card className="card-padding card-hover cursor-pointer">
                  <div className="flex-between flex-start mb-4">
                    <h3
                      className="text-subtitle"
                      style={{ color: "var(--color-text)" }}
                    >
                      {project.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteProject(project._id);
                      }}
                      className="hover-text-red"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      ×
                    </button>
                  </div>
                  <p
                    className="text-body mb-4"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {project.members?.length || 0}{" "}
                    {project.members?.length === 1
                      ? t.projects.member
                      : t.projects.members}
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenInviteModal(project._id);
                      }}
                    >
                      <UserPlus size={16} className="mr-2" />
                      {t.invitations.inviteMember}
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t.dashboard.createNewProject}
      >
        <form onSubmit={handleCreateProject}>
          <Input
            label={t.projects.projectName}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder={t.projects.projectNamePlaceholder}
            required
          />
          {error && <p className="mt-2 error-message">{error}</p>}
          <div className="mt-6 button-group">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t.messages.cancel}
            </Button>
            <Button type="submit">{t.projects.createProject}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title={t.invitations.inviteMember}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInviteUser();
          }}
        >
          <Input
            label={t.auth.email}
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="user@example.com"
            required
          />
          {error && <p className="mt-2 error-message">{error}</p>}
          {success && <p className="mt-2 success-message">{success}</p>}
          <div className="mt-6 button-group">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
            >
              {t.invitations.cancel}
            </Button>
            <Button type="submit">{t.invitations.invite}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
