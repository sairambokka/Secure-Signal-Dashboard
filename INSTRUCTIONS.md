# **📌 Objective**

Build a secure full-stack web application that allows users to:

1. Register and log in with JWT-based authentication.
2. Submit “signals” (JSON payloads) to the backend.
3. View all submitted signals in a filterable dashboard.

This project is designed to assess your frontend, backend, and DevOps skills in a realistic, but time-bounded, environment.

# **🔹 Requirements**

**1. Backend (Node.js + Express)**

- Implement APIs:
    - POST /auth/signup – create user
    - POST /auth/login – return JWT token
    - POST /signals – create signal (authenticated)
    - GET /signals – list signals (authenticated, support filtering by type)
- 
- Store data in MongoDB (use MongoDB Atlas or a local instance).
- Apply JWT authentication for protected endpoints.
- Validate inputs and return appropriate error codes.
- Include minimal seed data or instructions for testing.

**2. Frontend (React or Next.js)**

- Build a simple UI with:
    - Signup/Login pages
    - A form to submit signals (type, message)
    - A dashboard to view signals (table or list) with a filter option

- Use fetch or axios to call backend APIs.
- Basic styling is fine (no need for design polish, just functional).

**3. DevOps & Quality**

- Dockerize both frontend and backend.
- Provide a docker-compose.yml to run the app with one command.
- Write at least 5 meaningful tests (unit or integration).
- Include a README with setup instructions and API documentation.

# **📋 Implementation Plan & Progress**

## **Phase 1: Backend Foundation (High Priority)**
- [x] 1. Set up project structure and initialize backend (Node.js + Express)
- [x] 2. Configure MongoDB connection and user/signal data models
- [x] 3. Implement authentication APIs (POST /auth/signup, POST /auth/login)
- [x] 4. Implement JWT middleware for protected routes
- [x] 5. Create signals APIs (POST /signals, GET /signals with filtering)

## **Phase 2: Frontend Development (High Priority)**
- [x] 7. Initialize React frontend project structure
- [x] 8. Create signup and login pages with forms
- [x] 9. Build signal submission form component
- [x] 10. Create dashboard component with signal list and filtering

## **Phase 3: Integration & Quality (Medium Priority)**
- [ ] 6. Add input validation and error handling to all endpoints
- [x] 11. Implement API integration with fetch/axios in frontend
- [ ] 13. Create Dockerfile for backend service
- [ ] 14. Create Dockerfile for frontend service
- [ ] 15. Write docker-compose.yml for full application stack
- [ ] 16. Write unit tests for authentication endpoints
- [ ] 17. Write unit tests for signals endpoints
- [ ] 18. Write integration tests for API workflows
- [ ] 20. Write comprehensive README with setup and API documentation

## **Phase 4: Polish (Low Priority)**
- [x] 12. Add basic styling and responsive design
- [ ] 19. Create seed data and database initialization scripts

## **Progress Notes**
*Track completed tasks and any issues encountered here*