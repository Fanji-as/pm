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
import DeleteConfirm from "@/components/ui/DeleteConfirm";
import {
  ArrowLeft,
  Plus,
  Trash2,
  User,
  Settings,
  UserPlus,
  Pencil,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "@/styles/pages/Kanban.css";

function DroppableColumn({
  id,
  title,
  count,
  bgColor,
  children,
}: {
  id: string;
  title: string;
  count: number;
  bgColor: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? "drag-over" : ""}`}
      style={{ backgroundColor: isOver ? undefined : bgColor }}
    >
      <h3 className="kanban-column-title">
        {title} ({count})
      </h3>
      {children}
    </div>
  );
}

function DraggableIssue({
  issue,
  onDelete,
  onEdit,
}: {
  issue: any;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
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
  };

  const { bg: priorityBg, text: priorityText } = getPriorityStyles(issue.priority);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`kanban-card ${isDragging ? "dragging" : ""}`}
      style={style}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className="priority-badge"
          style={{
            backgroundColor: priorityBg,
            color: priorityText,
          }}
        >
          {issue.priority}
        </span>
        <div className="kanban-card-actions">
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(issue._id);
            }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(issue._id);
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <h4 className="kanban-card-title">{issue.title}</h4>
      <p className="kanban-card-description">{issue.description}</p>
      {issue.assigneeId && (
        <div className="kanban-card-assignee">
          <User size={14} />
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [issueToEdit, setIssueToEdit] = useState<any>(null);
  const [issueToDelete, setIssueToDelete] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    team: "",
    status: "todo",
  });
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    team: "",
    status: "todo",
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
      const data = await response.json();
      const project = data.project || data;
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
      setFormData({ title: "", description: "", priority: "medium", team: "", status: "todo" });
      setIsModalOpen(false);
      loadIssues();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openDeleteModal = (id: string) => {
    const issue = issues.find((i) => i._id === id);
    setIssueToDelete(issue);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteIssue = async () => {
    if (!issueToDelete) return;

    try {
      await deleteIssue(issueToDelete._id);
      setIsDeleteModalOpen(false);
      setIssueToDelete(null);
      loadIssues();
    } catch (error) {
      console.error("Failed to delete issue:", error);
    }
  };

  const handleDeleteIssue = (id: string) => {
    openDeleteModal(id);
  };

  const openEditModal = (id: string) => {
    const issue = issues.find((i) => i._id === id);
    if (issue) {
      setIssueToEdit(issue);
      setEditFormData({
        title: issue.title,
        description: issue.description || "",
        priority: issue.priority || "medium",
        team: issue.assigneeId?._id || "",
        status: issue.status || "todo",
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueToEdit) return;

    try {
      await updateIssue(issueToEdit._id, {
        title: editFormData.title,
        description: editFormData.description,
        priority: editFormData.priority as "low" | "medium" | "high",
        assigneeId: editFormData.team || undefined,
        status: editFormData.status as "todo" | "in_progress" | "done",
      });
      setIsEditModalOpen(false);
      setIssueToEdit(null);
      loadIssues();
    } catch (error) {
      console.error("Failed to update issue:", error);
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
      <div className="kanban-loading">
        <div className="kanban-spinner"></div>
      </div>
    );
  }

  return (
    <div className="kanban-page">
      <nav className="kanban-nav">
        <div className="kanban-nav-container">
          <div className="kanban-nav-content">
            <div className="kanban-nav-left">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={18} className="mr-2" />
                  {t.messages.back}
                </Button>
              </Link>
              <h1 className="text-xl font-bold kanban-nav-title">
                {projectName}
              </h1>
            </div>
            <div className="kanban-nav-right">
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

      <main className="kanban-main">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="kanban-grid">
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
                <DroppableColumn
                  key={column.id}
                  id={column.id}
                  title={getColumnTitle()}
                  count={getIssuesByStatus(column.id).length}
                  bgColor={columnBg}
                >
                  <SortableContext
                    items={getIssuesByStatus(column.id).map((i) => i._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {getIssuesByStatus(column.id).map((issue) => (
                      <DraggableIssue
                        key={issue._id}
                        issue={issue}
                        onDelete={handleDeleteIssue}
                        onEdit={openEditModal}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="kanban-drag-overlay">
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
            <div className="kanban-form-group">
              <label htmlFor="description" className="kanban-form-label">
                {t.issues.description}
              </label>
              <textarea
                id="description"
                className="kanban-textarea"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t.messages.describeIssue}
                required
              />
            </div>
            <div className="kanban-form-group">
              <label htmlFor="team" className="kanban-form-label">
                {t.issues.team}
              </label>
              <select
                id="team"
                className="kanban-select"
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
            <div className="kanban-form-group">
              <label htmlFor="priority" className="kanban-form-label">
                {t.issues.priority}
              </label>
              <select
                id="priority"
                className="kanban-select"
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
          {error && <p className="kanban-error">{error}</p>}
          <div className="kanban-form-actions">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t.messages.cancel}
            </Button>
            <Button type="submit">{t.messages.createIssue}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setError("");
          setSuccess("");
        }}
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
          {error && <p className="kanban-error">{error}</p>}
          {success && <p className="kanban-success">{success}</p>}
          <div className="kanban-form-actions">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsInviteModalOpen(false);
                setError("");
                setSuccess("");
              }}
            >
              {t.invitations.cancel}
            </Button>
            <Button type="submit">{t.invitations.invite}</Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirm
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIssueToDelete(null);
        }}
        onConfirm={confirmDeleteIssue}
        title={t.issues.deleteIssue}
        message={t.messages.areYouSureDeleteIssue}
        itemName={issueToDelete?.title}
        itemDescription={issueToDelete?.description}
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setIssueToEdit(null);
        }}
        title={t.common.edit + " " + t.issues.title}
      >
        <form onSubmit={handleEditIssue}>
          <div className="space-y-4">
            <Input
              label={t.issues.issueTitle}
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData({ ...editFormData, title: e.target.value })
              }
              placeholder={t.messages.issueTitle}
              required
            />
            <div className="kanban-form-group">
              <label htmlFor="edit-description" className="kanban-form-label">
                {t.issues.description}
              </label>
              <textarea
                id="edit-description"
                className="kanban-textarea"
                rows={4}
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
                placeholder={t.messages.describeIssue}
                required
              />
            </div>
            <div className="kanban-form-group">
              <label htmlFor="edit-team" className="kanban-form-label">
                {t.issues.team}
              </label>
              <select
                id="edit-team"
                className="kanban-select"
                value={editFormData.team}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, team: e.target.value })
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
            <div className="kanban-form-group">
              <label htmlFor="edit-priority" className="kanban-form-label">
                {t.issues.priority}
              </label>
              <select
                id="edit-priority"
                className="kanban-select"
                value={editFormData.priority}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, priority: e.target.value })
                }
              >
                <option value="low">{t.issues.low}</option>
                <option value="medium">{t.issues.medium}</option>
                <option value="high">{t.issues.high}</option>
              </select>
            </div>
            <div className="kanban-form-group">
              <label htmlFor="edit-status" className="kanban-form-label">
                {t.issues.status}
              </label>
              <select
                id="edit-status"
                className="kanban-select"
                value={editFormData.status}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, status: e.target.value })
                }
              >
                <option value="todo">{t.issues.todo}</option>
                <option value="in_progress">{t.issues.inProgress}</option>
                <option value="done">{t.issues.done}</option>
              </select>
            </div>
          </div>
          <div className="kanban-form-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setIssueToEdit(null);
              }}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit">{t.common.save}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}