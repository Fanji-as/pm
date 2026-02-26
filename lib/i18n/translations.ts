export const translations = {
  en: {
    // Common
    common: {
      appName: "PM - Project Management",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      back: "Back",
      search: "Search",
      noResults: "No results found",
      confirm: "Are you sure?",
      yes: "Yes",
      no: "No",
    },
    // Navigation
    nav: {
      dashboard: "Dashboard",
      projects: "Projects",
      login: "Login",
      register: "Register",
      logout: "Logout",
    },
    // Auth
    auth: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      name: "Name",
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      loginSuccess: "Login successful",
      logoutSuccess: "Logout successful",
      registerSuccess: "Registration successful",
      invalidCredentials: "Invalid email or password",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      nameRequired: "Name is required",
      passwordMismatch: "Passwords do not match",
    },
    // Dashboard
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome back",
      myProjects: "My Projects",
      recentActivity: "Recent Activity",
      noProjects: "No projects yet",
      createFirst: "Create your first project",
      newProject: "New Project",
    },
    // Projects
    projects: {
      title: "Projects",
      newProject: "New Project",
      projectName: "Project Name",
      description: "Description",
      createProject: "Create Project",
      deleteProject: "Delete Project",
      noProjects: "No projects found",
      confirmDelete: "Are you sure you want to delete this project?",
    },
    // Issues
    issues: {
      title: "Issues",
      newIssue: "New Issue",
      issueTitle: "Title",
      description: "Description",
      priority: "Priority",
      status: "Status",
      assignee: "Assignee",
      createIssue: "Create Issue",
      deleteIssue: "Delete Issue",
      confirmDelete: "Are you sure you want to delete this issue?",
      // Status
      todo: "To Do",
      inProgress: "In Progress",
      done: "Done",
      // Priority
      low: "Low",
      medium: "Medium",
      high: "High",
    },
    // Board
    board: {
      title: "Board",
    },
    // Theme
    theme: {
      light: "Light",
      dark: "Dark",
      system: "System",
    },
    // Language
    language: {
      en: "English",
      id: "Bahasa Indonesia",
    },
  },
  
  id: {
    // Common
    common: {
      appName: "PM - Manajemen Proyek",
      loading: "Memuat...",
      save: "Simpan",
      cancel: "Batal",
      delete: "Hapus",
      edit: "Ubah",
      create: "Buat",
      back: "Kembali",
      search: "Cari",
      noResults: "Tidak ada hasil",
      confirm: "Apakah Anda yakin?",
      yes: "Ya",
      no: "Tidak",
    },
    // Navigation
    nav: {
      dashboard: "Dasbor",
      projects: "Proyek",
      login: "Masuk",
      register: "Daftar",
      logout: "Keluar",
    },
    // Auth
    auth: {
      login: "Masuk",
      register: "Daftar",
      email: "Email",
      password: "Kata Sandi",
      confirmPassword: "Konfirmasi Kata Sandi",
      name: "Nama",
      forgotPassword: "Lupa kata sandi?",
      noAccount: "Belum punya akun?",
      hasAccount: "Sudah punya akun?",
      loginSuccess: "Berhasil masuk",
      logoutSuccess: "Berhasil keluar",
      registerSuccess: "Pendaftaran berhasil",
      invalidCredentials: "Email atau kata sandi salah",
      emailRequired: "Email wajib diisi",
      passwordRequired: "Kata sandi wajib diisi",
      nameRequired: "Nama wajib diisi",
      passwordMismatch: "Kata sandi tidak cocok",
    },
    // Dashboard
    dashboard: {
      title: "Dasbor",
      welcome: "Selamat datang kembali",
      myProjects: "Proyek Saya",
      recentActivity: "Aktivitas Terbaru",
      noProjects: "Belum ada proyek",
      createFirst: "Buat proyek pertama Anda",
      newProject: "Proyek Baru",
    },
    // Projects
    projects: {
      title: "Proyek",
      newProject: "Proyek Baru",
      projectName: "Nama Proyek",
      description: "Deskripsi",
      createProject: "Buat Proyek",
      deleteProject: "Hapus Proyek",
      noProjects: "Tidak ada proyek",
      confirmDelete: "Apakah Anda yakin ingin menghapus proyek ini?",
    },
    // Issues
    issues: {
      title: "Masalah",
      newIssue: "Masalah Baru",
      issueTitle: "Judul",
      description: "Deskripsi",
      priority: "Prioritas",
      status: "Status",
      assignee: "Penerima Tugas",
      createIssue: "Buat Masalah",
      deleteIssue: "Hapus Masalah",
      confirmDelete: "Apakah Anda yakin ingin menghapus masalah ini?",
      // Status
      todo: "Akan Dilakukan",
      inProgress: "Sedang Dikerjakan",
      done: "Selesai",
      // Priority
      low: "Rendah",
      medium: "Sedang",
      high: "Tinggi",
    },
    // Board
    board: {
      title: "Papan",
    },
    // Theme
    theme: {
      light: "Terang",
      dark: "Gelap",
      system: "Sistem",
    },
    // Language
    language: {
      en: "English",
      id: "Bahasa Indonesia",
    },
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = typeof translations.en;