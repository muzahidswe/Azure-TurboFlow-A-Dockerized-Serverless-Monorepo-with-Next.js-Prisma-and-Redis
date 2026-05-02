<p align="center">
  <img src="https://miro.medium.com/v2/resize:fit:1400/1*-lYKsAKOdvXMe4lkSnpRFA.png" width="100" alt="project-logo">
</p>
<p align="center">
    <h1 align="center">📈 Azure-TurboFlow: A Dockerized Serverless Monorepo with Next.js, Prisma, and Redis</h1>
</p>
<p align="center"> <em>Developed with the software and tools below.</em>
</p>

<p align="left">
  <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/typescript-%23007acc.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo">
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres">
  <img src="https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/azure_functions-0062AD?style=for-the-badge&logo=microsoft-azure&logoColor=white" alt="Azure Functions">
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx">
  <img src="https://img.shields.io/badge/CI/CD-pipeline-blue?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI/CD">
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions">
</p>
</p>


A high-performance, scalable Monorepo architecture featuring a **Next.js** frontend and backend, orchestrated with **Turbo**, powered by **Prisma**, and optimized with **Redis** caching. The entire ecosystem is containerized with **Docker**, proxied via **Nginx**, and engineered for Serverless deployment on **Azure Functions**.

## 🚀 Features
*   **Monorepo Structure**: Managed via [Turbo](https://turbo.build/) for lightning-fast builds and shared configurations.
*   **Next.js Framework**: Utilizing App Router for both Frontend and Backend (API) services.
*   **Database & ORM**: PostgreSQL database with [Prisma ORM](https://www.prisma.io/) for type-safe database access.
*   **Caching & Session**: Redis integration for high-speed data caching and secure token revocation (blacklist).
*   **Authentication**: JWT-based authentication with a secure server-side logout flow that clears Redis cache.
*   **Infrastructure**: 
    *   **Docker Compose**: One-command setup for the entire stack.
    *   **Nginx**: Reverse proxy to handle routing between Frontend (`/`) and Backend (`/api`).
*   **Strict Typing**: End-to-end TypeScript implementation.

---

## 📂 Project Structure
```text
.
├── apps/
│   ├── frontend/         # Next.js Client application
│   └── backend/          # Next.js API / Backend services
├── packages/             # Shared TypeScript/ESLint configs
├── nginx/                # Nginx reverse proxy configuration
├── docker-compose.yml    # Orchestration for DB, Redis, App & Nginx
├── turbo.json            # Turbo Repo pipeline configuration
└── .env                  # Global Environment variables
```


## 🛠 Tech Stack
- **Frontend & Backend** Full-stack framework (App Router), End-to-end type safety, Modern utility-first styling
- **Monorepo & Tooling** High-performance build system, Runtime environment
- **Database & Caching** Primary relational database, Next-generation ORM, High-speed caching & session management
**DevOps & Infrastructure** Serverless cloud hosting, Containerization & orchestration, Reverse proxy & load balancing, CI/CD automation


## 🛠️ Installation & Setup
### Prerequisites
- **Docker & Docker Compose**
- **Node.js v20+**
- **npm or pnpm**


## ⚡ Installation & Local Development
Clone the repository:
```bash
git clone https://github.com/muzahidswe/Azure-TurboFlow-A-Dockerized-Serverless-Monorepo-with-Next.js-Prisma-and-Redis.git
cd your-repo-name
Configure Environment Variables:
Create a .env file in the root directory:
```

## DB Configuration
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=monorepo_db
DATABASE_URL=postgresql://postgres:your_password@db:5432/monorepo_db
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_API_URL=http://localhost/api
Run the Infrastructure (Redis & DB):
```

🐳 Docker Deployment
To build and run the entire stack (including Nginx proxy) in production mode:

```Bash
# Build all images (Frontend & Backend)
docker compose build

# Start all services in detached mode
- docker compose up -d
- Services mapping:
- Frontend: http://localhost/
- Backend API: http://localhost/api
- PostgreSQL: localhost:5432
- Redis: localhost:6379
```