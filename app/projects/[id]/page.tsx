"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchIssues, createIssue, updateIssue, deleteIssue } from "@/lib/api";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { ArrowLeft, Plus, Trash2, User } from "lucide-react";
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

const COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-gray-100" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-100" },
  { id: "done", title: "Done", color: "bg-green-100" },
];

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[issue.priority as keyof typeof PRIORITY_COLORS]}`}
        >
          {issue.priority}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(issue._id);
          }}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <h4 className="font-medium text-gray-900 mb-2">{issue.title}</h4>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {issue.description}
      </p>
      {issue.assigneeId && (
        <div className="flex items-center text-xs text-gray-500">
          <User size={14} className="mr-1" />
          {issue.assigneeId.name}
        </div>
      )}
    </div>
  );
}

export default function ProjectBoardPage() {
  const params = useParams();
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
  });
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    loadIssues();
  }, [params.id]);

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
      setError("Title and description are required");
      return;
    }

    try {
      await createIssue({
        ...formData,
        projectId: params.id as string,
      });
      setFormData({ title: "", description: "", priority: "medium" });
      setIsModalOpen(false);
      loadIssues();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteIssue = async (id: string) => {
    if (!confirm("Are you sure you want to delete this issue?")) return;

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={18} className="mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Board</h1>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={18} className="mr-2" />
              New Issue
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map((column) => (
              <div key={column.id} className={`${column.color} rounded-lg p-4`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {column.title} ({getIssuesByStatus(column.id).length})
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
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 opacity-50">
                {issues.find((issue) => issue._id === activeId)?.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Issue"
      >
        <form onSubmit={handleCreateIssue}>
          <div className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Issue title"
              required
            />
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the issue..."
                required
              />
            </div>
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Priority
              </label>
              <select
                id="priority"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Issue</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
