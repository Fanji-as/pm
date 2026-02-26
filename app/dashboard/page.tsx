"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchProjects, createProject, deleteProject, logout } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { Plus, LogOut, Folder } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
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
      setError("Project name is required");
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
    if (!confirm("Are you sure you want to delete this project?")) return;

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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">PM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={18} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Projects</h2>
            <p className="mt-2 text-gray-600">
              Manage your projects and issues
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            New Project
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <Folder size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first project to get started
            </p>
            <Button onClick={() => setIsModalOpen(true)}>Create Project</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {project.members?.length || 0} member
                  {project.members?.length === 1 ? "" : "s"}
                </p>
                <Link href={`/projects/${project._id}`}>
                  <Button variant="secondary" className="w-full">
                    View Board
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject}>
          <Input
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="My Awesome Project"
            required
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
