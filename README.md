# Qubes CRM

A streamlined, serverless customer relationship management platform for managing Academy and Agency lead pipelines, tasks, students, and finances.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

The project is already set up with all dependencies installed. If you need to reinstall:

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
├── app/
│   ├── (dashboard)/          # Main application pages
│   │   ├── page.tsx          # Dashboard
│   │   ├── leads/            # Lead management
│   │   ├── tasks/            # Task management
│   │   ├── students/         # Student management
│   │   └── finance/          # Finance tracking
│   ├── globals.css           # Global styles with B/W theme
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── layout/               # Sidebar, Topbar
│   └── features/             # Feature-specific components
├── lib/
│   ├── utils.ts              # Utility functions
│   └── supabase.ts           # Supabase client config
├── types/
│   └── database.types.ts     # TypeScript database types
└── schema.sql                # Database schema for Supabase
```

## Features

### ✅ Implemented

- **Dashboard** - Summary statistics and metrics
- **Lead Management** - Dual pipeline (Academy & Agency) with stage tracking
- **Task Management** - Create, assign, and track tasks with priorities
- **Student Management** - Enrollment tracking and fee management
- **Finance Module** - Income and expense tracking with categorization
- **Minimalist B/W UI** - Clean, professional interface

### 🚧 Pending Integration

- **Supabase Backend** - Database integration
- **Authentication** - User login/signup
- **Real-time Updates** - Live data synchronization
- **Push Notifications** - Browser notifications for tasks and updates

## Supabase Setup (Required for Full Functionality)

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run the SQL schema:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents from `schema.sql`
   - Execute the SQL

3. Create `.env.local` file in project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Restart the dev server

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Tables**: TanStack Table
- **Backend**: Supabase (Postgres + Auth + Realtime)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Current Status

The application is running with **mock data** for demonstration. All UI components and pages are functional. To enable full CRUD operations and real-time features, complete the Supabase integration steps above.
