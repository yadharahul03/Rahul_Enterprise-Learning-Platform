# 🎓 Enterprise Learning Platform

**AI-Powered Learning & Career Development Platform**

An all-in-one learning platform that combines structured courses, AI-driven personalized roadmaps, hands-on practice, and career tools — taking students from *"learning a skill"* to *"being job-ready"* in one connected experience.

Built by **Team C** | Full-Stack Project · React + Spring Boot + MySQL + Gemini AI
Working under the guidance of **Shakthi Gopalakrishnan**

[![Java](https://img.shields.io/badge/Java-17-orange)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen)]()
[![React](https://img.shields.io/badge/React-19-blue)]()
[![MySQL](https://img.shields.io/badge/MySQL-8+-lightblue)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup-spring-boot)
  - [Frontend Setup](#2-frontend-setup-react--vite)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Available Scripts](#-available-scripts)
- [User Roles & Permissions](#-user-roles--permissions)
- [Security Model](#-security-model)
- [Team & Contributions](#-team--contributions)
- [Git Workflow](#-git-workflow)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About the Project

Online learning today is often **generic**, **fragmented**, and disconnected from career outcomes — courses don't adapt to the learner, and certificates, practice, and career prep live on separate platforms. Students struggle to bridge the gap between *learning a skill* and *being job-ready*.

**Enterprise Learning Platform** solves this by unifying:
- Structured, catalog-based courses
- AI-generated personalized learning roadmaps
- Hands-on practice and assessments
- Career-readiness tools (resume builder, skill-gap analysis)
- Community and gamification

...into a single, connected student journey:

```
Sign Up → Assessment → AI Roadmap → Enroll → Practice → Certify → Apply
```

Each stage is backed by a real, persisted service — not mock data — so a student's progress, skill gaps, and generated roadmap all stay consistent across the platform as they move from onboarding to job-readiness.

---

## ✨ Features

| Feature | Description | Primary Owner |
|---|---|---|
| 📚 **Course Catalog** | Structured, browsable courses with lessons and progress tracking | Frontend + Backend |
| 🧭 **AI Roadmap Generator** | Gemini-powered personalized learning paths based on skill gaps | AI & Backend |
| 🤖 **AI Chatbot Assistant** | In-app Gemini-powered assistant for real-time learner support | AI |
| 📝 **Quizzes & Assignments** | Auto-graded quizzes and instructor-reviewed assignments | Backend |
| 📊 **Skill Gap Analysis** | Identifies missing skills against target career paths | AI & Backend |
| 🛠️ **Practice Modules** | Hands-on exercises to reinforce learning | Backend |
| 📄 **Resume Builder** | Generates job-ready resumes (PDF via iText) from learner profile & achievements | Backend |
| 🏆 **Leaderboard & Gamification** | Badges, points, and rankings to drive engagement | Backend |
| 💬 **Community Forum** | Threaded discussions with upvotes between learners | Backend + Frontend |
| 🎓 **Digital Certificates** | Verifiable certificates on course completion | Backend |
| 🔐 **Secure Auth** | JWT-based auth plus Google OAuth2 login | Security |
| 📅 **Live Sessions & Scheduling** | Session booking and instructor-led live classes (WebSocket/STOMP) | Backend |
| 🔔 **Notifications & Announcements** | Platform and course-level updates | Backend |
| 📈 **Role-based Dashboards** | Separate dashboards for Student, Instructor, and Admin | Frontend + Backend |

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- React Router v7
- Axios/fetch API client
- ESLint

**Backend**
- Spring Boot 3.5 (Java 17)
- Spring Security (JWT + Google OAuth2)
- Spring Data JPA / Hibernate
- MySQL 8+
- Lombok
- Spring Mail (email notifications)
- WebSocket / STOMP (live sessions, real-time notifications)
- iText (PDF generation for resumes & certificates)
- springdoc-openapi (planned — see [Roadmap](#-roadmap))

**AI Integration**
- Google Gemini API (AI Roadmap Generator + Chatbot)

**Build Tools**
- Maven (backend, via bundled `mvnw`)
- npm (frontend)

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────┐
│              Client Layer                 │
│   React + Vite UI  (localhost:5173)       │
│   ── Axios calls to VITE_API_BASE_URL     │
└─────────────────┬──────────────────────────┘
                   │ REST (JSON) over HTTPS, JWT in Authorization header
┌─────────────────▼──────────────────────────┐
│             Security Filter Chain           │
│   Spring Security · JWT validation          │
│   Google OAuth2 login handler               │
└─────────────────┬──────────────────────────┘
                   │
┌─────────────────▼──────────────────────────┐
│              Core Backend                   │
│   Spring Boot REST API (localhost:8080)     │
│   controller → service → repository         │
│   DTOs isolate entities from API responses  │
└──────┬───────────────────────────┬──────────┘
       │ Spring Data JPA           │ HTTPS
┌──────▼──────────┐      ┌─────────▼──────────┐
│   MySQL 8+       │      │   Google Gemini API │
│  skillsphere_db  │      │  (roadmap + chatbot) │
└──────────────────┘      └──────────────────────┘
```

**Request flow example — "Generate my AI roadmap":**
1. Student clicks *Generate Roadmap* in the React UI.
2. Axios sends a JWT-authenticated `POST` to the backend.
3. Spring Security validates the token and resolves the authenticated user.
4. The roadmap `service` layer pulls the student's skill-gap data via `repository`, builds a prompt, and calls the Gemini API.
5. Gemini's response is parsed, persisted (so the roadmap survives reloads), and returned to the client as a DTO.
6. The UI renders the roadmap; progress against it is tracked on subsequent visits.

---

## 📂 Project Structure

```
TeamC_EnterpriseLearning/
├── client/                          # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                      # Axios/fetch API client
│   │   ├── components/               # Pages & UI components
│   │   ├── context/                  # Auth, Theme, Toast contexts
│   │   └── data/
│   ├── .env.example
│   └── package.json
│
├── server/                          # Spring Boot backend
│   ├── src/main/java/com/skillsphere/server/
│   │   ├── controller/                # REST controllers (API surface)
│   │   ├── service/                   # Business logic (incl. Gemini calls)
│   │   ├── repository/                # Spring Data JPA repositories
│   │   ├── model/                     # JPA entities (never exposed directly)
│   │   ├── dto/                       # Request/response DTOs
│   │   ├── security/                  # JWT & OAuth2 handlers
│   │   ├── exception/                 # Global exception handling
│   │   └── config/                    # Security & app configuration
│   ├── src/main/resources/
│   │   └── application.properties.example
│   └── pom.xml
│
├── LICENSE
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Java (JDK) | 17 |
| Maven | Bundled (`mvnw` included) |
| MySQL | 8+ |

### 1. Backend Setup (Spring Boot)

```bash
cd server
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Edit `application.properties` with your local MySQL credentials, Google OAuth2 keys, JWT secret, mail credentials, and Gemini API key (see [Environment Variables](#-environment-variables)).

Create the database:

```sql
CREATE DATABASE skillsphere_db;
```

Run the backend:

```bash
# Windows
mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

Backend runs at **http://localhost:8080**.

### 2. Frontend Setup (React + Vite)

```bash
cd client
npm install
cp .env.example .env
```

`.env`:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

Run the frontend:

```bash
npm run dev
```

Frontend runs at **http://localhost:5173**.

---

## 🔑 Environment Variables

### Backend — `server/src/main/resources/application.properties`

| Variable | Description |
|---|---|
| `spring.datasource.url` | MySQL connection URL |
| `spring.datasource.username` / `password` | MySQL credentials |
| `spring.security.oauth2.client.registration.google.client-id` / `client-secret` | Google OAuth2 credentials |
| `jwt.secret` | 64-character HMAC-SHA256 secret for signing JWTs |
| `jwt.expiration` | Token expiry in ms (default: `86400000` = 24h) |
| `app.admin-secret-key` | Passkey required for admin account creation |
| `spring.mail.username` / `password` | Gmail address + App Password for email notifications |
| `app.frontend-url` | Frontend URL (for OAuth2 redirects/emails) |
| `gemini.api.key` | Google Gemini API key |
| `gemini.api.url` | Gemini `generateContent` endpoint |

> ⚠️ **Never commit real secrets.** `application.properties` and `.env` are git-ignored — only the `.example` templates are tracked. If a real key is ever committed, rotate it immediately rather than just removing it from the file.

### Frontend — `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API |

---

## 📡 API Overview

All endpoints are versionless under `/api` and expect a `Authorization: Bearer <jwt>` header except for `/api/auth/**` and public course-catalog reads. DTOs in `dto/` are the only shape ever returned — entities in `model/` are never serialized directly.

| Area | Example endpoints (indicative) |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/oauth2/callback` |
| Courses | `GET /api/courses`, `GET /api/courses/{id}`, `POST /api/courses/{id}/enroll` |
| Roadmap | `POST /api/roadmap/generate`, `GET /api/roadmap/me` |
| Quizzes | `GET /api/quizzes/{courseId}`, `POST /api/quizzes/{id}/submit` |
| Resume | `POST /api/resume/generate` |
| Certificates | `GET /api/certificates/me`, `GET /api/certificates/{id}/verify` |
| Forum | `GET /api/forum/threads`, `POST /api/forum/threads/{id}/replies` |
| Live Sessions | `GET /api/sessions`, WebSocket `/ws/sessions` |

> 📌 **Next step:** wire up `springdoc-openapi` so this table is generated and always accurate instead of hand-maintained (see [Roadmap](#-roadmap)).

---

## 📜 Available Scripts

### Frontend (`client/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

### Backend (`server/`)

| Command | Description |
|---|---|
| `./mvnw spring-boot:run` | Run the backend in dev mode |
| `./mvnw clean install` | Build the project and run tests |
| `./mvnw test` | Run backend tests only |
| `./mvnw clean package` | Package as a runnable JAR |

---

## 👥 User Roles & Permissions

| Role | Capabilities |
|---|---|
| 🎓 **Student** | Enroll in courses, track progress, take quizzes, generate AI roadmap, build resume, earn certificates |
| 🧑‍🏫 **Instructor** | Create courses, manage lessons, review assignments, monitor student performance, host live sessions |
| 🛡️ **Admin** | Oversee platform, manage users and roles, moderate forum content, ensure content quality |

Role is enforced at the Spring Security layer (method- or endpoint-level `@PreAuthorize`), not just hidden in the UI — the frontend should never be the only gatekeeper for role-restricted actions.

---

## 🔐 Security Model

- **Authentication:** JWT issued on login/registration, or via Google OAuth2 for social login. Tokens are validated on every request by a custom filter in `security/`.
- **Authorization:** Role-based access control (`STUDENT`, `INSTRUCTOR`, `ADMIN`) enforced server-side.
- **Admin provisioning:** Gated behind `app.admin-secret-key` rather than open self-registration.
- **Secrets:** Kept out of version control via `.example` templates; real values only ever live in local/deployed `application.properties` and `.env`.
- **Password storage:** Should use BCrypt hashing (via Spring Security) — never store plaintext credentials.

---

## 👨‍💻 Team & Contributions

**Team C** — Full-Stack Project, guided by **Shakthi Gopalakrishnan**

| Member | Role | Contribution |
|---|---|---|
| **Nandini Verma** | Frontend UI Lead | React pages, components, dashboards, courses, forms, and layouts |
| **Rahul** | Backend & API Architect | Spring Boot REST APIs, controllers, services, and business logic |
| **Rajeev** | Database Specialist | MySQL schema design, entities, repositories, and data relationships |
| **Sasi Madhuri** | Authentication & Security Engineer | Login/Signup, JWT, Google OAuth2, and Spring Security |
| **Madhumitha** | AI & Deployment Strategist | Gemini AI Chatbot integration, roadmap features, testing, and deployment |

---

## 🔀 Git Workflow

1. **Clone the repo**
   ```bash
   git clone https://github.com/nandiniverma29/TeamC_SkillSphere-learning-nexus-fsd.git
   ```
2. **Create a feature branch** off `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "Add: short description of change"
   ```
4. **Push your branch and open a Pull Request** into `main`
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Review & merge** — at least one teammate reviews before merging into `main`.
6. Keep `main` deployable at all times — avoid pushing directly to it once the team grows past solo work.

> 💡 **Suggestion:** Protect `main` on GitHub (require PR reviews, disable force-push) so no one accidentally overwrites shared history.

---

## 🩺 Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Backend fails to start, datasource error | MySQL not running or `skillsphere_db` not created | Start MySQL, run `CREATE DATABASE skillsphere_db;` |
| 401 on every API call | Missing/expired JWT, or `jwt.secret` mismatch between deploys | Re-login to refresh token; confirm `jwt.secret` is consistent |
| Google OAuth2 login redirects to error page | Redirect URI mismatch in Google Cloud Console | Ensure `app.frontend-url` matches the registered OAuth2 redirect URI |
| Gemini calls fail or return empty roadmap | Invalid/expired `gemini.api.key`, or malformed `gemini.api.url` | Verify key in Google AI Studio; check the `generateContent` endpoint URL |
| Emails not sending | Gmail App Password not used (regular password won't work) | Generate a Gmail **App Password** and use it for `spring.mail.password` |
| CORS errors in browser console | Frontend origin not allowed in backend CORS config | Add `http://localhost:5173` to the allowed origins in `config/` |

---

## 🗺️ Roadmap

**Near-term (recommended before scaling the team further):**
- 📄 **API documentation** — Add Swagger/OpenAPI (`springdoc-openapi`) so all REST endpoints are self-documented.
- 🧪 **Testing** — Expand backend unit/integration tests (`ServerApplicationTests.java` currently has minimal coverage); add frontend tests (Vitest/React Testing Library).
- ⚙️ **CI/CD** — GitHub Actions workflow to run `mvn test` and `npm run lint`/`build` on every PR before merge.
- 🐳 **Docker** — Containerize `client` and `server` with a `docker-compose.yml` (including MySQL) for one-command local setup.
- 🔒 **Branch protection** — Require PR reviews on `main`, disable force-push.

**Longer-term:**
- 📱 **Mobile App** — learn on the go
- 🤖 **Deeper AI Personalization** — richer, more adaptive roadmap generation
- 🤝 **Employer Partnerships** — internship and hiring integrations
- 👥 **Peer Mentorship** — structured mentor-mentee matching

---

## 🤝 Contributing

1. Pick up an issue or feature from the team backlog.
2. Follow the [Git Workflow](#-git-workflow) above — feature branch, clear commits, PR into `main`.
3. Keep entities (`model/`) out of API responses — always return through `dto/`.
4. Never commit real secrets — only `.example` templates belong in version control.
5. Add/update tests for any new service or controller logic where practical.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<p align="center">Made with ❤️ by <b>Team C</b></p>
