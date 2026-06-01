# TrackMyBooks-app

A system for tracking reading habits and managing a personal library.

## Architecture
The project is based on a microservices architecture using containerization:
- **Frontend:** Next.js (React)
- **Backend:** .NET / C#
- **Database:** PostgreSQL
- **Orchestration:** Docker Compose

## Running the Application
Docker Desktop must be installed to run the project.

1. **Build and first run:**
```bash
   docker compose up --build
```
2. **Subsequent runs:**
```bash
   docker compose up
```
## Testing
The system supports unit testing for both application layers.

**Backend (xUnit)**
```bash
cd backend/book-service.Tests
dotnet test
```
**Frontend (Vitest)**
```bash
cd frontend/track-my-books
npm test
```