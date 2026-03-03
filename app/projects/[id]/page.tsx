"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { fetchIssues, updateIssue, deleteIssue } from "@/lib/api";
import { KANBAN_COLUMNS } from "@/lib/constants";
import { getPriorityStyles } from "@/lib/utils/priorityStyles";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import DeleteConfirm from "@/components/ui/DeleteConfirm";
import IssueModal from "@/components/ui/IssueModal";
import {
  ArrowLeft,
  Plus,
  Trash2,
  User,
  Settings,
  UserPlus,
} from "lucide-react";
import "@/styles/components/IssueModal.css";
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

// Issue type definition
interface IssueType {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  checklist?: { id: string; text: string; completed: boolean }[];
  assigneeId?: {
    _id: string;
    name: string;
  };
  createdBy?: {
    _id: string;
    name: string;
  };
  createdAt?: string;
}

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

// DraggableIssue component
function DraggableIssue({
  issue,
  onDelete,
  onEdit,
  cardRefs,
}: {
  issue: IssueType;
  onDelete: (id: string) => void;
  onEdit: (issueData: IssueType) => void;
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
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

  // Calculate checklist progress
  const checklistCount = issue.checklist?.length ?? 0;
  const completedCount = issue.checklist?.filter((item) => item.completed).length ?? 0;

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".kanban-card-actions")) {
      return;
    }
    onEdit(issue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onEdit(issue);
    }
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (node) {
          cardRefs.current.set(issue._id, node);
        }
      }}
      {...attributes}
      {...listeners}
      className={`kanban-card ${isDragging ? "dragging" : ""}`}
      style={style}
    >
      <button
        type="button"
        className="kanban-card-button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Edit issue: ${issue.title}`}
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
        </div>
        <h4 className="kanban-card-title">{issue.title}</h4>
        <p className="kanban-card-description">{issue.description}</p>
        {checklistCount > 0 && (
          <div className="kanban-card-checklist">
            <span className="kanban-card-checklist-count">
              {completedCount}/{checklistCount} tasks
            </span>
            <div className="kanban-card-progress">
              <div
                className="kanban-card-progress-fill"
                style={{ width: `${Math.round((completedCount / checklistCount) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {issue.assigneeId && (
          <div className="kanban-card-assignee">
            <User size={14} />
            {issue.assigneeId.name}
          </div>
        )}
      </button>
      <div className="kanban-card-actions">
        <Button
          variant="ghost"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(issue._id);
          }}
          aria-label="Delete issue"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

export default function ProjectBoardPage() {
  const { t } = useLanguage();
  const params = useParams();
  const [issues, setIssues] = useState<IssueType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [projectMembers, setProjectMembers] = useState<{ _id: string; name: string }[]>([]);
  const [projectName, setProjectName] = useState("");

  // Issue modal state
  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueModalMode, setIssueModalMode] = useState<"create" | "view" | "edit">("edit");
  const [issueToDelete, setIssueToDelete] = useState<IssueType | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const openCreateModal = useCallback(() => {
    setSelectedIssue(null);
    setIssueModalMode("create");
    setIsIssueModalOpen(true);
  }, []);

  const openEditModal = useCallback((issue: IssueType) => {
    setSelectedIssue(issue);
    setIssueModalMode("edit");
    setIsIssueModalOpen(true);
  }, []);

  const closeIssueModal = useCallback(() => {
    setIsIssueModalOpen(false);
    setSelectedIssue(null);
  }, []);

  const handleDeleteIssue = useCallback((id: string) => {
    const issue = issues.find((i) => i._id === id);
    if (issue !== undefined) {
      setIssueToDelete(issue);
      setIsDeleteModalOpen(true);
    }
  }, [issues]);

  useEffect(() => {
    loadIssues();
    loadProjectMembers();

    // Initialize dark mode state
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = savedTheme === "dark" || 
      (savedTheme === null && globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(prefersDark);
    
    if (savedTheme) {
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    const handleThemeChange = (event: CustomEvent) => {
      const newTheme = event.detail as "light" | "dark";
      setIsDarkMode(newTheme === "dark");
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
    } catch (err) {
      console.error("Failed to load project members:", err);
    }
  };

  const loadIssues = async () => {
    try {
      const data = await fetchIssues(params.id as string);
      setIssues(data);
    } catch (err) {
      console.error("Failed to load issues:", err);
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

    if (over === null) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeIssue = issues.find((issue) => issue._id === activeId);
    if (activeIssue === undefined) return;

    const newStatus = overId as "todo" | "in_progress" | "done";

    if (activeIssue.status === newStatus) return;

    try {
      await updateIssue(activeId, { status: newStatus });
      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === activeId ? { ...issue, status: newStatus } : issue,
        ),
      );
    } catch (err) {
      console.error("Failed to update issue status:", err);
    }
  };

  const confirmDeleteIssue = async () => {
    if (issueToDelete === null) return;

    try {
      await deleteIssue(issueToDelete._id);
      setIsDeleteModalOpen(false);
      setIssueToDelete(null);
      loadIssues();
    } catch (err) {
      console.error("Failed to delete issue:", err);
    }
  };

  const getIssuesByStatus = (status: string) => {
    return issues.filter((issue) => issue.status === status);
  };

  const handleInviteUser = async () => {
    if (inviteEmail.trim() === "") {
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
    } catch (err) {
      console.error("Failed to invite user:", err);
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
              <Button onClick={openCreateModal}>
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

              const columnIssues = getIssuesByStatus(column.id);

              return (
                <DroppableColumn
                  key={column.id}
                  id={column.id}
                  title={getColumnTitle()}
                  count={columnIssues.length}
                  bgColor={columnBg}
                >
                  <SortableContext
                    items={columnIssues.map((i) => i._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnIssues.map((issue) => (
                      <DraggableIssue
                        key={issue._id}
                        issue={issue}
                        onDelete={handleDeleteIssue}
                        onEdit={openEditModal}
                        cardRefs={cardRefs}
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

      {/* Invite Modal */}
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

      {/* Delete Confirmation */}
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

      {/* Unified Issue Modal - Create / Edit with Checklist */}
      <IssueModal
        issue={selectedIssue}
        isOpen={isIssueModalOpen}
        mode={issueModalMode}
        onClose={closeIssueModal}
        onUpdate={loadIssues}
        projectId={params.id as string}
        projectMembers={projectMembers}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}