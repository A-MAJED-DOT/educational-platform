# EduPlatform

**Learn. Practice. Grow.**

EduPlatform is a web-based learning platform designed to help users learn programming and other skills through structured courses, lessons, video tutorials, quizzes, and progress tracking.

## Features

- Course Management
- Lesson Management
- Rich Text Lesson Editor
- YouTube Video Lessons
- Interactive Quiz System
- Quiz Results and History
- Learning Progress Tracking
- Dashboard and Learning Statistics
- Learning Streak Tracking

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/A-MAJED-DOT/educational-platform.git
```

### 2. Open the Project

```bash
cd educational-platform
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root and add your Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the placeholder values with your own Supabase project credentials.

**Never commit your `.env.local` file or secret credentials to GitHub.**

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
```

## Code Quality

Run ESLint:

```bash
npm run lint
```

## Database and Authentication

EduPlatform uses Supabase for:

- Database management
- User authentication
- Learning data storage
- Quiz and progress records

## Project Repository

[GitHub – EduPlatform](https://github.com/A-MAJED-DOT/educational-platform)

---

**EduPlatform – Learn. Practice. Grow.**