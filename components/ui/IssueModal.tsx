"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { createIssue, updateIssue } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Checklist from "@/components/ui/Checklist";
import { X, Flag, Calendar } from "lucide-react";
import { animate } from "animejs";
import "@/styles/components/IssueModal.css";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface IssueType {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  checklist?: ChecklistItem[];
  assigneeId?: {
    _id: string;
    name: string;
  };
}

interface IssueModalProps {
  readonly issue: IssueType | null;
  readonly isOpen: boolean;
  readonly mode: "create" | "view" | "edit";
  readonly onClose: () => void;
  readonly onUpdate: () => void;
  readonly projectId: string;
  readonly projectMembers: readonly { _id: string; name: string }[];
  readonly isDarkMode: boolean;
  readonly triggerRect?: DOMRect | null;
}

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function IssueModal({
  issue,
  isOpen,
  mode: initialMode,
  onClose,
  onUpdate,
  projectId,
  projectMembers,
  isDarkMode,
}: Readonly<IssueModalProps>) {
  const { t } = useLanguage();
  const isCreateMode = initialMode === "create";
  const [error, setError] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "todo" as "todo" | "in_progress" | "done",
    assigneeId: "",
    checklist: [] as ChecklistItem[],
  });

  const memberOptions = projectMembers.map((m) => ({ value: m._id, label: m.name }));

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title,
        description: issue.description || "",
        priority: (issue.priority || "medium") as "low" | "medium" | "high",
        status: (issue.status || "todo") as "todo" | "in_progress" | "done",
        assigneeId: issue.assigneeId?._id || "",
        checklist: issue.checklist || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        assigneeId: "",
        checklist: [],
      });
    }
    setError("");
  }, [issue]);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      assigneeId: "",
      checklist: [],
    });
    setError("");
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    onClose();
  }, [onClose]);

  const handleSave = async () => {
    setError("");
    if (!formData.title.trim()) {
      setError(t.messages.titleRequired || "Title is required");
      if (modalRef.current) {
        animate(modalRef.current, {
          translateX: [-10, 10, -10, 10, 0],
          duration: 400,
          ease: "outQuad"
        });
      }
      return;
    }

    try {
      if (issue) {
        await updateIssue(issue._id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assigneeId: formData.assigneeId || undefined,
          status: formData.status,
          checklist: formData.checklist,
        });
      } else {
        await createIssue({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          assigneeId: formData.assigneeId || undefined,
          status: formData.status,
          checklist: formData.checklist,
          projectId,
        });
      }
      handleClose();
      onUpdate();
    } catch (err) {
      console.error("Failed to save issue:", err);
      setError(t.messages.failedToSave || "Failed to save");
    }
  };

  const handleAddChecklistItem = (text: string) => {
    setFormData((prev) => ({
      ...prev,
      checklist: [...prev.checklist, { id: generateId(), text, completed: false }],
    }));
  };

  const handleToggleChecklistItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const handleRemoveChecklistItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== id),
    }));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter") {
      handleClose();
    }
  };

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <dialog 
      ref={dialogRef}
      className="issue-modal-dialog" 
      onCancel={handleCancel}
    >
      <button
        type="button"
        className="issue-modal-backdrop"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        aria-label="Close modal"
        tabIndex={-1}
      />
      <div 
        ref={modalRef}
        className={`issue-modal ${isDarkMode ? "dark" : ""}`}
      >
        {/* Header */}
        <div className="issue-modal-header">
          <h2 className="issue-modal-title">
            {isCreateMode ? t.issues.newIssue : t.issues.title}
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Close">
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="issue-modal-content">
          <Input
            label={t.issues.issueTitle}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={t.messages.issueTitle}
            required
          />

          {/* Checklist */}
          <Checklist
            items={formData.checklist}
            onToggle={handleToggleChecklistItem}
            onRemove={handleRemoveChecklistItem}
            onAdd={handleAddChecklistItem}
            newItemValue={newChecklistItem}
            onNewItemChange={setNewChecklistItem}
            addPlaceholder={t.messages.addChecklistItem}
            emptyText={t.messages.noChecklist}
          />

          {/* Description */}
          <TextArea
            label={t.issues.description}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t.messages.describeIssue}
          />

          {/* Priority & Team Row */}
          <div className="issue-meta-grid">
            <div className="issue-meta-item">
              <span className="issue-meta-label">
                <Flag size={14} />
                <span>{t.issues.priority}</span>
              </span>
              <select
                className="issue-select-sm"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as typeof formData.priority })
                }
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t.issues[opt.value]}
                  </option>
                ))}
              </select>
            </div>

            <div className="issue-meta-item">
              <span className="issue-meta-label">
                <Calendar size={14} />
                <span>{t.issues.team}</span>
              </span>
              <select
                className="issue-select-sm"
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
              >
                <option value="">{t.issues.selectTeam}</option>
                {memberOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="issue-error">{error}</p>}

          {/* Footer */}
          <div className="issue-modal-footer">
            <Button variant="secondary" onClick={handleClose}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSave}>
              {isCreateMode ? t.messages.createIssue : t.common.save}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}