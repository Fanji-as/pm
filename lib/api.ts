export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  _id: string;
  name: string;
  ownerId: any;
  members: any[];
  createdAt: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  projectId: string;
  assigneeId: any;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}

export async function fetchUser(): Promise<User> {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  const data = await res.json();
  return data.user;
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: User; token: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }

  return res.json();
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<{ user: User; token: string }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Registration failed");
  }

  return res.json();
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch projects");
  }

  const data = await res.json();
  return data.projects;
}

export async function createProject(name: string): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create project");
  }

  const data = await res.json();
  return data.project;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete project");
  }
}

export async function fetchIssues(projectId: string): Promise<Issue[]> {
  const res = await fetch(`/api/issues?projectId=${projectId}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch issues");
  }

  const data = await res.json();
  return data.issues;
}

export async function createIssue(data: {
  title: string;
  description: string;
  priority: string;
  projectId: string;
  assigneeId?: string;
}): Promise<Issue> {
  const res = await fetch("/api/issues", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create issue");
  }

  const responseData = await res.json();
  return responseData.issue;
}

export async function updateIssue(
  id: string,
  updates: Partial<Issue>,
): Promise<Issue> {
  const res = await fetch(`/api/issues/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error("Failed to update issue");
  }

  const data = await res.json();
  return data.issue;
}

export async function deleteIssue(id: string): Promise<void> {
  const res = await fetch(`/api/issues/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete issue");
  }
}
