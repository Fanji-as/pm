"use client";

import Button from "@/components/ui/Button";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import "@/styles/components/IssueModal.css";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistProps {
  items: readonly ChecklistItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (text: string) => void;
  newItemValue: string;
  onNewItemChange: (value: string) => void;
  addPlaceholder?: string;
  emptyText?: string;
}

export default function Checklist({
  items,
  onToggle,
  onRemove,
  onAdd,
  newItemValue,
  onNewItemChange,
  addPlaceholder = "Add item...",
  emptyText = "No items yet",
}: Readonly<ChecklistProps>) {
  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleAdd = () => {
    if (newItemValue.trim()) {
      onAdd(newItemValue.trim());
      onNewItemChange("");
    }
  };

  return (
    <div className="issue-checklist-section">
      <div className="issue-checklist-header">
        <h4 className="issue-checklist-title">
          Checklist ({completedCount}/{totalCount})
        </h4>
        {totalCount > 0 && (
          <div className="issue-progress-bar">
            <div
              className="issue-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>

      <div className="issue-checklist-input">
        <input
          type="text"
          placeholder={addPlaceholder}
          value={newItemValue}
          onChange={(e) => onNewItemChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="issue-checklist-text-input"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAdd}
          disabled={!newItemValue.trim()}
        >
          <Plus size={16} />
        </Button>
      </div>

      <div className="issue-checklist-items">
        {items.map((item) => (
          <div key={item.id} className="issue-checklist-item">
            <button
              type="button"
              className={`issue-checkbox ${item.completed ? "checked" : ""}`}
              onClick={() => onToggle(item.id)}
              aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {item.completed && <CheckCircle size={16} />}
            </button>
            <span className={`issue-checklist-text ${item.completed ? "completed" : ""}`}>
              {item.text}
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onRemove(item.id)}
              aria-label="Remove item"
              className="text-red-500"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="issue-checklist-empty">{emptyText}</p>
        )}
      </div>
    </div>
  );
}