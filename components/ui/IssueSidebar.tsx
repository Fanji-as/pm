"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { updateIssue, deleteIssue } from "@/lib/api";
import { getPriorityStyles } from "@/lib/utils/priorityStyles";
import Button from "@/components/ui/Button";
import DeleteConfirm from "@/components/ui/DeleteConfirm";
import {
  X,
  Edit3,
  Trash2,
  User,
  Calendar,
  Flag,
  CheckCircle,
  Clock,
  Circle,
} from "lucide-react";

interface IssueType {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigneeId?: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface IssueSidebarProps {
  readonly issue: IssueType | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onUpdate: () => void;
  readonly projectMembers: readonly { _id: string; name: string }[];
  readonly isDarkMode: boolean;
}

export default function IssueSidebar({
  issue,
  isOpen,
  onClose,
  onUpdate,
  projectMembers,
  isDarkMode,
}: Readonly<IssueSidebarProps>) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    assigneeId: "",
  });

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title,
        description: issue.description || "",
        priority: issue.priority || "medium",
        status: issue.status || "todo",
        assigneeId: issue.assigneeId?._id || "",
      });
    }
  }, [issue]);

  const handleSave = async () => {
    if (issue === null) return;

    try {
      await updateIssue(issue._id, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority as "low" | "medium" | "high",
        assigneeId: formData.assigneeId || undefined,
        status: formData.status as "todo" | "in_progress" | "done",
      });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error("Failed to update issue:", err);
    }
  };

  const handleDelete = async () => {
    if (issue === null) return;

    try {
      await deleteIssue(issue._id);
      setIsDeleteModalOpen(false);
      onClose();
      onUpdate();
    } catch (err) {
      console.error("Failed to delete issue:", err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle size={16} className="text-green-500" />;
      case "in_progress":
        return <Clock size={16} className="text-blue-500" />;
      default:
        return <Circle size={16} className="text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo":
        return t.issues.todo;
      case "in_progress":
        return t.issues.inProgress;
      case "done":
        return t.issues.done;
      default:
        return status;
    }
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClose();
    }
  };

  if (issue === null) return null;

  const { bg: priorityBg, text: priorityText } = getPriorityStyles(issue.priority);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <button
          type="button"
          className={`sidebar-backdrop ${isOpen ? "open" : ""} ${isDarkMode ? "dark" : ""}`}
          onClick={onClose}
          onKeyDown={handleBackdropKeyDown}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div className={`issue-sidebar ${isOpen ? "open" : ""} ${isDarkMode ? "dark" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-header-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              aria-label="Edit"
            >
              <Edit3 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label="Delete"
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 size={16} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="sidebar-content">
          {/* Title */}
          {isEditing ? (
            <input
              type="text"
              className="sidebar-title-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t.issues.issueTitle}
            />
          ) : (
            <h2 className="sidebar-title">{issue.title}</h2>
          )}

          {/* Meta Info */}
          <div className="sidebar-meta">
            {/* Status */}
            <div className="meta-item">
              <span className="meta-label">
                {getStatusIcon(issue.status)}
                <span>{t.issues.status}</span>
              </span>
              {isEditing ? (
                <select
                  className="meta-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="todo">{t.issues.todo}</option>
                  <option value="in_progress">{t.issues.inProgress}</option>
                  <option value="done">{t.issues.done}</option>
                </select>
              ) : (
                <span className="meta-value">
                  {getStatusLabel(issue.status)}
                </span>
              )}
            </div>

            {/* Priority */}
            <div className="meta-item">
              <span className="meta-label">
                <Flag size={16} />
                <span>{t.issues.priority}</span>
              </span>
              {isEditing ? (
                <select
                  className="meta-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">{t.issues.low}</option>
                  <option value="medium">{t.issues.medium}</option>
                  <option value="high">{t.issues.high}</option>
                </select>
              ) : (
                <span
                  className="priority-badge-sidebar"
                  style={{ backgroundColor: priorityBg, color: priorityText }}
                >
                  {issue.priority}
                </span>
              )}
            </div>

            {/* Assignee */}
            <div className="meta-item">
              <span className="meta-label">
                <User size={16} />
                <span>{t.issues.team}</span>
              </span>
              {isEditing ? (
                <select
                  className="meta-select"
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                >
                  <option value="">{t.issues.selectTeam}</option>
                  {projectMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="meta-value">
                  {issue.assigneeId?.name || "-"}
                </span>
              )}
            </div>

            {/* Created Date */}
            {issue.createdAt && (
              <div className="meta-item">
                <span className="meta-label">
                  <Calendar size={16} />
                  <span>{t.issues.createdAt || "Created"}</span>
                </span>
                <span className="meta-value">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="sidebar-divider" />

          {/* Description */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">{t.issues.description}</h3>
            {isEditing ? (
              <textarea
                className="sidebar-textarea"
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t.messages.describeIssue}
              />
            ) : (
              <p className="sidebar-description">
                {issue.description || t.messages.noDescription || "No description"}
              </p>
            )}
          </div>

          {/* Save Button (only in edit mode) */}
          {isEditing && (
            <div className="sidebar-actions">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleSave}>
                {t.common.save}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirm
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t.issues.deleteIssue}
        message={t.messages.areYouSureDeleteIssue}
        itemName={issue.title}
        itemDescription={issue.description}
      />
    </>
  );
}