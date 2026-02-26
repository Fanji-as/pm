# PM - Project Management App

A minimal PM-like project management application built with Next.js 14, TypeScript, MongoDB, and Tailwind CSS.

## Features

- User Authentication (Register/Login)
- Create Projects
- Create Issues (Tasks)
- Kanban Board (Todo, In Progress, Done)
- Drag and Drop to change status
- Assign users to issues
- Basic dashboard

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: CSS (separate files, organized in `styles/` directory)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **State Management**: Zustand
- **Drag & Drop**: dnd-kit

## Struktur Folder

```
app/
├── api/              # Backend API routes (auth, projects, issues)
├── dashboard/         # Frontend pages
├── login/
├── projects/
│   └── [id]/
├── register/
├── globals.css         # Global styles
├── layout.tsx         # Root layout
└── page.tsx            # Homepage
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── mongodb.ts
│   └── utils.ts
├── models/
│   ├── Issue.ts
│   ├── Project.ts
│   └── User.ts
├── store/
│   └── useAuthStore.ts
├── styles/             # CSS styles terpisah
│   ├── components/
│   │   ├── Button.css
│   │   ├── Card.css
│   │   └── Input.css
│   ├── pages/
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   └── Kanban.css
│   ├── styles.css        # Main styles file
│   └── README.md         # Dokumentasi styles
├── middleware.ts        # Middleware untuk proteksi route
├── .env.example        # Contoh environment variables
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

Struktur folder sudah benar untuk aplikasi Next.js 14:

- `app/api/` - Berisi semua API endpoints (backend)
- `app/` - Berisi semua halaman frontend
- `components/` - Berisi komponen UI reusable
- `models/` - Berisi model database Mongoose
- `lib/` - Berisi fungsi helper
- `store/` - Berisi state management Zustand
- `styles/` - Berisi style CSS terpisah (tidak menggunakan Tailwind inline classes)

Ini adalah struktur standar Next.js 14 yang sudah dipisih sesuai best practices.

## Folder Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── register/route.ts
│   │   ├── issues/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── projects/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── projects/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── mongodb.ts
│   └── utils.ts
├── models/
│   ├── Issue.ts
│   ├── Project.ts
│   └── User.ts
├── store/
│   └── useAuthStore.ts
├── styles/
│   ├── components/
│   │   ├── Button.css
│   │   ├── Card.css
│   │   └── Input.css
│   ├── pages/
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   └── Kanban.css
│   ├── styles.css
│   └── README.md
├── middleware.ts
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/PM

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For MongoDB Atlas (Cloud):**

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/PM?retryWrites=true&w=majority
```

### 3. Run MongoDB

**Local MongoDB:**

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Download and install from https://www.mongodb.com/try/download/community
```

**MongoDB Atlas:**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Add it to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Register**: Create a new account
2. **Login**: Sign in with your credentials
3. **Create Project**: Click "New Project" on the dashboard
4. **Create Issues**: Click "New Issue" on the project board
5. **Manage Issues**: Drag and drop issues between columns to change status

## Database Models

### User

```typescript
{
  name: string;
  email: string(unique);
  password: string(hashed);
  createdAt: Date;
}
```

### Project

```typescript
{
  name: string;
  ownerId: ObjectId;
  members: ObjectId[];
  createdAt: Date;
}
```

### Issue

```typescript
{
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  projectId: ObjectId;
  assigneeId: ObjectId | null;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## Deploy to Vercel

### 1. Prepare for Deployment

1. Push your code to GitHub
2. Make sure `.env.local` is in `.gitignore`

### 2. Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the following variables:
   - `MONGODB_URI` (your MongoDB connection string)
   - `JWT_SECRET` (generate a secure random string)

### 3. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### 4. MongoDB Atlas for Production

For production, use MongoDB Atlas:

1. Create a free cluster on MongoDB Atlas
2. Whitelist Vercel's IP addresses (0.0.0.0/0)
3. Get your connection string
4. Add it to Vercel environment variables

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Projects

- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `DELETE /api/projects/[id]` - Delete project

### Issues

- `GET /api/issues?projectId=xxx` - Get project issues
- `POST /api/issues` - Create new issue
- `PATCH /api/issues/[id]` - Update issue
- `DELETE /api/issues/[id]` - Delete issue

## License

MIT

## Notes

- This is a minimal MVP for demonstration purposes
- No email notifications, complex permissions, or analytics
- JWT tokens expire in 7 days
- Passwords are hashed with bcrypt
- All routes are protected by middleware except auth routes
