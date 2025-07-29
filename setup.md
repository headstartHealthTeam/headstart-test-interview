# Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** installed and running
3. **npm** or **yarn**

## Quick Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Return to root
cd ..
```

### 2. Database Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE test_interview;
   ```

2. Create environment file:
   ```bash
   cd backend
   cp env.example .env
   ```

3. Update `backend/.env` with your database credentials:
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=test_interview
   JWT_SECRET=your_jwt_secret_key
   ```

### 3. Start the Application

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### 4. First Run

1. Open http://localhost:5173 in your browser
2. The application will automatically seed the database with sample questions
3. Enter candidate information to start the interview

## Development

### Backend Development
```bash
cd backend
npm run start:dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Migrations
The application uses TypeORM with `synchronize: true` for development, which automatically creates tables.

## Customization

### Adding Questions
Edit `backend/src/interview/interview.service.ts` in the `seedQuestions()` method.

### Styling
The frontend uses Tailwind CSS. Edit components in `frontend/src/components/` to modify the UI.

### API Endpoints
- `POST /api/interview/candidate` - Create candidate
- `GET /api/interview/questions` - Get questions
- `POST /api/interview/response/:candidateId` - Submit response
- `GET /api/interview/results/:candidateId` - Get results
- `POST /api/interview/seed` - Seed questions

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database exists: `test_interview`

### Port Conflicts
- Frontend: Change port in `frontend/vite.config.ts`
- Backend: Change port in `backend/src/main.ts`

### CORS Issues
Update CORS origin in `backend/src/main.ts` if using different frontend URL. 