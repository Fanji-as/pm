"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { fetchIssues, createIssue, updateIssue, deleteIssue } from "@/lib/api";
import { KANBAN_COLUMNS } from "@/lib/constants";
import { getPriorityStyles } from "@/lib/utils/priorityStyles";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import {
  ArrowLeft,
  Plus,
  Trash2,
  User,
  Settings,
  UserPlus,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function DraggableIssue({
  issue,
  onDelete,
}: {
  issue: any;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { bg: priorityBg, text: priorityText } = getPriorityStyles(issue.priority);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="p-4 rounded-lg shadow-sm border cursor-move hover-shadow-md mb-3"
      style={{
        ...style,
        backgroundColor: "var(--color-white)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className="px-2 py-1 text-xs font-medium rounded-full"
          style={{
            backgroundColor: priorityBg,
            color: priorityText,
          }}
        >
          {issue.priority}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(issue._id);
          }}
          className="hover-text-red"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <Trash2 size={16} />
        </button>
      </div>
      <h4 className="font-medium mb-2" style={{ color: "var(--color-text)" }}>
        {issue.title}
      </h4>
      <p
        className="text-sm mb-3 line-clamp-2"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {issue.description}
      </p>
      {issue.assigneeId && (
        <div
          className="flex items-center text-xs"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <User size={14} className="mr-1" />
          {issue.assigneeId.name}
        </div>
      )}
    </div>
  );
}

export default function ProjectBoardPage() {
  const { t } = useLanguage();
  const params = useParams();
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    team: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    loadIssues();
    loadProjectMembers();

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
  }, [params.id]);

  const loadProjectMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/projects/${params.id as string}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const project = await response.json();
      if (project) {
        if (project.members) {
          setProjectMembers(project.members);
        }
        if (project.name) {
          setProjectName(project.name);
        }
      }
    } catch (error) {
      console.error("Failed to load project members:", error);
    }
  };

  const loadIssues = async () => {
    try {
      const data = await fetchIssues(params.id as string);
      setIssues(data);
    } catch (error) {
      console.error("Failed to load issues:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeIssue = issues.find((issue) => issue._id === activeId);
    if (!activeIssue) return;

    const newStatus = overId as "todo" | "in_progress" | "done";

    if (activeIssue.status === newStatus) return;

    try {
      await updateIssue(activeId, { status: newStatus });
      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === activeId ? { ...issue, status: newStatus } : issue,
        ),
      );
    } catch (error) {
      console.error("Failed to update issue status:", error);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setError(t.messages.titleAndDescriptionRequired);
      return;
    }

    try {
      await createIssue({
        ...formData,
        projectId: params.id as string,
      });
      setFormData({ title: "", description: "", priority: "medium", team: "" });
      setIsModalOpen(false);
      loadIssues();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteIssue = async (id: string) => {
    if (!confirm(t.messages.areYouSureDeleteIssue)) return;

    try {
      await deleteIssue(id);
      loadIssues();
    } catch (error) {
      console.error("Failed to delete issue:", error);
    }
  };

  const getIssuesByStatus = (status: string) => {
    return issues.filter((issue) => issue.status === status);
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      setError(t.invitations.emailRequired);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/projects/${params.id as string}/invite`,
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
          // For development, show invitation link
          if (result.invitationLink) {
            console.log("Invitation Link:", result.invitationLink);
            setSuccess(
              `${t.invitations.invitationSentWithLink} ${result.invitationLink}`,
            );
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
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="container">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={18} className="mr-2" />
                  {t.messages.back}
                </Button>
              </Link>
              <h1
                className="text-xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {projectName}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <UserPlus size={16} className="mr-2" />
                {t.invitations.inviteMember}
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                {t.issues.newIssue}
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="main">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {KANBAN_COLUMNS.map((column) => {
              const getColumnTitle = () => {
                switch (column.id) {
                  case "todo":
                    return t.issues.todo;
                  case "in_progress":
                    return t.issues.inProgress;
                  case "done":
                    return t.issues.done;
                  default:
                    return "";
                }
              };

              const columnBg = (() => {
                switch (column.id) {
                  case "in_progress":
                    return "var(--column-inprogress-bg)";
                  case "done":
                    return "var(--column-done-bg)";
                  case "todo":
                  default:
                    return "var(--column-todo-bg)";
                }
              })();

              return (
                <div
                  key={column.id}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: columnBg,
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text)" }}
                  >
                    {getColumnTitle()} ({getIssuesByStatus(column.id).length})
                  </h3>
                  <SortableContext
                    id={column.id}
                    items={getIssuesByStatus(column.id).map((i) => i._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {getIssuesByStatus(column.id).map((issue) => (
                      <DraggableIssue
                        key={issue._id}
                        issue={issue}
                        onDelete={handleDeleteIssue}
                      />
                    ))}
                  </SortableContext>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeId ? (
              <div
                className="p-4 rounded-lg shadow-lg border opacity-50"
                style={{
                  backgroundColor: "var(--color-white)",
                  borderColor: "var(--color-border)",
                }}
              >
                {issues.find((issue) => issue._id === activeId)?.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t.issues.newIssue}
      >
        <form onSubmit={handleCreateIssue}>
          <div className="space-y-4">
            <Input
              label={t.issues.issueTitle}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder={t.messages.issueTitle}
              required
            />
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-text)" }}
              >
                {t.issues.description}
              </label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-white)",
                }}
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t.messages.describeIssue}
                required
              />
            </div>
            <div>
              <label
                htmlFor="team"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-text)" }}
              >
                {t.issues.team}
              </label>
              <select
                id="team"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-white)",
                  color: "var(--color-text)",
                }}
                value={formData.team}
                onChange={(e) =>
                  setFormData({ ...formData, team: e.target.value })
                }
              >
                <option value="">{t.issues.selectTeam}</option>
                {projectMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-text)" }}
              >
                {t.issues.priority}
              </label>
              <select
                id="priority"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-white)",
                  color: "var(--color-text)",
                }}
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="low">{t.issues.low}</option>
                <option value="medium">{t.issues.medium}</option>
                <option value="high">{t.issues.high}</option>
              </select>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t.messages.cancel}
            </Button>
            <Button type="submit">{t.messages.createIssue}</Button>
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
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
          <div className="mt-6 flex justify-end space-x-3">
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
