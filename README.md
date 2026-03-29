<<<<<<< HEAD
Campus Club Event Management System (MERN)
=========================================

Overview
--------
Full-stack MERN application for managing campus club events with three roles: student, organizer, and admin. Includes JWT auth, role-based access, event browsing/registration, organizer CRUD, and admin controls.

Project Structure
-----------------
- `backend` (Node.js + Express + MongoDB/Mongoose)
- `frontend` (React + Vite + React Router + Axios)

Requirements
------------
- Node.js 18+
- MongoDB 6+ (local or Atlas)

Environment Variables
---------------------
Backend (`backend`):
- `PORT` (default: 5000)
- `MONGO_URI` (e.g., mongodb://127.0.0.1:27017/campus_club_mgmt)
- `JWT_SECRET` (set a strong secret for production)
- `JWT_EXPIRES_IN` (default: 7d)
- `CLIENT_URL` (default: http://localhost:5173)

Frontend (`frontend`):
- `VITE_API_URL` (default: http://localhost:5000/api)

Setup
-----
1) Backend
   - cd backend
   - npm install
   - Create `.env` with variables above
   - npm run dev

2) Frontend
   - cd frontend
   - npm install
   - Create `.env` with `VITE_API_URL=http://localhost:5000/api`
   - npm run dev

Default URLs
------------
- Backend API: http://localhost:5000/api
- Frontend: http://localhost:5173

API Endpoints (Summary)
-----------------------
Auth:
- POST `/api/auth/register` { name, email, password, role?, clubId? }
- POST `/api/auth/login` { email, password }

Users (admin only unless noted):
- GET `/api/users/me` (auth)
- GET `/api/users` (admin)
- PUT `/api/users/:id` (admin)
- DELETE `/api/users/:id` (admin)

Clubs:
- GET `/api/clubs`
- POST `/api/clubs` (admin)
- PUT `/api/clubs/:id` (admin)
- DELETE `/api/clubs/:id` (admin)

Events:
- GET `/api/events`
- GET `/api/events/:id`
- POST `/api/events` (organizer/admin)
- PUT `/api/events/:id` (organizer/admin)
- DELETE `/api/events/:id` (organizer/admin)
- GET `/api/events/:id/participants` (organizer/admin)

Registrations (auth):
- GET `/api/registrations/me`
- POST `/api/registrations` { eventId }
- PATCH `/api/registrations/:id/cancel`

Roles and Access
----------------
- Student: browse events, view event details, register/cancel own registrations.
- Organizer: create/update/delete events for own `clubId`, view participants.
- Admin: manage users, clubs, and any event.

Production Notes
----------------
- Set strong `JWT_SECRET` and secure CORS.
- Use a hosted MongoDB (e.g., Atlas).
- Build frontend (`npm run build`) and deploy behind a reverse proxy (Nginx).
- Consider enabling HTTPS, request logging, and monitoring.

License
-------
MIT

=======
# Campus_club_management_system
Campus Club Event Management System is a MERN stack web app that simplifies managing college events. Students can browse and register for events, while organizers can create and manage them. It replaces manual methods with a centralized, user-friendly platform for better organization and efficiency.
>>>>>>> 421dff1bccd08820824693a44a59ca5012b01934
