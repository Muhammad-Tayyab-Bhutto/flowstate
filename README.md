# FlowState

**Your Autonomous Execution Partner**

FlowState is a real-time visual AI agent that turns natural language into completed workflows. It watches your screen, understands your intent, and autonomously executes tasks while you focus on what matters.

## Architecture

```
flowstate/
├── frontend/           # Next.js 14 (Vercel)
├── backend/            # Fastify API (Cloud Run)
├── playwright-service/ # Browser automation (Cloud Run)
├── shared/             # Shared types & constants
└── infrastructure/     # Terraform/Pulumi (future)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TailwindCSS, NextAuth.js |
| Backend | Fastify, TypeScript, Zod |
| Database | Google Cloud Firestore |
| AI | Google Vertex AI (Gemini 1.5 Pro) |
| Automation | Playwright |
| Payments | Stripe |
| Storage | Google Cloud Storage |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Google Cloud account (for Firestore & Vertex AI)
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/flowstate.git
cd flowstate

# Install dependencies
npm install

# Build shared package
npm run build --workspace=shared

# Copy environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
cp playwright-service/.env.example playwright-service/.env
```

### Development

```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:3001
npm run dev:playwright # http://localhost:3002
```

### With Docker

```bash
# Start all services with Docker Compose
docker-compose up

# Rebuild after changes
docker-compose up --build
```

## Project Structure

### Frontend (`/frontend`)
- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/lib/` - Utilities and API client
- `src/hooks/` - Custom React hooks
- `src/stores/` - Zustand state stores

### Backend (`/backend`)
- `src/routes/` - Fastify route handlers
- `src/services/` - Business logic
- `src/agent/` - AI agent modules
- `src/plugins/` - Fastify plugins
- `src/config/` - Configuration

### Agent Modules
- `perception.ts` - Visual UI analysis via Gemini
- `planner.ts` - Next action decision making
- `executor.ts` - Playwright action execution
- `verifier.ts` - Result verification
- `orchestrator.ts` - Main agent loop

## Environment Variables

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Backend
```env
PORT=3001
JWT_SECRET=your-jwt-secret
FIREBASE_PROJECT_ID=your-project-id
STRIPE_SECRET_KEY=sk_test_xxx
VERTEX_AI_MODEL=gemini-1.5-pro
```

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy --prod
```

### Backend (Cloud Run)
```bash
gcloud run deploy flowstate-api \
  --source ./backend \
  --region us-central1 \
  --allow-unauthenticated
```

### Playwright Service (Cloud Run)
```bash
gcloud run deploy flowstate-playwright \
  --source ./playwright-service \
  --region us-central1 \
  --memory 4Gi \
  --cpu 4
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/register` | User registration |
| GET | `/api/v1/sessions` | List sessions |
| POST | `/api/v1/sessions` | Create session |
| WS | `/api/v1/agent/stream` | Real-time agent stream |
| POST | `/api/v1/billing/checkout` | Create checkout |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.
