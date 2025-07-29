# Test Interview Application

A simple test interview application built with Vite, NestJS, TypeORM, PostgreSQL, and Tailwind CSS.

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Database**: PostgreSQL

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL installed and running
- npm or yarn

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd test-interview-app
   npm run install:all
   ```

2. **Database Setup:**

   **Option A: Using Docker (Recommended)**
   ```bash
   docker run --name test-interview-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=test_interview -p 5433:5432 -d postgres:15
   ```
   
   **Option B: Manual PostgreSQL Installation**
   - Create a PostgreSQL database named `test_interview`
   - Update database credentials in `backend/.env` if needed

3. **Environment Variables:**
   Create `backend/.env` file:
   
   **For Docker setup:**
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5433
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=password
   DATABASE_NAME=test_interview
   JWT_SECRET=your_jwt_secret_key
   ```
   
   **For manual PostgreSQL setup:**
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=test_interview
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

   This will start both frontend (http://localhost:5173) and backend (http://localhost:3000)

## Features

- **Simple Interview Flow**: Multiple choice questions with immediate feedback
- **Professional UI**: Clean, responsive design with Tailwind CSS
- **Real-time Scoring**: Automatic scoring and results display
- **Candidate Tracking**: Basic candidate information and response tracking

## Project Structure

```
├── frontend/          # Vite + React frontend
├── backend/           # NestJS backend
├── package.json       # Root package.json for workspace management
└── README.md         # This file
```

## Development

- Frontend runs on: http://localhost:5173
- Backend API runs on: http://localhost:3000
- API documentation available at: http://localhost:3000/api

## Usage

1. Open http://localhost:5173 in your browser
2. Enter candidate information
3. Answer the interview questions
4. View results and scores

## Customization

- Add/modify questions in `backend/src/data/questions.ts`
- Update styling in `frontend/src/` components
- Modify interview flow in `frontend/src/components/Interview.tsx` 